/**
 * Agent executor - the core agent loop
 *
 * Redesigned architecture:
 * 1. User sends message
 * 2. Agent calls Cone (LLM via Plexus)
 * 3. Parse tool calls from <tool>...</tool> markers
 * 4. Execute tools via Synapse CLI (bash.execute)
 * 5. Send results back to Cone
 * 6. Loop until no more tool calls
 */

import type { Agent, AgentConfig, AgentEvent, ToolCall, Tool } from './types';
import { Cone } from '@plexus/client';
import { executeSynapse } from './synapse';
import { buildToolsPrompt, formatToolResult } from './tools';

// ============================================================================
// Tool Call Parsing
// ============================================================================

/**
 * Parse tool calls from LLM output
 *
 * LLM outputs tool calls as:
 *   <tool>{"name":"tool_name","input":{...}}</tool>
 *
 * This function extracts all such markers and parses them.
 */
function parseToolCalls(text: string): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  const regex = /<tool>(.*?)<\/tool>/gs;
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const json = match[1].trim();
      const parsed = JSON.parse(json);

      if (parsed.name && parsed.input !== undefined) {
        toolCalls.push({
          id: `tool_${Date.now()}_${toolCalls.length}`,
          name: parsed.name,
          input: parsed.input
        });
      }
    } catch (err) {
      // Invalid JSON in tool marker - skip it
      console.error('Failed to parse tool call:', match[1], err);
    }
  }

  return toolCalls;
}

/**
 * Strip tool markers from text for clean display
 *
 * Removes <tool>...</tool> blocks from the text.
 */
function stripToolMarkers(text: string): string {
  return text.replace(/<tool>.*?<\/tool>/gs, '').trim();
}

// ============================================================================
// System Prompt Building
// ============================================================================

/**
 * Build the complete system prompt including tool instructions
 *
 * This teaches the LLM how to use tools via <tool>...</tool> markers.
 */
function buildSystemPrompt(baseSystem: string, tools: Tool[]): string {
  const toolsPrompt = buildToolsPrompt(tools);

  return `${baseSystem}

# Tool Calling

You have access to tools that can help you complete tasks. To use a tool, output EXACTLY:

<tool>
{"name": "tool_name", "input": {"param": "value"}}
</tool>

${toolsPrompt}

Important:
- Output tool calls as valid JSON inside <tool> tags
- You can call multiple tools in one response
- After tool results are provided, give a final answer to the user
- Do not explain the tool call, just output it
`;
}

// ============================================================================
// Agent Implementation
// ============================================================================

export class AgentExecutor implements Agent {
  constructor(public config: AgentConfig) {}

  async ask(message: string): Promise<string> {
    let finalResponse = '';

    for await (const event of this.run(message)) {
      if (event.type === 'done') {
        finalResponse = event.finalResponse;
      }
    }

    return finalResponse;
  }

  async *run(message: string): AsyncIterable<AgentEvent> {
    const cone = new Cone.ConeClientImpl(this.config.rpc);
    const tools = this.config.tools.list();
    const systemPrompt = buildSystemPrompt(this.config.system, tools);
    const maxTurns = this.config.maxTurns || 10;
    const maxToolCallsPerTurn = this.config.maxToolCallsPerTurn || 5;

    // No conversion needed - coneId is already properly typed as ConeIdentifier
    const identifier = this.config.coneId;

    let turn = 0;
    let currentPrompt = message;

    while (turn < maxTurns) {
      turn++;
      yield { type: 'thinking', message: `Turn ${turn}` };

      try {
        // Stream from Cone
        let fullResponse = '';
        let responseComplete = false;

        for await (const event of cone.chat(
          identifier,
          currentPrompt,
          this.config.ephemeral || false
        )) {
          if (event.type === 'chat_content') {
            // Streaming text content from Cone
            fullResponse += event.content;

            // Emit chunks without tool markers for clean display
            const cleanChunk = stripToolMarkers(event.content);
            if (cleanChunk) {
              yield { type: 'response_chunk', text: cleanChunk };
            }
          } else if (event.type === 'chat_complete') {
            responseComplete = true;

            // Parse tool calls from the complete response
            const toolCalls = parseToolCalls(fullResponse);

            if (toolCalls.length === 0) {
              // No tool calls - we're done!
              const finalText = stripToolMarkers(fullResponse);
              yield { type: 'response_complete', text: finalText };
              yield { type: 'done', finalResponse: finalText };
              return;
            }

            // Check tool call limit
            if (toolCalls.length > maxToolCallsPerTurn) {
              const error = `Too many tool calls (${toolCalls.length}), max is ${maxToolCallsPerTurn}`;
              yield { type: 'error', error };
              return;
            }

            // Execute tools
            const results = await this.executeTools(toolCalls);

            // Yield tool results
            for (let i = 0; i < toolCalls.length; i++) {
              const call = toolCalls[i];
              const result = results[i];
              yield {
                type: 'tool_result',
                tool: call.name,
                result: result.success ? result.value : result.error,
                error: !result.success
              };
            }

            // Build next prompt with tool results
            currentPrompt = this.formatToolResultsPrompt(toolCalls, results);

            // Continue loop to send results back to Cone
            break;
          } else if (event.type === 'error') {
            yield { type: 'error', error: event.message };
            return;
          }
        }

        if (!responseComplete) {
          yield { type: 'error', error: 'Cone response incomplete' };
          return;
        }

        yield { type: 'turn_complete', turn };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        yield { type: 'error', error: errorMsg };
        return;
      }
    }

    // Max turns reached
    yield { type: 'error', error: 'Maximum turns reached without completion' };
  }

  /**
   * Execute multiple tool calls via Synapse
   */
  private async executeTools(
    toolCalls: ToolCall[]
  ): Promise<Array<{ success: boolean; value?: unknown; error?: string }>> {
    const results = [];

    for (const call of toolCalls) {
      const tool = this.config.tools.get(call.name);
      if (!tool) {
        results.push({
          success: false,
          error: `Tool not found: ${call.name}`
        });
        continue;
      }

      try {
        const synapseCmd = tool.toSynapseCommand(call.input);
        const result = await executeSynapse(this.config.rpc, synapseCmd);

        if (result.success) {
          results.push({
            success: true,
            value: result.data
          });
        } else {
          results.push({
            success: false,
            error: result.stderr || `Command failed with exit code ${result.exitCode}`
          });
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  /**
   * Format tool results into a prompt for the next turn
   */
  private formatToolResultsPrompt(
    toolCalls: ToolCall[],
    results: Array<{ success: boolean; value?: unknown; error?: string }>
  ): string {
    const lines = ['Tool results:'];

    for (let i = 0; i < toolCalls.length; i++) {
      const call = toolCalls[i];
      const result = results[i];

      lines.push('');
      lines.push(`Tool: ${call.name}`);
      lines.push(`Input: ${JSON.stringify(call.input)}`);

      if (result.success) {
        lines.push(`Result: ${formatToolResult(result.value)}`);
      } else {
        lines.push(`Error: ${result.error}`);
      }
    }

    lines.push('');
    lines.push('Provide a final answer to the user based on these results.');

    return lines.join('\n');
  }
}

// ============================================================================
// Agent Builder
// ============================================================================

/**
 * Fluent API for building agents
 */
export class AgentBuilder {
  private config: Partial<AgentConfig> = {};

  constructor(name: string) {
    this.config.name = name;
  }

  /**
   * Set the system prompt
   */
  withSystem(system: string): this {
    this.config.system = system;
    return this;
  }

  /**
   * Set the Cone identifier
   */
  withCone(coneId: Cone.ConeIdentifier): this {
    this.config.coneId = coneId;
    return this;
  }

  /**
   * Set the RPC client
   */
  withRPC(rpc: AgentConfig['rpc']): this {
    this.config.rpc = rpc;
    return this;
  }

  /**
   * Set the tool registry
   */
  withTools(tools: AgentConfig['tools']): this {
    this.config.tools = tools;
    return this;
  }

  /**
   * Set ephemeral mode (conversation not persisted)
   */
  ephemeral(enabled: boolean): this {
    this.config.ephemeral = enabled;
    return this;
  }

  /**
   * Set maximum turns
   */
  maxTurns(max: number): this {
    this.config.maxTurns = max;
    return this;
  }

  /**
   * Set maximum tool calls per turn
   */
  maxToolCallsPerTurn(max: number): this {
    this.config.maxToolCallsPerTurn = max;
    return this;
  }

  /**
   * Build the agent
   */
  build(): Agent {
    if (!this.config.name) throw new Error('Agent name is required');
    if (!this.config.system) throw new Error('System prompt is required');
    if (!this.config.coneId) throw new Error('Cone ID is required');
    if (!this.config.rpc) throw new Error('RPC client is required');
    if (!this.config.tools) throw new Error('Tool registry is required');

    return new AgentExecutor(this.config as AgentConfig);
  }
}

/**
 * Create an agent builder
 */
export function createAgent(name: string): AgentBuilder {
  return new AgentBuilder(name);
}
