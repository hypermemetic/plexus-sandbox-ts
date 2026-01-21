// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../../rpc';
import { extractData, collectOne } from '../../../../rpc';
import type { SecretEvent } from './types';

/** Typed client interface for hyperforge.org.hypermemetic.secrets plugin */
export interface HyperforgeOrgHypermemeticSecretsClient {
  /** Acquire a token from external source (e.g., gh CLI) */
  acquire(forge: string): AsyncGenerator<SecretEvent>;
  /** Delete a secret */
  delete(key: string): AsyncGenerator<SecretEvent>;
  /** Get a secret value */
  get(key: string): AsyncGenerator<SecretEvent>;
  /** List all secrets for this organization */
  list(): AsyncGenerator<SecretEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
  /** Set a secret value */
  set(key: string, value?: string | null): AsyncGenerator<SecretEvent>;
}

/** Typed client implementation for hyperforge.org.hypermemetic.secrets plugin */
export class HyperforgeOrgHypermemeticSecretsClientImpl implements HyperforgeOrgHypermemeticSecretsClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Acquire a token from external source (e.g., gh CLI) */
  async *acquire(forge: string): AsyncGenerator<SecretEvent> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.secrets.acquire', { forge: forge });
    yield* extractData<SecretEvent>(stream);
  }

  /** Delete a secret */
  async *delete(key: string): AsyncGenerator<SecretEvent> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.secrets.delete', { key: key });
    yield* extractData<SecretEvent>(stream);
  }

  /** Get a secret value */
  async *get(key: string): AsyncGenerator<SecretEvent> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.secrets.get', { key: key });
    yield* extractData<SecretEvent>(stream);
  }

  /** List all secrets for this organization */
  async *list(): AsyncGenerator<SecretEvent> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.secrets.list', {});
    yield* extractData<SecretEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.secrets.schema', {});
    return collectOne<unknown>(stream);
  }

  /** Set a secret value */
  async *set(key: string, value?: string | null): AsyncGenerator<SecretEvent> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.secrets.set', { key: key, value: value });
    yield* extractData<SecretEvent>(stream);
  }

}

/** Create a typed hyperforge.org.hypermemetic.secrets client from an RPC client */
export function createHyperforgeOrgHypermemeticSecretsClient(rpc: RpcClient): HyperforgeOrgHypermemeticSecretsClient {
  return new HyperforgeOrgHypermemeticSecretsClientImpl(rpc);
}