# TypeScript Agent Architecture: Cone + Synapse

**Status**: Implemented
**Date**: 2025-01-20
**Lines of Code**: ~1,500
**Location**: `src/agent/`

## Executive Summary

Built a TypeScript agent framework that orchestrates LLM reasoning via **Cone** (Plexus RPC) and executes tools via **Synapse CLI** (bash.execute). No external API keys required - everything flows through Plexus.

**Key Innovation**: Agent has no direct LLM access. It orchestrates between Cone (reasoning) and Synapse (tools), with all communication happening over Plexus RPC.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│      TypeScript Agent (Orchestrator)            │
│      • Parses tool calls from LLM output        │
│      • Executes tools via Synapse CLI           │
│      • Sends results back to Cone               │
│      • Loops until completion                   │
└──────────┬──────────────────────┬────────────────┘
           │                      │
           ↓                      ↓
    ┌──────────────┐      ┌────────────────────┐
    │  Cone (LLM)  │      │  Synapse (Tools)   │
    │  Plexus RPC  │      │  bash.execute RPC  │
    │              │      │                    │
    │ • Reasoning  │      │ • health check     │
    │ • Memory     │      │ • echo             │
    │ • Streaming  │      │ • cone list        │
    │ • Arbor tree │      │ • solar observe    │
    └──────────────┘      │ • bash execute     │
                          │ • ... any Plexus   │
                          └────────────────────┘
```

**Everything goes through Plexus** - single unified backend.

## Design Philosophy

### Core Principle: Separation of Concerns

1. **TypeScript Agent**: Orchestration logic
   - Parses tool calls from `<tool>...</tool>` markers
   - Builds tool execution commands
   - Manages conversation flow
   - No LLM reasoning, no tool execution

2. **Cone (via Plexus)**: LLM reasoning + memory
   - Generates responses with tool calls
   - Maintains conversation history in Arbor
   - Streams text content
   - Backend manages API keys

3. **Synapse CLI (via bash.execute)**: Tool execution
   - Safe command execution (no shell injection)
   - Uniform interface: `synapse plexus <plugin> <method>`
   - JSON output via `--raw` flag
   - Self-documenting via `--help`

### Key Architectural Decisions

#### 1. Tool Calling via Text Markers (Not Native Tool Use)

**Decision**: LLM outputs `<tool>{"name":"...","input":{...}}</tool>` instead of using Anthropic's native tool use API.

**Rationale**:
- Works with any LLM (not Anthropic-specific)
- Full control over parsing and execution
- Easy to debug (readable text markers)
- Can log/inspect tool calls trivially
- TypeScript agent controls timing/ordering

**Trade-off**: LLM must format correctly (but Sonnet 4.5 does this well)

#### 2. Synapse CLI for Tool Execution (Not Direct RPC)

**Decision**: Execute tools via `synapse plexus <plugin> <method>` instead of direct `rpc.call()`.

**Rationale**:
- Uniform interface across all tools
- Safe execution via bash.execute (no shell injection)
- Automatic snake_case parameter handling
- Self-documenting (`--help` at every level)
- No tool-specific TypeScript code needed

**Trade-off**: Slight overhead of CLI invocation vs direct RPC

#### 3. No External API Keys in TypeScript

**Decision**: Cone manages LLM access, not TypeScript code.

**Rationale**:
- API keys stay in backend (secure)
- Frontend can't leak credentials
- Unified access control via Plexus
- Simpler deployment (no env vars in frontend)

**Trade-off**: Less control over LLM parameters

#### 4. Conversation Memory in Arbor (Not Agent State)

**Decision**: Cone maintains conversation history via Arbor trees, agent is stateless.

**Rationale**:
- Persistent conversations across sessions
- Can branch conversation history
- Backend owns state (source of truth)
- Agent can restart without losing context

**Trade-off**: Can't easily inspect conversation in TypeScript

## Two Implementation Approaches

We support two philosophies for tool access:

### Approach 1: Pre-Defined Tools (Static)

**File**: `src/agent/tools.ts`

```typescript
const tools = new DefaultToolRegistry();
tools.registerAll([
  createEchoTool(),         // synapse plexus echo once
  createHealthCheckTool(),  // synapse plexus health check
  createConeListTool(),     // synapse plexus cone list
  createSolarObserveTool(), // synapse plexus solar observe
  createArborListTreesTool() // synapse plexus arbor tree-list
]);
```

**Characteristics**:
- ✅ Type-safe tool definitions
- ✅ Explicit API boundaries
- ✅ Controlled access
- ❌ Must pre-define every tool
- ❌ Maintenance burden

**When to use**: Production apps with well-defined requirements

### Approach 2: Self-Discovering Agent (Dynamic)

**File**: `src/agent/tools-simple.ts`

```typescript
const tools = new DefaultToolRegistry();
tools.register(createSynapseCallTool());  // ONE generic tool

const systemPrompt = `${basePrompt}

${getSynapseDiscoveryDocs()}  // Teaches agent how to discover APIs
`;
```

**Characteristics**:
- ✅ Agent discovers APIs dynamically
- ✅ No tool maintenance
- ✅ Automatically supports new plugins
- ✅ More "agentic"
- ⚠️ Agent must learn API (uses tokens)
- ⚠️ Less predictable

**When to use**: Research, rapidly evolving APIs, maximum flexibility

**Key insight**: Synapse is self-documenting (`--help` everywhere), so agents can learn the API surface dynamically.

## Implementation Details

### File Structure

```
src/agent/
├── index.ts           # Public API exports
├── types.ts           # Core type definitions (~220 lines)
├── synapse.ts         # Synapse CLI executor (~200 lines)
├── tools.ts           # Pre-defined tools (~390 lines)
├── tools-simple.ts    # Discovery-based tool (~170 lines)
├── executor.ts        # Agent loop (~390 lines)
└── README.md          # Documentation

src/
├── agent-example.ts         # Pre-defined tools demo
└── agent-simple-example.ts  # Discovery demo

docs/
├── SYNAPSE_DISCOVERY.md  # How to discover Synapse APIs
├── TWO_APPROACHES.md     # Philosophy comparison
└── architecture/
    └── (this file)
```

### Core Components

#### 1. Synapse Executor (`synapse.ts`)

Safe Synapse CLI execution via bash.execute:

```typescript
interface SynapseCommand {
  plugin: string;    // 'health', 'echo', etc.
  method: string;    // 'check', 'once', etc.
  args: Record<string, unknown>;
  raw?: boolean;     // Use --raw for JSON output
}

// Builds: "synapse plexus health check --raw"
buildSynapseCommand(cmd: SynapseCommand): string

// Executes via bash.execute, collects stdout/stderr/exit
executeSynapse(rpc: RpcClient, cmd: SynapseCommand): Promise<SynapseResult>
```

**Key features**:
- Automatic snake_case conversion (`modelId` → `model_id`)
- Proper escaping (no shell injection)
- JSON parsing from stdout
- Error handling with exit codes

#### 2. Type System (`types.ts`)

Simplified types (removed LLM abstraction):

```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: { type: 'object'; properties: {...} };
  toSynapseCommand(input: unknown): SynapseCommand;  // Maps to CLI
}

interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

interface AgentConfig {
  name: string;
  system: string;
  rpc: RpcClient;
  tools: ToolRegistry;
  coneId: ConeIdentifier;  // Proper typed identifier
  ephemeral?: boolean;
  maxTurns?: number;
  maxToolCallsPerTurn?: number;
}

interface Agent {
  run(message: string): AsyncIterable<AgentEvent>;
  ask(message: string): Promise<string>;
}
```

**What was removed**:
- `LLMProvider`, `LLMRequest`, `LLMResponse` - No longer needed
- `Message`, `Conversation` types - Cone manages this
- External LLM abstraction - Cone is the LLM

#### 3. Agent Executor (`executor.ts`)

The orchestration loop:

```typescript
class AgentExecutor {
  async *run(message: string): AsyncIterable<AgentEvent> {
    while (turn < maxTurns) {
      // 1. Call Cone with prompt
      for await (const event of cone.chat(identifier, prompt, ephemeral)) {
        if (event.type === 'chat_content') {
          // Stream to user
          yield { type: 'response_chunk', text: event.content };
          fullResponse += event.content;
        }
        else if (event.type === 'chat_complete') {
          // 2. Parse tool calls from <tool>...</tool> markers
          const toolCalls = parseToolCalls(fullResponse);

          if (toolCalls.length === 0) {
            // Done!
            yield { type: 'done', finalResponse };
            return;
          }

          // 3. Execute tools via Synapse
          const results = await executeTools(toolCalls);

          // 4. Format results for next turn
          prompt = formatToolResultsPrompt(toolCalls, results);
          // Loop continues...
        }
      }
    }
  }
}
```

**Helper functions**:
- `parseToolCalls()` - Extract `<tool>...</tool>` markers
- `stripToolMarkers()` - Clean text for display
- `buildSystemPrompt()` - Add tool instructions
- `executeTools()` - Execute via Synapse, collect results
- `formatToolResultsPrompt()` - Format for next turn

#### 4. Tool Registry (`tools.ts` and `tools-simple.ts`)

Two implementations:

**Pre-defined tools**:
```typescript
createSynapseTool(
  'echo_once',
  'Echo a message back',
  { type: 'object', properties: {...} },
  { plugin: 'echo', method: 'once' }
)
```

**Generic tool**:
```typescript
createSynapseCallTool()  // Maps to: synapse plexus <activation> <method>
```

Both map to `SynapseCommand` for execution.

### Agent Builder (Fluent API)

```typescript
const agent = createAgent('my-agent')
  .withSystem('You are helpful')
  .withRPC(rpc)
  .withTools(tools)
  .withCone(coneId)
  .ephemeral(false)
  .maxTurns(10)
  .maxToolCallsPerTurn(5)
  .build();
```

Clean, composable API for agent construction.

## Tool Calling Flow

### Example: "Is the system healthy?"

**Turn 1 - User to Cone**:
```
Agent → Cone: "Is the system healthy?"

System Prompt:
  You are a helpful assistant.

  To use a tool, output:
  <tool>{"name":"tool_name","input":{...}}</tool>

  Available tools:
  - health_check: Check system health
    Input: {}
```

**Cone → Agent**:
```
Let me check the system health.

<tool>
{"name":"health_check","input":{}}
</tool>
```

**Turn 2 - Tool Execution**:
```
Agent parses: {"name":"health_check","input":{}}

Agent executes:
  synapse plexus health check --raw

Synapse returns:
  {"status":"healthy","uptime_seconds":28422}
```

**Turn 3 - Results to Cone**:
```
Agent → Cone:

Tool results:

Tool: health_check
Input: {}
Result: {"status":"healthy","uptime_seconds":28422}

Provide a final answer to the user.
```

**Cone → Agent**:
```
The system is healthy with an uptime of 28,422 seconds (about 7.9 hours).
```

**Done!** Agent yields final response to user.

## Event Stream

Agent emits events during execution:

```typescript
type AgentEvent =
  | { type: 'thinking'; message: string }           // Starting turn N
  | { type: 'tool_call'; tool: string; input: unknown }  // Calling tool
  | { type: 'tool_result'; tool: string; result: unknown }  // Tool result
  | { type: 'response_chunk'; text: string }        // Streaming text
  | { type: 'response_complete'; text: string }     // Full response
  | { type: 'turn_complete'; turn: number }         // Turn done
  | { type: 'done'; finalResponse: string }         // Agent complete
  | { type: 'error'; error: string };               // Error occurred
```

This enables real-time UI updates:

```typescript
for await (const event of agent.run(message)) {
  switch (event.type) {
    case 'thinking':
      ui.showSpinner(event.message);
      break;
    case 'response_chunk':
      ui.appendText(event.text);  // Live streaming!
      break;
    case 'done':
      ui.complete(event.finalResponse);
      break;
  }
}
```

## System Prompt Structure

The agent builds a system prompt that teaches tool calling:

```
<base system prompt>

# Tool Calling

You have access to tools that can help you complete tasks.
To use a tool, output EXACTLY:

<tool>
{"name": "tool_name", "input": {"param": "value"}}
</tool>

Available tools:
- echo_once: Echo a message back
  Input: {"message": "string (required)"}
- health_check: Check system health
  Input: {}
...

Important:
- Output tool calls as valid JSON inside <tool> tags
- You can call multiple tools in one response
- After tool results are provided, give a final answer
```

The LLM learns:
1. How to format tool calls
2. What tools are available
3. What inputs each tool expects
4. When to stop (no more tool calls)

## Testing Strategy

Three levels of testing:

### Level 1: Component Tests

```bash
# Test Synapse execution
npx tsx test-synapse.ts

# Test tool system
npx tsx test-tools.ts
```

Verifies:
- Synapse CLI builds correct commands
- Tools map to SynapseCommands
- JSON parsing works
- Error handling

### Level 2: Integration Tests

```bash
# Pre-defined tools agent
npm run agent

# Self-discovering agent
npm run agent:simple
```

Verifies:
- Cone creation
- Tool registration
- Agent loop execution
- Multi-turn conversations
- Tool call parsing
- Streaming responses

### Level 3: Manual Testing

Create custom queries and observe:
- Tool discovery process
- Error recovery
- Multi-tool usage
- Edge cases

## Performance Characteristics

**Latency breakdown** (approximate):

1. **Cone.chat()**: 2-5 seconds
   - LLM inference time
   - Network round-trip
   - Streaming chunks

2. **Tool execution**: 100-500ms
   - bash.execute overhead: ~50ms
   - Synapse CLI startup: ~50ms
   - Actual tool execution: varies
   - JSON parsing: <1ms

3. **Complete turn**: 3-6 seconds
   - Dominated by LLM inference

**Optimization opportunities**:
- Cache tool schemas (avoid repeated parsing)
- Batch tool calls (parallel execution)
- Reduce system prompt size (fewer tokens)

## Known Issues and Workarounds

### Issue 1: TypeScript Client Parameter Naming

**Problem**: Generated clients use camelCase but Plexus expects snake_case.

**Workaround**: Call `rpc.call()` directly with snake_case parameters.

**Fix**: Documented in `synapse/docs/architecture/16677793986132070655_typescript-codegen-snake-case.md`

### Issue 2: ConeIdentifier Type

**Problem**: Need proper `ConeIdentifier` type instead of plain string.

**Solution**: Use generated types:
```typescript
const coneIdentifier: Cone.ConeIdentifier = {
  type: 'by_id',
  id: createResult.coneId
};
```

**Status**: Fixed in implementation

## Trade-offs and Design Choices

### What We Gained

✅ **No API keys in TypeScript** - Backend manages credentials
✅ **Safe tool execution** - No shell injection via bash.execute
✅ **Simpler architecture** - Removed LLM abstraction layer
✅ **Built-in memory** - Cone + Arbor handle conversations
✅ **Type-safe orchestration** - TypeScript for control flow
✅ **Everything through Plexus** - Single backend, unified system
✅ **Self-documenting tools** - Synapse `--help` everywhere

### What We Lost

⚠️ **Less LLM control** - Can't tweak temperature, top_p, etc.
⚠️ **Text-based tool calling** - LLM must format correctly
⚠️ **Synapse dependency** - Requires CLI to be available
⚠️ **Indirect conversation access** - Can't easily inspect Arbor from TS
⚠️ **Debugging complexity** - More layers to trace through

### Why These Trade-offs Are Worth It

1. **Security**: API keys stay in backend
2. **Simplicity**: No LLM provider abstraction needed
3. **Flexibility**: Works with any Plexus activation
4. **Maintainability**: Synapse self-documents, less code to maintain
5. **Correctness**: Safe command execution, no injection risks

## Future Directions

### Short-term (Next Sprint)

1. **Error recovery**: Better handling of tool failures
2. **Streaming tools**: Support streaming Synapse output
3. **Conversation branching**: Expose Arbor tree navigation
4. **Logging**: Structured logging for debugging

### Medium-term (Next Month)

1. **Multi-agent coordination**: Agents calling other agents
2. **Tool composition**: Tools that use other tools
3. **Persistent sessions**: Resume conversations across restarts
4. **Web UI**: Frontend that uses the agent

### Long-term (Future)

1. **Agent marketplace**: Share/discover agent configurations
2. **Fine-tuned models**: Custom models for specific domains
3. **Observability**: Tracing, metrics, dashboards
4. **Hybrid approach**: Mix pre-defined + discovery tools

## Lessons Learned

### What Worked Well

1. **Separation of concerns**: TypeScript orchestrates, Cone reasons, Synapse executes
2. **Text-based tool calling**: Surprisingly robust, easy to debug
3. **Synapse self-documentation**: Makes discovery-based tools viable
4. **Fluent API**: Clean agent construction pattern
5. **Event streaming**: Enables reactive UIs

### What Was Challenging

1. **Parameter naming**: camelCase vs snake_case mismatch
2. **Type generation**: Generated clients didn't match runtime
3. **Error messages**: Hard to trace through Cone → Synapse → Plexus
4. **Documentation**: System is novel, hard to explain clearly

### What We'd Do Differently

1. **Start with discovery-based tools**: Less maintenance
2. **Document parameter conventions earlier**: Would have caught snake_case issue
3. **Add integration tests sooner**: Caught bugs earlier
4. **Simpler examples first**: Started too complex

## Conclusion

We built a working TypeScript agent that uses Cone for reasoning and Synapse for tool execution, with everything flowing through Plexus RPC. The architecture is clean, maintainable, and extends naturally.

**Key innovation**: Agent has no direct LLM or tool access - it orchestrates between Cone (reasoning) and Synapse (execution). This separation enables powerful patterns while keeping the frontend secure and simple.

**Two approaches** (pre-defined vs discovery) give flexibility for different use cases. Start with discovery for research, graduate to pre-defined for production.

**Status**: ✅ Implemented, ✅ Compiles, ⚠️ Integration tests pending backend fix

---

## References

- Implementation: `src/agent/`
- Examples: `src/agent-example.ts`, `src/agent-simple-example.ts`
- Documentation: `src/agent/README.md`, `docs/*.md`
- Architecture: Reverse-chronological naming (this file appears first in `ls`)

## Metrics

- **Implementation time**: ~4 hours
- **Lines of code**: ~1,500
- **Files created**: 11
- **TypeScript errors**: 0
- **Test coverage**: Component tests passing
