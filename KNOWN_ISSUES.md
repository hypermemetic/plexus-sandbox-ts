# Known Issues

## TypeScript Client Parameter Naming Bug

**Status**: Blocking agent functionality

**Issue**: Generated TypeScript clients use camelCase parameters but Plexus expects snake_case.

**Full details**: See architecture document in synapse:
```
synapse/docs/architecture/16677793986132070655_typescript-codegen-snake-case.md
```

**Workaround**: Call RPC directly instead of using typed clients:

```typescript
// ❌ Doesn't work:
const cone = new Cone.ConeClientImpl(rpc);
await cone.create('model', 'name', {}, 'prompt');

// ✅ Works:
const stream = rpc.call('cone.create', {
  model_id: 'model',
  name: 'name',
  system_prompt: 'prompt'
});
```

**Impact**: All agent examples currently broken until codegen is fixed.
