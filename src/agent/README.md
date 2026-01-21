# TypeScript Agent System (Cone + Synapse)

A low-level agent framework where agents orchestrate LLM reasoning via Cone and execute tools via Synapse CLI.

## Architecture

```
┌─────────────────────────────────────────────────┐
│           TypeScript Agent (Orchestrator)        │
│      (This Code - Full Control & Transparency)   │
└───────────┬──────────────────────┬───────────────┘
            │                      │
            ↓                      ↓
    ┌──────────────┐       ┌──────────────────┐
    │  Cone (LLM)  │       │  Synapse (Tools) │
    │  Plexus RPC  │       │   bash.execute   │
    │              │       │                  │
    │  • Reasoning │       │  • echo_once     │
    │  • Memory    │       │  • health_check  │
    │  • Streaming │       │  • cone_list     │
    └──────────────┘       │  • solar_observe │
                           │  • ... any CLI   │
                           └──────────────────┘
```

**Key Innovation:**
- **No external API keys** - Cone provides LLM reasoning via Plexus
- **Safe tool execution** - Synapse CLI via bash.execute (no shell injection)
- **Everything through Plexus** - Single unified backend

## Philosophy

### What Changed?

**Old Architecture (External LLM):**
- TypeScript agent → Claude/OpenAI API (needs API key)
- Tools → Direct Plexus RPC calls
- Agent manages conversation state

**New Architecture (Cone + Synapse):**
- TypeScript agent → Cone (Plexus RPC, no API key)
- Tools → Synapse CLI → Plexus methods (safe)
- Cone manages conversation state
- Tool calls via `<tool>...</tool>` markers

### Why This Design?

**Advantages:**
- ✅ No API keys in TypeScript
- ✅ Safe command execution (no shell injection)
- ✅ Simpler architecture (no LLM abstraction)
- ✅ Built-in conversation memory (Cone + Arbor)
- ✅ Type-safe (generated Plexus clients)
- ✅ Everything goes through one backend (Plexus)

**Trade-offs:**
- ⚠️ LLM must format tool calls correctly (text parsing)
- ⚠️ Depends on Synapse CLI being available
- ⚠️ Less control over LLM parameters
- ⚠️ Tool calling via text markers (not native)

### How Does It Work?

**The Agentic Loop:**
```
1. User: "Is the system healthy?"
   ↓
2. Agent calls Cone with prompt
   ↓
3. Cone (LLM): "Let me check... <tool>{"name":"health_check","input":{}}</tool>"
   ↓
4. Agent parses <tool>...</tool> markers
   ↓
5. Agent executes: synapse health check --raw
   ↓
6. Tool result: { status: 'healthy', uptime: 12345 }
   ↓
7. Agent sends result back to Cone
   ↓
8. Cone (LLM): "The system is healthy with 12345s uptime"
   ↓
9. Agent returns response to user
```

## Type System

### Core Types

**Tool Interface:**
```typescript
interface Tool {
  name: string;                    // e.g., "echo_once"
  description: string;             // For LLM understanding
  inputSchema: { /* JSON Schema */ };
  toSynapseCommand(input: unknown): SynapseCommand;
}

interface SynapseCommand {
  plugin: string;    // 'echo', 'health', etc.
  method: string;    // 'once', 'check', etc.
  args: Record<string, unknown>;
  raw?: boolean;     // Use --raw flag for JSON output
}
```

**Tool Call Parsing:**
```typescript
interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

// Parsed from: <tool>{"name":"tool_name","input":{...}}</tool>
```

**Agent Interface:**
```typescript
interface Agent {
  config: AgentConfig;

  // Streaming: get all events
  run(message: string): AsyncIterable<AgentEvent>;

  // Blocking: just get final response
  ask(message: string): Promise<string>;
}

type AgentEvent =
  | { type: 'thinking'; message: string }
  | { type: 'tool_call'; tool: string; input: unknown }
  | { type: 'tool_result'; tool: string; result: unknown }
  | { type: 'response_chunk'; text: string }
  | { type: 'done'; finalResponse: string }
  | { type: 'error'; error: string };
```

**Agent Configuration:**
```typescript
interface AgentConfig {
  name: string;
  system: string;
  rpc: RpcClient;
  tools: ToolRegistry;
  coneId: string | { name: string };
  ephemeral?: boolean;  // Don't persist conversation
  maxTurns?: number;
  maxToolCallsPerTurn?: number;
}
```

## Usage

### Basic Example

```typescript
import { createClient } from '@plexus/client/transport';
import { Cone } from '@plexus/client';
import {
  createAgent,
  DefaultToolRegistry,
  getBasicTools
} from './agent';

// 1. Connect to Plexus
const rpc = createClient({ url: 'ws://localhost:4444' });

// 2. Create a Cone for LLM reasoning
const cone = new Cone.ConeClientImpl(rpc);
const result = await cone.create(
  'claude-sonnet-4-5-20250929',
  'my-agent-cone',
  {},
  'You are a helpful assistant.'
);

const coneId = result.type === 'cone_created' ? result.coneId : null;

// 3. Register tools
const tools = new DefaultToolRegistry();
tools.registerAll(getBasicTools());

// 4. Create agent
const agent = createAgent('my-agent')
  .withSystem('You are a helpful assistant')
  .withRPC(rpc)
  .withTools(tools)
  .withCone(coneId)
  .ephemeral(false)
  .build();

// 5. Run agent (streaming)
for await (const event of agent.run('Is the system healthy?')) {
  if (event.type === 'response_chunk') {
    process.stdout.write(event.text);
  } else if (event.type === 'done') {
    console.log('\n✓ Complete');
  }
}

// Or one-shot (blocking)
const answer = await agent.ask('What is the uptime?');
console.log(answer);
```

### Creating Custom Tools

**Map to Synapse Command:**
```typescript
import { createSynapseTool } from './agent';

const myTool = createSynapseTool(
  'my_custom_tool',
  'Description for the LLM',
  {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'A message' }
    },
    required: ['message']
  },
  {
    plugin: 'echo',
    method: 'once',
    argMapper: (input: any) => ({ message: input.message })
  }
);

tools.register(myTool);
```

**With Custom Arg Mapping:**
```typescript
const complexTool = createSynapseTool(
  'cone_chat',
  'Chat with a specific cone',
  {
    type: 'object',
    properties: {
      coneName: { type: 'string' },
      prompt: { type: 'string' }
    },
    required: ['coneName', 'prompt']
  },
  {
    plugin: 'cone',
    method: 'chat',
    argMapper: (input: any) => ({
      identifier: { type: 'by_name', name: input.coneName },
      prompt: input.prompt
    })
  }
);
```

### Built-in Tools

```typescript
import {
  createEchoTool,           // Echo messages (testing)
  createHealthCheckTool,    // System health
  createSolarObserveTool,   // Solar system info
  createConeListTool,       // List LLM agents
  createArborListTreesTool, // List conversation trees
  createBashExecuteTool,    // Execute bash commands (⚠️ use carefully)

  // Or get sets
  getBasicTools,     // echo, health_check
  getSystemTools,    // health, solar, cone_list, arbor_list
  getAgentTools,     // cone_list, arbor_list
  getAllBuiltInTools // All of the above
} from './agent';
```

## Advanced Patterns

### Ephemeral vs Persistent Mode

```typescript
// Ephemeral: conversation not saved to Arbor
const ephemeralAgent = createAgent('temp')
  .withCone(coneId)
  .ephemeral(true)  // ← Ephemeral mode
  .build();

// Persistent: conversation saved in Arbor tree
const persistentAgent = createAgent('persistent')
  .withCone(coneId)
  .ephemeral(false)  // ← Default
  .build();
```

### Multi-Turn Agent Loop

The agent automatically loops when the LLM outputs tool markers:

```
Turn 1:
  User: "Check health and tell me the uptime"
  Cone: <tool>{"name":"health_check","input":{}}</tool>
  Agent: Executes synapse health check --raw

Turn 2:
  Agent: Sends tool result back to Cone
  Cone: "The system is healthy with 12345s uptime"
  Agent: Returns final response

Total: 2 turns, 1 tool call
```

Control loop behavior:
```typescript
const agent = createAgent('my-agent')
  .maxTurns(10)              // Max conversation turns
  .maxToolCallsPerTurn(5)    // Max tools per turn
  .build();
```

### Event-Driven UI

React to agent events in real-time:

```typescript
for await (const event of agent.run(userMessage)) {
  switch (event.type) {
    case 'thinking':
      ui.showSpinner(event.message);
      break;

    case 'tool_call':
      ui.showToolCall(event.tool, event.input);
      break;

    case 'tool_result':
      ui.showToolResult(event.tool, event.result, event.error);
      break;

    case 'response_chunk':
      ui.appendText(event.text);  // Stream to UI
      break;

    case 'done':
      ui.complete(event.finalResponse);
      break;

    case 'error':
      ui.showError(event.error);
      break;
  }
}
```

### Direct Synapse Execution

You can also execute Synapse commands directly:

```typescript
import { executeSynapse, buildSynapseCommand } from './agent';

const result = await executeSynapse(rpc, {
  plugin: 'health',
  method: 'check',
  args: {},
  raw: true
});

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.stderr);
}
```

## Design Decisions

### Why Cone Instead of External LLM?

**External LLM (Old):**
- Requires API key in frontend
- Agent manages conversation state
- More control over parameters
- Direct access to model features

**Cone (New):**
- No API keys needed
- Conversation state in Arbor
- Backend manages LLM access
- Unified architecture through Plexus

**When to use each:**
- Use **Cone** for: Production apps, shared agents, persistent conversations
- Use **External LLM** for: Development, custom models, fine-grained control

### Why Synapse CLI Instead of Direct RPC?

**Direct RPC (Old):**
- Direct method calls via rpc.call()
- Type-safe but repetitive
- Each tool needs custom RPC code

**Synapse CLI (New):**
- Uniform interface: `synapse <plugin> <method> --args`
- Safe execution via bash.execute
- Easy to add new tools (just map to CLI)
- JSON output via `--raw` flag

**Trade-offs:**
- ✅ Simpler tool creation
- ✅ No shell injection risks
- ✅ Uniform error handling
- ⚠️ Depends on Synapse CLI
- ⚠️ Less type safety than direct RPC

### Why Text-Based Tool Calling?

Instead of native LLM tool calling (like Anthropic's tool use), we use:
```
<tool>{"name":"tool_name","input":{...}}</tool>
```

**Reasons:**
- Works with any LLM (not just Anthropic)
- Simpler to parse and debug
- Full control over tool execution
- Can inspect/log tool calls easily

**Trade-offs:**
- ⚠️ LLM must format correctly (but Sonnet 4.5 does this well)
- ⚠️ Text parsing adds slight overhead
- ✅ More flexible and debuggable

## System Prompt

The agent builds a system prompt that teaches the LLM how to use tools:

```
You are a helpful assistant.

# Tool Calling

You have access to tools that can help you complete tasks. To use a tool, output EXACTLY:

<tool>
{"name": "tool_name", "input": {"param": "value"}}
</tool>

Available tools:
- echo_once: Echo a message back
  Input: {"message": "string (required)"}
- health_check: Check system health
  Input: {}

Important:
- Output tool calls as valid JSON inside <tool> tags
- You can call multiple tools in one response
- After tool results are provided, give a final answer to the user
```

## Examples

See `agent-example.ts` for a complete working example:

```bash
# Run example
npm run agent

# Or with watch mode
npm run agent:watch
```

Example output:
```
🤖 TypeScript Agent with Cone + Synapse

Architecture:
  • Agent: TypeScript orchestration (this code)
  • LLM: Cone (Plexus RPC)
  • Tools: Synapse CLI → Plexus methods
  • No API keys required!

👤 User: Is the system healthy?

💭 Turn 1
🔧 Calling tool: health_check
   ✓ Result: {"status":"healthy","uptimeSeconds":12345}

The system is healthy with an uptime of 12345 seconds.

✓ Complete in 1 turn(s)
```

## API Reference

### Types

- `Tool` - Tool that maps to Synapse command
- `ToolCall` - Parsed tool call from LLM output
- `ToolRegistry` - Tool storage and retrieval
- `SynapseCommand` - Safe Synapse CLI command
- `SynapseResult` - Result from Synapse execution
- `Agent` - Agent interface
- `AgentEvent` - Events during execution

### Synapse Execution

- `executeSynapse()` - Execute Synapse command via bash.execute
- `buildSynapseCommand()` - Build safe CLI command string

### Tool System

- `createSynapseTool()` - Create tool that maps to Synapse command
- `DefaultToolRegistry` - Tool registry implementation
- `formatToolForPrompt()` - Format tool for system prompt
- `buildToolsPrompt()` - Build tools section of system prompt
- `formatToolResult()` - Format result for LLM

### Agent Executor

- `AgentExecutor` - Core agent implementation
- `AgentBuilder` - Fluent API for building agents
- `createAgent()` - Start building an agent

## Next Steps

1. **Error handling** - Better tool error recovery
2. **Streaming tools** - Handle streaming Synapse output
3. **Tool composition** - Tools that call other tools
4. **Observability** - Logging, tracing, debugging
5. **Testing utilities** - Mock Cone, assertion helpers
6. **Multi-agent** - Agents that delegate to other agents

## Philosophy

This agent system embodies our design vision:

> **We design our backend to suit our frontend.**

The agent is TypeScript code (frontend), Cone provides reasoning (backend), and Synapse provides tools (backend). Everything flows through Plexus - one unified system.

**Key Principles:**
- **No abstraction hiding** - You see exactly what happens
- **Composable primitives** - Build complex from simple
- **Type-safe where possible** - Catch bugs early
- **Human-readable tool calls** - Debug by reading text
- **Everything through Plexus** - Single source of truth

This is the foundation. Build whatever you imagine on top.
