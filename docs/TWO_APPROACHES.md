# Two Approaches to Agent Tools

We support **two philosophies** for giving agents access to Synapse:

## Approach 1: Pre-Defined Tools (Static)

**Philosophy:** Define typed tools in advance that map to Synapse commands.

**Example:**
```typescript
const tools = new DefaultToolRegistry();
tools.registerAll([
  createEchoTool(),         // Maps to: synapse plexus echo once
  createHealthCheckTool(),  // Maps to: synapse plexus health check
  createConeListTool(),     // Maps to: synapse plexus cone list
  // ... define every tool you want
]);
```

**Pros:**
- ✅ Type-safe tool definitions
- ✅ Clear API boundaries
- ✅ Easy to document specific tools
- ✅ Controlled access (only expose what you define)

**Cons:**
- ❌ Must pre-define every tool
- ❌ Can't discover new Plexus activations
- ❌ Maintenance burden (keep tools in sync with Plexus)
- ❌ Rigid - agent can't explore

**When to use:**
- Production apps with well-defined tool sets
- When you want strict control over what the agent can do
- When type safety is critical

**Example:** `npm run agent`

---

## Approach 2: Self-Discovering Agent (Dynamic)

**Philosophy:** Give agent ONE generic tool and let it discover the API surface.

**Example:**
```typescript
const tools = new DefaultToolRegistry();
tools.register(createSynapseCallTool());  // ONE tool for everything

const systemPrompt = `${basePrompt}

${getSynapseDiscoveryDocs()}  // Teach agent how to discover APIs
`;
```

**Pros:**
- ✅ Agent discovers APIs dynamically
- ✅ No tool maintenance - Synapse is self-documenting
- ✅ Agent can explore unknown activations
- ✅ Automatically supports new Plexus plugins
- ✅ More "agentic" - learns and adapts

**Cons:**
- ⚠️ Less type safety (agent constructs commands)
- ⚠️ Agent must learn API (uses more tokens)
- ⚠️ Requires good LLM (needs to parse --help output)
- ⚠️ Less predictable (agent explores)

**When to use:**
- Research and exploration
- Rapidly evolving Plexus APIs
- When you want maximum flexibility
- Learning/educational contexts

**Example:** `npm run agent:simple`

---

## Comparison

| Aspect | Pre-Defined Tools | Self-Discovering |
|--------|-------------------|------------------|
| **Type Safety** | ✅ Strong | ⚠️ Weak |
| **Maintenance** | ❌ High | ✅ Low |
| **Flexibility** | ❌ Rigid | ✅ Flexible |
| **Discovery** | ❌ No | ✅ Yes |
| **Token Usage** | ✅ Low | ⚠️ Higher |
| **Predictability** | ✅ High | ⚠️ Variable |
| **Control** | ✅ Strict | ⚠️ Loose |

---

## Hybrid Approach (Best of Both Worlds)

You can combine both:

```typescript
const tools = new DefaultToolRegistry();

// Pre-defined tools for critical operations
tools.register(createHealthCheckTool());
tools.register(createConeListTool());

// Generic tool for exploration
tools.register(createSynapseCallTool());
```

System prompt:
```typescript
`You have access to:
1. Pre-defined tools: health_check, cone_list (use these when available)
2. Generic synapse_call: For anything else, explore and discover

Prefer pre-defined tools when available, but use synapse_call to discover new capabilities.

${getSynapseDiscoveryDocs()}`
```

This gives you:
- Type-safe tools for common operations
- Discovery for unknown scenarios
- Best balance of control and flexibility

---

## Recommendation

**Start with Self-Discovering (Approach 2)**

Why?
1. Synapse is already self-documenting
2. Plexus APIs evolve quickly
3. You don't know what the agent will need yet
4. Let the LLM figure out the API surface

**Graduate to Pre-Defined Tools when:**
- Specific tools are used repeatedly
- You need strict access control
- Performance matters (reduce discovery overhead)
- Production stability is critical

**Think of it as:**
- **Approach 2** = Exploration phase (developer mode)
- **Approach 1** = Production phase (locked down)
- **Hybrid** = Transitional (common ops + flexibility)

---

## Examples

### Pre-Defined Tools Example
```bash
npm run agent
```

Watch the agent use `health_check`, `solar_observe`, etc. - all pre-mapped.

### Self-Discovering Example
```bash
npm run agent:simple
```

Watch the agent:
1. Use bash.execute to run `synapse plexus --help`
2. Parse help output to learn what exists
3. Discover parameter names via `--help`
4. Construct synapse_call commands dynamically

---

## Philosophy

> **"We design our backend to suit our frontend."**

In this case:
- **Pre-Defined Tools:** Backend (TypeScript) defines what agent can do
- **Self-Discovering:** Backend (Synapse) exposes itself, agent figures it out

Both are valid! Choose based on your needs:
- Control vs Flexibility
- Safety vs Discovery
- Production vs Research

The fact that Synapse is **algebraic and self-documenting** makes Approach 2 possible. Most systems would require Approach 1.

Use this power wisely. 🚀
