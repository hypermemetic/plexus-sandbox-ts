/**
 * Agent System
 *
 * A TypeScript agent framework where:
 * - Agents are TypeScript orchestration code
 * - LLM reasoning via Cone (Plexus RPC)
 * - Tools execute via Synapse CLI (bash.execute)
 * - No external API keys required
 * - Everything goes through Plexus
 *
 * Architecture:
 * - Low-level types define the agent model
 * - Tools map to Synapse CLI commands
 * - Cone provides LLM reasoning
 * - Agent executor implements the agentic loop
 * - Tool calls parsed from <tool>...</tool> markers
 *
 * Usage:
 * ```typescript
 * import { createAgent, DefaultToolRegistry, getBasicTools } from './agent';
 * import { createClient } from '@plexus/client/transport';
 * import { Cone } from '@plexus/client';
 *
 * const rpc = createClient({ url: 'ws://localhost:4444' });
 * const cone = new Cone.ConeClientImpl(rpc);
 *
 * // Create a Cone for reasoning
 * const result = await cone.create(
 *   'claude-sonnet-4-5-20250929',
 *   'my-agent-cone',
 *   {},
 *   'You are a helpful assistant.'
 * );
 *
 * const coneId = result.type === 'cone_created' ? result.coneId : null;
 *
 * // Create tools
 * const tools = new DefaultToolRegistry();
 * tools.registerAll(getBasicTools());
 *
 * // Create agent
 * const agent = createAgent('my-agent')
 *   .withSystem('You are a helpful assistant')
 *   .withRPC(rpc)
 *   .withTools(tools)
 *   .withCone(coneId)
 *   .ephemeral(false)
 *   .build();
 *
 * // Run
 * for await (const event of agent.run('Hello!')) {
 *   if (event.type === 'response_chunk') {
 *     process.stdout.write(event.text);
 *   }
 * }
 * ```
 */

// Types
export type {
  // Tool system
  Tool,
  ToolCall,
  ToolResult,
  ToolRegistry,

  // Agent configuration and state
  AgentConfig,
  AgentState,
  AgentEvent,
  Agent,

  // Utilities
  Result
} from './types';

export { Ok, Err } from './types';

// Synapse execution
export {
  executeSynapse,
  buildSynapseCommand
} from './synapse';

export type {
  SynapseCommand,
  SynapseResult
} from './synapse';

// Tool system (pre-defined tools)
export {
  DefaultToolRegistry,
  createSynapseTool,
  createEchoTool,
  createHealthCheckTool,
  createSolarObserveTool,
  createConeListTool,
  createArborListTreesTool,
  createBashExecuteTool,
  getBasicTools,
  getSystemTools,
  getAgentTools,
  getAllBuiltInTools,
  formatToolForPrompt,
  buildToolsPrompt,
  formatToolResult
} from './tools';

export type {
  SynapseToolMapping
} from './tools';

// Simple tool system (discovery-based)
export {
  createSynapseCallTool,
  getSynapseDiscoveryDocs,
  SimpleSynapseRegistry
} from './tools-simple';

// Agent executor
export {
  AgentExecutor,
  AgentBuilder,
  createAgent
} from './executor';
