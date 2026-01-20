# Substrate TypeScript Sandbox

A TypeScript sandbox for testing the generated Plexus client library. This serves as a starting point and reference for building TypeScript frontends that interact with Substrate/Plexus.

## Structure

```
substrate-sandbox-ts/
├── lib/                    # Generated Plexus client library
│   ├── types.ts           # Core types (PlexusStreamItem, etc)
│   ├── rpc.ts             # RPC client interface
│   ├── transport.ts       # WebSocket transport implementation
│   ├── index.ts           # Main exports
│   ├── health/            # Health plugin client
│   ├── echo/              # Echo plugin client
│   ├── cone/              # Cone (LLM agent) client
│   ├── arbor/             # Arbor (conversation trees) client
│   ├── hyperforge/        # Hyperforge multi-forge management
│   └── ...                # Other plugin clients
├── src/
│   └── main.ts            # Example usage of the generated client
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- Running Substrate instance (default: `ws://localhost:4444`)

### Install Dependencies

```bash
npm install
```

### Run the Sandbox

```bash
# Run once
npm start

# Run with watch mode (auto-reload on changes)
npm run dev

# Type check only
npm run typecheck
```

### Connect to Custom Plexus Instance

```bash
PLEXUS_URL=ws://your-host:port npm start
```

## What the Sandbox Does

The sandbox demonstrates various Plexus client operations:

1. **Health Check** - Basic connectivity test
2. **Echo Service** - Simple RPC calls (streaming and non-streaming)
3. **Solar System** - Nested namespace queries (solar.observe)
4. **Cone Management** - List LLM agents
5. **Arbor Trees** - Query conversation history trees
6. **Hyperforge Status** - Check multi-forge infrastructure status

## Example Output

```
🚀 Substrate TypeScript Sandbox

Connecting to Plexus at ws://localhost:4444...

📊 Health Check
──────────────────────────────────────────────────
✓ Hub is healthy
  Uptime: 12345s

🔊 Echo Service
──────────────────────────────────────────────────
✓ Echo once: "Hello from TypeScript!"
✓ Echo 3x: "TypeScript rocks"

🌍 Solar System Query
──────────────────────────────────────────────────
✓ Solar system: Sol
  Planets: 8
  Moons: 175
  Total bodies: 184

🤖 Cone Management
──────────────────────────────────────────────────
✓ Found 3 cone(s)
  - my-agent (claude-sonnet-3-5-20241022)
  - test-cone (claude-haiku-3-5-20241022)
  ... and 1 more

✅ All tests completed successfully!
```

## Using in Your Own Project

### Option 1: Link the Generated Library

```bash
# In your project
npm install file:../substrate-sandbox-ts/lib
```

### Option 2: Regenerate for Your Plexus Instance

```bash
# Generate IR from your Plexus
cabal run synapse -- -i > /tmp/my-ir.json

# Generate TypeScript client
cargo run --release --manifest-path ../hub-codegen/Cargo.toml -- \
  /tmp/my-ir.json -o ./my-plexus-client

# Use in your project
npm install file:./my-plexus-client
```

## API Usage Examples

### Basic Connection

```typescript
import { createClient } from '@plexus/client/transport';

const rpc = createClient({ url: 'ws://localhost:4444' });
```

### Non-Streaming Calls

```typescript
import { Health } from '@plexus/client';

const health = new Health.HealthClientImpl(rpc);
const status = await health.check();

if (status.type === 'status') {
  console.log(`Uptime: ${status.uptimeSeconds}s`);
}
```

### Streaming Calls

```typescript
import { Solar } from '@plexus/client';

const solar = new Solar.SolarClientImpl(rpc);

for await (const event of solar.observe()) {
  if (event.type === 'system') {
    console.log(`Star: ${event.star}`);
    console.log(`Planets: ${event.planetCount}`);
    break;
  }
}
```

### Working with Nested Namespaces

The generated client handles nested namespaces automatically:

```typescript
import {
  Hyperforge,
  HyperforgeOrg,
  HyperforgeOrgHypermemetic,
  HyperforgeOrgHypermemeticRepos
} from '@plexus/client';

// Top-level: hyperforge.status()
const hf = new Hyperforge.HyperforgeClientImpl(rpc);
for await (const event of hf.status()) {
  // ...
}

// Nested: hyperforge.org.hypermemetic.repos.list()
const repos = new HyperforgeOrgHypermemeticRepos.HyperforgeOrgHypermemeticReposClientImpl(rpc);
for await (const event of repos.list()) {
  // ...
}
```

## Development

### Regenerate Library After Schema Changes

```bash
# 1. Generate fresh IR
cabal run synapse -- -i > /tmp/ir-current.json

# 2. Regenerate TypeScript library
cargo run --release --manifest-path ../hub-codegen/Cargo.toml -- \
  /tmp/ir-current.json -o ./lib

# 3. Reinstall dependencies
cd lib && npm install && cd ..
npm install

# 4. Type check
npm run typecheck
```

### Troubleshooting

**Type errors after regeneration:**
- Ensure hub-codegen is rebuilt: `cd ../hub-codegen && cargo build --release`
- Check IR version: `jq '.irVersion' /tmp/ir.json` should be `"2.0"`

**Connection refused:**
- Ensure Substrate is running: `pgrep -f substrate`
- Check Plexus port: default is `ws://localhost:4444`

**Missing types:**
- Some properties may be undefined if the schema doesn't match implementation
- This is expected during active development - types will be refined over time

## Next Steps

- Build a web UI using the generated client
- Add authentication/authorization if needed
- Implement error handling and reconnection logic
- Create typed wrappers for specific workflows

## License

See root project license.
