/**
 * Tool system - maps agent tools to Synapse CLI commands
 *
 * Architecture (redesigned):
 * - Tools are Synapse CLI commands
 * - Executed via bash.execute RPC (safe, no shell injection)
 * - Results parsed from --raw JSON output
 * - LLM learns tools through system prompt
 */

import type { Tool, ToolRegistry } from './types';
import type { SynapseCommand } from './synapse';

// ============================================================================
// Tool Registry Implementation
// ============================================================================

/**
 * Default tool registry implementation
 */
export class DefaultToolRegistry implements ToolRegistry {
  private tools = new Map<string, Tool>();

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  registerAll(tools: Tool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
  }
}

// ============================================================================
// Tool Factory - Create tools that map to Synapse commands
// ============================================================================

/**
 * Configuration for mapping a tool to a Synapse command
 */
export interface SynapseToolMapping {
  /** Plugin name (e.g., 'echo', 'health', 'cone') */
  plugin: string;

  /** Method name (e.g., 'once', 'check', 'list') */
  method: string;

  /**
   * Optional function to map tool input to Synapse args
   *
   * If not provided, tool input is used directly as args.
   *
   * Example:
   *   argMapper: (input) => ({ message: input.message })
   */
  argMapper?: (input: unknown) => Record<string, unknown>;
}

/**
 * Create a tool that executes via Synapse CLI
 *
 * The tool is mapped to a synapse command like:
 *   synapse <plugin> <method> --arg value --raw
 *
 * Example:
 *   createSynapseTool(
 *     'echo_once',
 *     'Echo a message back',
 *     { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] },
 *     { plugin: 'echo', method: 'once' }
 *   )
 *
 *   → Tool calls synapse echo once --message "hello" --raw
 */
export function createSynapseTool(
  name: string,
  description: string,
  inputSchema: Tool['inputSchema'],
  synapseMapping: SynapseToolMapping
): Tool {
  return {
    name,
    description,
    inputSchema,
    toSynapseCommand(input: unknown): SynapseCommand {
      return {
        plugin: synapseMapping.plugin,
        method: synapseMapping.method,
        args: synapseMapping.argMapper
          ? synapseMapping.argMapper(input)
          : (input as Record<string, unknown>),
        raw: true
      };
    }
  };
}

// ============================================================================
// Built-in Tools
// ============================================================================

/**
 * Echo tool - simple example for testing
 *
 * Maps to: synapse echo once --message "..." --raw
 */
export function createEchoTool(): Tool {
  return createSynapseTool(
    'echo_once',
    'Echo a message back. Useful for testing or confirming understanding.',
    {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to echo back'
        }
      },
      required: ['message']
    },
    {
      plugin: 'echo',
      method: 'once'
    }
  );
}

/**
 * Health check tool
 *
 * Maps to: synapse health check --raw
 */
export function createHealthCheckTool(): Tool {
  return createSynapseTool(
    'health_check',
    'Check if the hub/substrate is healthy and get uptime information.',
    {
      type: 'object',
      properties: {}
    },
    {
      plugin: 'health',
      method: 'check'
    }
  );
}

/**
 * List cones (LLM agents) tool
 *
 * Maps to: synapse cone list --raw
 */
export function createConeListTool(): Tool {
  return createSynapseTool(
    'cone_list',
    'List all available LLM agents (cones) in the system. Returns information about each cone including name, model, and ID.',
    {
      type: 'object',
      properties: {}
    },
    {
      plugin: 'cone',
      method: 'list'
    }
  );
}

/**
 * List conversation trees tool
 *
 * Maps to: synapse arbor tree-list --raw
 */
export function createArborListTreesTool(): Tool {
  return createSynapseTool(
    'arbor_list_trees',
    'List all conversation trees in the system. Trees are immutable conversation histories.',
    {
      type: 'object',
      properties: {}
    },
    {
      plugin: 'arbor',
      method: 'tree-list'
    }
  );
}

/**
 * Solar system observation tool
 *
 * Maps to: synapse solar observe --raw
 */
export function createSolarObserveTool(): Tool {
  return createSynapseTool(
    'solar_observe',
    'Observe the solar system and get information about planets, moons, and other celestial bodies.',
    {
      type: 'object',
      properties: {}
    },
    {
      plugin: 'solar',
      method: 'observe'
    }
  );
}

/**
 * Bash execute tool (for advanced operations)
 *
 * Maps to: synapse bash execute --command "..." --raw
 *
 * WARNING: This tool allows arbitrary command execution.
 * Use with caution and appropriate LLM guidance.
 */
export function createBashExecuteTool(): Tool {
  return createSynapseTool(
    'bash_execute',
    'Execute a bash command and get stdout, stderr, and exit code. Use this for system operations like listing files, checking processes, etc.',
    {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The bash command to execute'
        }
      },
      required: ['command']
    },
    {
      plugin: 'bash',
      method: 'execute'
    }
  );
}

// ============================================================================
// Tool Sets
// ============================================================================

/**
 * Get a basic set of tools for testing/demos
 */
export function getBasicTools(): Tool[] {
  return [
    createEchoTool(),
    createHealthCheckTool(),
  ];
}

/**
 * Get tools for exploring the system
 */
export function getSystemTools(): Tool[] {
  return [
    createHealthCheckTool(),
    createSolarObserveTool(),
    createConeListTool(),
    createArborListTreesTool(),
  ];
}

/**
 * Get tools for working with LLM agents
 */
export function getAgentTools(): Tool[] {
  return [
    createConeListTool(),
    createArborListTreesTool(),
  ];
}

/**
 * Get all available built-in tools
 */
export function getAllBuiltInTools(): Tool[] {
  return [
    createEchoTool(),
    createHealthCheckTool(),
    createSolarObserveTool(),
    createConeListTool(),
    createArborListTreesTool(),
  ];
}

// ============================================================================
// Tool Formatting Helpers
// ============================================================================

/**
 * Format a tool schema for LLM system prompt
 *
 * Converts tool metadata into a description the LLM can understand.
 *
 * Example output:
 *   - echo_once: Echo a message back
 *     Input: {"message": "string (required)"}
 */
export function formatToolForPrompt(tool: Tool): string {
  const lines: string[] = [];
  lines.push(`- ${tool.name}: ${tool.description}`);

  // Format input schema
  const props = tool.inputSchema.properties;
  const required = tool.inputSchema.required || [];

  if (Object.keys(props).length > 0) {
    const params: string[] = [];
    for (const [key, schema] of Object.entries(props)) {
      const isRequired = required.includes(key);
      const schemaObj = schema as any;
      const typeInfo = schemaObj.type || 'unknown';
      params.push(`"${key}": "${typeInfo}${isRequired ? ' (required)' : ''}"`);
    }
    lines.push(`  Input: {${params.join(', ')}}`);
  } else {
    lines.push('  Input: {}');
  }

  return lines.join('\n');
}

/**
 * Build a system prompt section describing available tools
 *
 * This is included in the agent's system prompt to teach the LLM
 * about tool calling.
 *
 * Example:
 *   Available tools:
 *   - echo_once: Echo a message back
 *     Input: {"message": "string (required)"}
 *   - health_check: Check system health
 *     Input: {}
 */
export function buildToolsPrompt(tools: Tool[]): string {
  if (tools.length === 0) {
    return 'No tools available.';
  }

  const lines: string[] = ['Available tools:'];
  for (const tool of tools) {
    lines.push('');
    lines.push(formatToolForPrompt(tool));
  }

  return lines.join('\n');
}

/**
 * Format tool result for display or next LLM turn
 */
export function formatToolResult(result: unknown): string {
  if (typeof result === 'string') {
    return result;
  }

  if (typeof result === 'object' && result !== null) {
    // Pretty print JSON
    return JSON.stringify(result, null, 2);
  }

  return String(result);
}
