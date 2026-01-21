/**
 * Simplified tool system - single generic synapse_call tool
 *
 * Instead of pre-defining tools for every Synapse command,
 * we provide ONE tool that executes arbitrary Synapse commands.
 *
 * The LLM learns the Synapse API surface by:
 * 1. Reading the discovery documentation
 * 2. Using synapse --help to explore
 * 3. Executing commands with --raw for JSON output
 */

import type { Tool } from './types';
import type { SynapseCommand } from './synapse';

/**
 * Create a generic synapse call tool
 *
 * This is the ONLY tool you need. The LLM discovers the rest.
 */
export function createSynapseCallTool(): Tool {
  return {
    name: 'synapse_call',
    description: `Execute a Synapse command to interact with the Plexus system.

Synapse is self-documenting - use --help to discover APIs:
  synapse plexus --help                    → List activations
  synapse plexus <activation> --help       → List methods
  synapse plexus <activation> <method> --help → Show parameters

Always use --raw for parseable JSON output.
Use snake_case for parameter names (e.g., model_id, not modelId).

Examples:
  {"activation":"health","method":"check","params":{}}
  {"activation":"echo","method":"once","params":{"message":"hello"}}
  {"activation":"cone","method":"list","params":{}}
  {"activation":"cone","method":"create","params":{"model_id":"claude-sonnet-4-5","name":"test"}}
`,
    inputSchema: {
      type: 'object',
      properties: {
        activation: {
          type: 'string',
          description: 'Plugin name (e.g., "health", "cone", "echo", "arbor", "bash")'
        },
        method: {
          type: 'string',
          description: 'Method name (use --help to discover methods)'
        },
        params: {
          type: 'object',
          description: 'Parameters as key-value pairs (use snake_case for keys)',
          additionalProperties: true
        }
      },
      required: ['activation', 'method']
    },
    toSynapseCommand(input: unknown): SynapseCommand {
      const { activation, method, params = {} } = input as {
        activation: string;
        method: string;
        params?: Record<string, unknown>;
      };

      return {
        plugin: activation,
        method,
        args: params,
        raw: false  // Use pretty formatted output
      };
    }
  };
}

/**
 * Get the Synapse discovery documentation as a string
 *
 * Include this in the agent's system prompt to teach it how to
 * discover and use Synapse commands.
 */
export function getSynapseDiscoveryDocs(): string {
  return `# Discovering Synapse Commands

Synapse is self-documenting. Discover APIs using --help:

## Discovery Pattern
1. synapse plexus --help → See activations
2. synapse plexus <activation> --help → See methods
3. synapse plexus <activation> <method> --help → See parameters
4. Execute with --raw for JSON output

## Parameter Rules
- Use snake_case (model_id, not modelId or model-id)
- Strings: quoted ("my-name")
- Numbers: unquoted (5)
- Booleans: true/false
- Objects: JSON with single quotes ({'type':'by_name'})

## Common Activations
- health: System status (health.check)
- echo: Testing (echo.once, echo.echo)
- cone: LLM agents (cone.list, cone.create, cone.chat, cone.get, cone.delete)
- arbor: Conversation trees (arbor.tree-list, arbor.tree-get)
- bash: Command execution (bash.execute)
- solar: Example hierarchy (solar.observe, solar.earth.info)

## Example Calls
{"activation":"health","method":"check","params":{}}
{"activation":"echo","method":"once","params":{"message":"test"}}
{"activation":"cone","method":"list","params":{}}
{"activation":"cone","method":"create","params":{"model_id":"claude-sonnet-4-5","name":"my-cone"}}
{"activation":"cone","method":"chat","params":{"identifier":{"type":"by_name","name":"my-cone"},"prompt":"Hello"}}

## Discovery Strategy
1. If unsure, use bash.execute to run "synapse plexus <activation> --help"
2. Parse help output to learn available methods
3. Use bash.execute again for "synapse plexus <activation> <method> --help"
4. Once you know parameters, call directly with synapse_call tool

You can explore the entire API surface this way - it's self-documenting!`;
}

/**
 * Simple tool registry with just the synapse_call tool
 */
export class SimpleSynapseRegistry {
  private tool: Tool;

  constructor() {
    this.tool = createSynapseCallTool();
  }

  get(name: string): Tool | undefined {
    return name === 'synapse_call' ? this.tool : undefined;
  }

  list(): Tool[] {
    return [this.tool];
  }

  register(tool: Tool): void {
    // Not needed - we only have one tool
  }

  registerAll(tools: Tool[]): void {
    // Not needed - we only have one tool
  }
}
