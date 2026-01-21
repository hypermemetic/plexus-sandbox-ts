/**
 * Core type definitions for the TypeScript agent system
 *
 * Architecture (redesigned):
 * - Agent is TypeScript orchestration code
 * - LLM reasoning is via Cone (Plexus RPC)
 * - Tools execute via Synapse CLI (bash.execute RPC)
 * - No external API keys required
 * - Everything goes through Plexus
 */

import type { RpcClient } from '@plexus/client/rpc';
import type { ConeIdentifier } from '@plexus/client/cone';
import type { SynapseCommand } from './synapse';

// ============================================================================
// Tool System
// ============================================================================

/**
 * A tool that the agent can use
 *
 * Tools map to Synapse CLI commands executed via bash.execute RPC.
 * The LLM learns about tools through system prompt descriptions.
 */
export interface Tool {
  /** Unique tool identifier (e.g., 'echo_once', 'health_check') */
  name: string;

  /** Human-readable description for the LLM */
  description: string;

  /** JSON Schema for the tool's input parameters */
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };

  /**
   * Convert tool input to a Synapse CLI command
   *
   * This mapping allows tools to be executed via:
   *   synapse <plugin> <method> --arg value --raw
   */
  toSynapseCommand(input: unknown): SynapseCommand;
}

/**
 * Tool call parsed from LLM output
 *
 * The LLM outputs tool calls as:
 *   <tool>{"name":"tool_name","input":{...}}</tool>
 */
export interface ToolCall {
  /** Unique ID for this tool call */
  id: string;

  /** Tool name */
  name: string;

  /** Tool input matching the tool's inputSchema */
  input: unknown;
}

/**
 * Result of a tool execution
 */
export type ToolResult =
  | { success: true; value: unknown }
  | { success: false; error: string };

/**
 * Tool registry - maps tool names to implementations
 */
export interface ToolRegistry {
  /** Get a tool by name */
  get(name: string): Tool | undefined;

  /** List all available tools */
  list(): Tool[];

  /** Register a new tool */
  register(tool: Tool): void;

  /** Register multiple tools at once */
  registerAll(tools: Tool[]): void;
}

// ============================================================================
// Agent Configuration
// ============================================================================

/**
 * Configuration for an agent
 */
export interface AgentConfig {
  /** Agent name/identifier */
  name: string;

  /** System prompt defining the agent's behavior */
  system: string;

  /** RPC client for Cone and tool execution */
  rpc: RpcClient;

  /** Tool registry */
  tools: ToolRegistry;

  /** Cone identifier - use the properly typed ConeIdentifier from generated types */
  coneId: ConeIdentifier;

  /** Whether to use ephemeral mode (conversation not persisted) */
  ephemeral?: boolean;

  /** Maximum number of turns (user + assistant pairs) */
  maxTurns?: number;

  /** Maximum number of tool calls per turn */
  maxToolCallsPerTurn?: number;
}

// ============================================================================
// Agent State
// ============================================================================

/**
 * The state of an agent during execution
 */
export interface AgentState {
  /** Agent configuration */
  config: AgentConfig;

  /** Current turn number */
  turn: number;

  /** Whether the agent has finished */
  done: boolean;

  /** Final response (if done) */
  finalResponse?: string;

  /** Error (if failed) */
  error?: string;
}

/**
 * Events emitted during agent execution
 */
export type AgentEvent =
  | { type: 'thinking'; message: string }
  | { type: 'tool_call'; tool: string; input: unknown }
  | { type: 'tool_result'; tool: string; result: unknown; error?: boolean }
  | { type: 'response_chunk'; text: string }
  | { type: 'response_complete'; text: string }
  | { type: 'turn_complete'; turn: number }
  | { type: 'done'; finalResponse: string }
  | { type: 'error'; error: string };

// ============================================================================
// Agent Interface
// ============================================================================

/**
 * An agent is an autonomous system that:
 * 1. Receives user messages
 * 2. Reasons with Cone (LLM via Plexus)
 * 3. Parses tool calls from Cone's output
 * 4. Executes tools via Synapse CLI
 * 5. Sends results back to Cone
 * 6. Returns final responses
 *
 * Architecture:
 * - Agent = TypeScript orchestration (this)
 * - LLM = Cone (Plexus RPC)
 * - Tools = Synapse CLI → Plexus methods
 * - Runtime = Substrate/Plexus
 */
export interface Agent {
  /** Agent configuration */
  config: AgentConfig;

  /**
   * Run the agent with a user message
   *
   * @param message - The user's message
   * @returns Async iterator of agent events
   */
  run(message: string): AsyncIterable<AgentEvent>;

  /**
   * One-shot: Send a message and get the final response
   *
   * @param message - The user's message
   * @returns The agent's final response
   */
  ask(message: string): Promise<string>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Helper to create a successful result
 */
export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Helper to create a failed result
 */
export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
