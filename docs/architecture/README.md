# Architecture Documentation

This directory contains architecture decision records and design documentation for substrate-sandbox-ts.

## Naming Convention

Architecture docs use **reverse-chronological naming** so the newest documents appear first in `ls`:

```
filename = (2^64 - 1) - unix_nanos
```

**Generate filename**:
```python
import time
nanotime = int(time.time() * 1_000_000_000)
filename = (2**64 - 1) - nanotime
print(f'{filename}_your-title.md')
```

**Example**:
```
16677764465330374655_typescript-agent-cone-synapse.md  ← Newest (Jan 20, 2025)
16677600000000000000_some-older-document.md            ← Older
```

When you `ls`, newest documents appear first.

## Document Structure

Each architecture doc should include:

- **Status**: Implemented / In Progress / Proposed / Rejected
- **Date**: YYYY-MM-DD
- **Problem**: What problem are we solving?
- **Solution**: How did we solve it?
- **Trade-offs**: What did we gain/lose?
- **Implementation**: Where is the code?
- **Future**: What's next?

## Current Documents

- `16677764465330374655_typescript-agent-cone-synapse.md` - TypeScript agent implementation using Cone for reasoning and Synapse for tool execution

## Related Documentation

- **Synapse architecture**: `../../../synapse/docs/architecture/` - Backend architecture
- **Agent README**: `../../src/agent/README.md` - Usage documentation
- **API docs**: `../../docs/*.md` - Usage guides
