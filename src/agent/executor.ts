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
import { ToolCallStreamParser } from './stream-parser';

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

# Available Tools

${toolsPrompt}

## IMPORTANT: Tool Usage Instructions

To call a tool, you MUST use this EXACT XML format with the tool call on its own line:

<tool>{"name": "synapse_call", "input": {"activation": "health", "method": "check", "params": {}}}</tool>

DO NOT make up responses. DO NOT use other formats. If you need information from the system, you MUST call the synapse_call tool.

Example conversation:
User: Is the system healthy?
You: Let me check the system status.

<tool>{"name": "synapse_call", "input": {"activation": "health", "method": "check", "params": {}}}</tool>

[I will execute the tool and give you the result]
System Result: {"status":"healthy"}
You: The system is healthy!
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
        // Create streaming parser for this turn
        const parser = new ToolCallStreamParser();
        let fullVisibleText = '';
        const allToolCalls: ToolCall[] = [];
        let responseComplete = false;

        // Stream from Cone and parse incrementally
        for await (const event of cone.chat(
          identifier,
          currentPrompt,
          this.config.ephemeral || false
        )) {
          if (event.type === 'chat_content') {
            // Feed chunk to parser
            const { toolCalls, visibleText } = parser.feed(event.content);

            // Accumulate visible text
            fullVisibleText += visibleText;

            // Emit clean text chunks to user
            if (visibleText) {
              yield { type: 'response_chunk', text: visibleText };
            }

            // Collect tool calls as they're detected
            allToolCalls.push(...toolCalls);
          } else if (event.type === 'chat_complete') {
            responseComplete = true;

            // Get any final buffered content
            const final = parser.finish();
            fullVisibleText += final.visibleText;
            allToolCalls.push(...final.toolCalls);

            if (final.visibleText) {
              yield { type: 'response_chunk', text: final.visibleText };
            }

            // Emit complete response
            yield { type: 'response_complete', text: fullVisibleText };

            if (allToolCalls.length === 0) {
              // No tool calls - we're done!
              yield { type: 'done', finalResponse: fullVisibleText };
              return;
            }

            // Check tool call limit
            if (allToolCalls.length > maxToolCallsPerTurn) {
              const error = `Too many tool calls (${allToolCalls.length}), max is ${maxToolCallsPerTurn}`;
              yield { type: 'error', error };
              return;
            }

            // Execute tools
            const results = await this.executeTools(allToolCalls);

            // Yield tool results
            for (let i = 0; i < allToolCalls.length; i++) {
              const call = allToolCalls[i];
              const result = results[i];
              yield {
                type: 'tool_result',
                tool: call.name,
                result: result.success ? result.value : result.error,
                error: !result.success
              };
            }

            // Build next prompt with tool results
            currentPrompt = this.formatToolResultsPrompt(allToolCalls, results);

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
            value: result.data !== undefined ? result.data : result.stdout  // Use stdout if not parsed
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
