# Discovering and Using Synapse Commands

Synapse is an algebraic CLI for Plexus with excellent introspection capabilities. Instead of memorizing commands, you can **discover the API surface dynamically** using built-in help and schema tools.

## Core Discovery Pattern

```
1. synapse plexus --help
   ↓ See available activations (plugins)

2. synapse plexus <activation> --help
   ↓ See methods in that activation

3. synapse plexus <activation> <method> --help
   ↓ See parameters for that method

4. synapse plexus <activation> <method> <params> --raw
   ↓ Execute and get JSON output
```

## Example: Discovering Health Check

```bash
# Step 1: What activations exist?
$ synapse plexus --help

activations
  health       Check hub health and uptime
  echo         Echo messages back
  cone         LLM cone with persistent conversation context
  ...

# Step 2: What methods does health have?
$ synapse plexus health --help

methods
  check        Check if the hub/substrate is healthy and get uptime information

# Step 3: What parameters does check need?
$ synapse plexus health check --help

  check        Check if the hub/substrate is healthy and get uptime information
              (no parameters required)

# Step 4: Call it
$ synapse plexus health check --raw

{"status":"healthy","timestamp":1768886700,"type":"status","uptime_seconds":28422}
```

## Parameter Naming Convention

**CRITICAL:** Synapse uses `snake_case` for parameters, NOT `kebab-case` or `camelCase`!

```bash
# ✅ CORRECT
synapse plexus cone create --model_id "claude-sonnet-4-5" --name "test"

# ❌ WRONG
synapse plexus cone create --model-id "claude-sonnet-4-5" --name "test"
synapse plexus cone create --modelId "claude-sonnet-4-5" --name "test"
```

## Parameter Types

```bash
# Strings: use quotes
--name "my-cone"
--message "Hello world"

# Numbers: no quotes
--count 5
--timeout 1000

# Booleans: use true/false
--ephemeral true
--verbose false

# Complex objects: use JSON with single quotes
--metadata '{"key":"value"}'
--identifier '{"type":"by_name","name":"my-cone"}'

# Null/optional: omit the parameter
# (don't pass --optional_param if you don't need it)
```

## Output Modes

```bash
# Default: Pretty formatted (human-readable)
synapse plexus health check

# --raw: Just the data as JSON (for parsing)
synapse plexus health check --raw

# --json: Full JSON-RPC stream items (for debugging)
synapse plexus health check --json
```

## Common Activations

### echo - Testing and Debugging

```bash
# List methods
synapse plexus echo --help

# Echo once
synapse plexus echo once --message "test" --raw
# → {"count":1,"message":"test","type":"echo"}

# Echo multiple times
synapse plexus echo echo --count 3 --message "hello" --raw
```

### health - System Status

```bash
# Check health
synapse plexus health check --raw
# → {"status":"healthy","uptime_seconds":28422,...}
```

### cone - LLM Agents

```bash
# List all cones
synapse plexus cone list --raw

# Create a cone
synapse plexus cone create \
  --model_id "claude-sonnet-4-5-20250929" \
  --name "my-assistant" \
  --system_prompt "You are helpful" \
  --raw

# Chat with cone (by name)
synapse plexus cone chat \
  --identifier '{"type":"by_name","name":"my-assistant"}' \
  --prompt "Hello!" \
  --raw

# Get cone details
synapse plexus cone get \
  --identifier '{"type":"by_name","name":"my-assistant"}' \
  --raw

# Delete cone
synapse plexus cone delete \
  --identifier '{"type":"by_name","name":"my-assistant"}' \
  --raw
```

### arbor - Conversation Trees

```bash
# List all trees
synapse plexus arbor tree-list --raw

# Get tree details
synapse plexus arbor tree-get --tree_id "<uuid>" --raw

# Get tree skeleton (structure only)
synapse plexus arbor tree-get-skeleton --tree_id "<uuid>" --raw
```

### bash - Command Execution

```bash
# Execute bash command
synapse plexus bash execute --command "echo hello" --raw
# → {"type":"stdout","line":"hello"}
# → {"type":"exit","code":0}

# Nested synapse call
synapse plexus bash execute \
  --command "synapse plexus health check --raw" \
  --raw
```

### solar - Example Nested Hierarchy

```bash
# Observe solar system
synapse plexus solar observe --raw

# Get info about Earth
synapse plexus solar earth info --raw

# Get info about Earth's moon
synapse plexus solar earth luna info --raw
```

## Discovery Strategy for Agents

When you need to accomplish something, follow this pattern:

1. **Start broad:** `synapse plexus --help` - What activations exist?
2. **Narrow down:** `synapse plexus <activation> --help` - What methods?
3. **Understand parameters:** `synapse plexus <activation> <method> --help`
4. **Try it:** `synapse plexus <activation> <method> <params> --raw`
5. **Parse JSON output:** All `--raw` responses are valid JSON

## Error Handling

```bash
# Invalid activation
$ synapse plexus nonexistent --help
# Error: Not found: 'nonexistent' at root

# Invalid method
$ synapse plexus health invalid --help
# Error: Not found: 'invalid' in 'health'

# Missing required parameter
$ synapse plexus cone create --name "test" --raw
# Error: Missing required parameter: --model_id

# Wrong parameter type
$ synapse plexus echo once --message 123 --raw
# (May work - synapse is forgiving with types)
```

## Advanced: Schema Introspection

For programmatic access to schemas:

```bash
# Get full schema as JSON
synapse plexus --schema

# Get schema for specific activation
synapse plexus cone --schema

# Use jq for parsing
synapse plexus --schema | jq '.children[] | {namespace, description}'
```

## Best Practices for Agents

1. **Always use `--raw`** for parseable output
2. **Check `--help` when unsure** about parameters
3. **Use snake_case** for all parameter names
4. **Quote string values** to avoid shell parsing issues
5. **Parse JSON output** to extract results
6. **Handle errors gracefully** - check for error messages in stderr
7. **Cache discoveries** - remember what you've learned about the API

## Example Agent Workflow

**Task:** "Check system health and list all cones"

```bash
# Discovery
synapse plexus --help | grep -E "health|cone"
# → health       Check hub health and uptime
# → cone         LLM cone with persistent conversation context

# Execute
synapse plexus health check --raw
# → {"status":"healthy",...}

synapse plexus cone list --raw
# → {"cones":[...]}

# Success! Now you know:
# - health.check exists and takes no params
# - cone.list exists and returns cone array
# - Both use --raw for JSON output
```

## Meta: This Is Self-Documenting

The beauty of Synapse is that **the system documents itself**. You don't need external API docs - just use `--help` at every level.

This makes it perfect for LLM agents:
- **Discoverable** - explore the API surface dynamically
- **Typed** - JSON schemas available via `--schema`
- **Consistent** - same pattern everywhere
- **Forgiving** - helpful error messages

**Your job as an agent:** Learn by exploring, not by memorizing.
