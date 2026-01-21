# Testing Guide: TypeScript Agent with Cone + Synapse

## Prerequisites

✅ **Plexus server running** (port 4444)
```bash
lsof -i :4444  # Should show substrate process
```

✅ **Synapse CLI available**
```bash
which synapse  # Should show path to synapse binary
synapse --help # Should show help text
```

✅ **Dependencies installed**
```bash
npm install
```

✅ **TypeScript compiles**
```bash
npm run build
```

---

## Test Levels

### Level 0: Connectivity Test (30 seconds)

**Purpose:** Verify Plexus connection works

```bash
npm start
```

**Expected:**
- Health check passes
- Echo works
- Cone list displays
- No connection errors

---

### Level 1: Component Tests (1 minute each)

#### Test Synapse Execution
```bash
tsx test-synapse.ts
```

**Tests:**
- ✅ Echo command via Synapse
- ✅ Health check via Synapse
- ✅ Error handling for invalid commands
- ✅ JSON parsing from --raw output

**Expected Output:**
```
🧪 Testing Synapse Execution

Test 1: Echo
Success: true
Data: { message: 'Hello from Synapse test!', count: 1 }

Test 2: Health Check
Success: true
Data: { status: 'healthy', uptimeSeconds: 45892 }

Test 3: Invalid Command (should fail gracefully)
Success: false
Exit Code: 1
Stderr: synapse: error: unrecognized plugin 'nonexistent'

✅ Synapse tests complete
```

#### Test Tool System
```bash
tsx test-tools.ts
```

**Tests:**
- ✅ Tool creation
- ✅ Tool schema validation
- ✅ Synapse command mapping
- ✅ System prompt generation
- ✅ Tool call parsing from text

**Expected Output:**
```
🧪 Testing Tool System

Test 1: Tool Creation
Tool name: echo_once
Tool description: Echo a message back...
Input schema: { type: 'object', properties: {...} }
Synapse command: { plugin: 'echo', method: 'once', args: {...} }

Test 2: Tools Prompt Generation
Available tools:
- echo_once: Echo a message back
  Input: {"message": "string (required)"}
- health_check: Check system health
  Input: {}

Test 3: Tool Call Parsing (simulated)
Parsed tool call: { name: 'health_check', input: {} }

✅ Tool tests complete
```

---

### Level 2: Integration Test (2-3 minutes)

**Purpose:** Full agent test with real LLM calls

```bash
npm run agent
```

**Tests:**
- ✅ Cone creation
- ✅ Tool registration
- ✅ Agent configuration
- ✅ Multi-turn conversations
- ✅ Tool call parsing from LLM output
- ✅ Tool execution via Synapse
- ✅ Result formatting and display
- ✅ Streaming responses

**Expected Output:**
```
🤖 TypeScript Agent with Cone + Synapse

Architecture:
  • Agent: TypeScript orchestration (this code)
  • LLM: Cone (Plexus RPC)
  • Tools: Synapse CLI → Plexus methods
  • No API keys required!

Connecting to Plexus at ws://localhost:4444...
Creating Cone for reasoning...
✓ Cone created: a1b2c3d4...

Registering tools...
Available tools: echo_once, health_check, solar_observe, cone_list, arbor_list_trees

────────────────────────────────────────────────────────────
👤 User: Is the system healthy? Check and tell me the uptime.

💭 Turn 1
🔧 Calling tool: health_check
   Input: {}
   ✓ Result: {"status":"healthy","uptimeSeconds":45892}

The system is healthy with an uptime of 45,892 seconds (approximately 12.7 hours).

✓ Complete in 1 turn(s)

────────────────────────────────────────────────────────────
👤 User: What's in the solar system?

💭 Turn 1
🔧 Calling tool: solar_observe
   Input: {}
   ✓ Result: {"star":"Sol","planetCount":8,"moonCount":205,...}

Our solar system contains 8 planets orbiting Sol, with a total of 205 moons...

✓ Complete in 1 turn(s)

────────────────────────────────────────────────────────────
👤 User: Are there any LLM agents (cones) in the system?

💭 Turn 1
🔧 Calling tool: cone_list
   Input: {}
   ✓ Result: {"cones":[{"coneId":"...","name":"typescript-agent-demo",...}]}

Yes, there are 2 cones currently running:
1. typescript-agent-demo (Sonnet 4.5)
2. research-assistant (Opus 4.5)

✓ Complete in 1 turn(s)

✨ Demo complete!
```

---

### Level 3: Manual Interactive Test

**Purpose:** Test custom queries and edge cases

Create `test-interactive.ts`:
```typescript
import { createClient } from '@plexus/client/transport';
import { Cone } from '@plexus/client';
import { createAgent, DefaultToolRegistry, getSystemTools } from './agent';

const rpc = createClient({ url: 'ws://localhost:4444' });
const cone = new Cone.ConeClientImpl(rpc);

// Create cone
const result = await cone.create(
  'claude-sonnet-4-5-20250929',
  'interactive-test',
  {},
  'You are a test assistant.'
);

if (result.type !== 'cone_created') {
  console.error('Failed to create cone');
  process.exit(1);
}

// Create agent
const tools = new DefaultToolRegistry();
tools.registerAll(getSystemTools());

const agent = createAgent('interactive')
  .withSystem('You are a helpful test assistant')
  .withRPC(rpc)
  .withTools(tools)
  .withCone(result.coneId)
  .ephemeral(true)
  .build();

// Test query
const query = process.argv[2] || 'Check system health and list cones';

console.log(`\n🧪 Query: ${query}\n`);

for await (const event of agent.run(query)) {
  switch (event.type) {
    case 'tool_call':
      console.log(`🔧 ${event.tool}(${JSON.stringify(event.input)})`);
      break;
    case 'tool_result':
      console.log(`   ${event.error ? '❌' : '✅'} ${JSON.stringify(event.result)}`);
      break;
    case 'response_chunk':
      process.stdout.write(event.text);
      break;
    case 'done':
      console.log('\n\n✓ Done\n');
      break;
    case 'error':
      console.error(`\n❌ Error: ${event.error}\n`);
      break;
  }
}

rpc.disconnect();
```

Run with custom queries:
```bash
tsx test-interactive.ts "Check health"
tsx test-interactive.ts "What's in the solar system?"
tsx test-interactive.ts "List all cones and tell me about them"
tsx test-interactive.ts "Use multiple tools: check health, observe solar system, and list cones"
```

---

## Test Checklist

### Functionality Tests
- [ ] Agent creates Cone successfully
- [ ] Tools are registered correctly
- [ ] System prompt includes tool instructions
- [ ] LLM outputs tool calls in `<tool>...</tool>` format
- [ ] Tool calls are parsed correctly
- [ ] Synapse commands are built safely (no injection)
- [ ] Tools execute via bash.execute
- [ ] Tool results are parsed from JSON
- [ ] Results are sent back to Cone
- [ ] Agent loops until no more tool calls
- [ ] Final response is clean (no tool markers)
- [ ] Streaming works (response_chunk events)

### Edge Cases
- [ ] No tools called (direct response)
- [ ] Multiple tools in one turn
- [ ] Tool execution fails (stderr captured)
- [ ] Invalid tool name (error handling)
- [ ] Malformed tool JSON (parse error handled)
- [ ] Max turns reached (stops gracefully)
- [ ] Max tool calls per turn exceeded (error)
- [ ] Empty tool input (`{}`)
- [ ] Complex tool input (nested objects)

### Error Handling
- [ ] Cone creation fails
- [ ] Plexus connection drops
- [ ] Synapse CLI not available
- [ ] Tool not found in registry
- [ ] Synapse command fails (exit code != 0)
- [ ] JSON parse error from --raw output
- [ ] Timeout handling

---

## Debugging Tips

### View Synapse Command Being Run
Add to `src/agent/synapse.ts`:
```typescript
export async function executeSynapse(...) {
  const command = buildSynapseCommand(cmd);
  console.log('[DEBUG] Executing:', command);  // ← Add this
  // ... rest of function
}
```

### View Tool Call Parsing
Add to `src/agent/executor.ts`:
```typescript
function parseToolCalls(text: string): ToolCall[] {
  console.log('[DEBUG] Parsing text:', text);  // ← Add this
  const toolCalls: ToolCall[] = [];
  // ... rest of function
}
```

### View Cone Responses
Add to agent run loop:
```typescript
for await (const event of cone.chat(...)) {
  console.log('[DEBUG] Cone event:', event);  // ← Add this
  // ... rest of loop
}
```

### Check Cone Conversation History
```bash
# List cones
synapse cone list --raw | jq

# Get cone details
synapse cone get --id <cone-id> --raw | jq

# View conversation tree
synapse arbor tree-get --tree-id <tree-id> --raw | jq
```

---

## Performance Benchmarks

Run the agent example and measure:

```bash
time npm run agent
```

**Expected timings (approximate):**
- Cone creation: ~100-200ms
- Tool registration: <10ms
- Single turn with 1 tool: ~2-5 seconds (LLM call + tool execution)
- Complete 3-query demo: ~15-30 seconds

---

## Continuous Testing

### Watch Mode for Development
```bash
npm run agent:watch
```

Changes to any file in `src/agent/` will trigger a reload.

### Pre-commit Checks
```bash
# Type check
npm run typecheck

# Build
npm run build

# Quick smoke test
npm start

# Full agent test
npm run agent
```

---

## Success Criteria

✅ All component tests pass
✅ Agent creates Cone without errors
✅ LLM outputs valid tool calls
✅ Tools execute via Synapse successfully
✅ Results are formatted correctly
✅ Streaming works smoothly
✅ Multi-turn conversations work
✅ Error cases handled gracefully
✅ No TypeScript errors
✅ No runtime crashes

---

## Next Steps After Testing

Once all tests pass:

1. **Add more tools** - Map additional Synapse commands
2. **Improve error messages** - Better debugging info
3. **Add logging** - Structured logging for production
4. **Performance optimization** - Cache tool schemas, etc.
5. **UI integration** - Build a frontend that uses the agent
6. **Multi-agent coordination** - Agents calling other agents
7. **Persistent conversations** - Use non-ephemeral mode
