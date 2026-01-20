// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { ForgeEvent } from './types';

/** Typed client interface for hyperforge.forge plugin */
export interface HyperforgeForgeClient {
  /** Check authentication status for a forge */
  auth(forge: string, org?: string | null): AsyncGenerator<ForgeEvent>;
  /** List supported forges */
  list(): AsyncGenerator<ForgeEvent>;
  /** Refresh/update token for a forge */
  refresh(forge: string, org?: string | null, token?: string | null): AsyncGenerator<ForgeEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for hyperforge.forge plugin */
export class HyperforgeForgeClientImpl implements HyperforgeForgeClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Check authentication status for a forge */
  async *auth(forge: string, org?: string | null): AsyncGenerator<ForgeEvent> {
    const stream = this.rpc.call('hyperforge.forge.auth', { forge, org });
    yield* extractData<ForgeEvent>(stream);
  }

  /** List supported forges */
  async *list(): AsyncGenerator<ForgeEvent> {
    const stream = this.rpc.call('hyperforge.forge.list', {});
    yield* extractData<ForgeEvent>(stream);
  }

  /** Refresh/update token for a forge */
  async *refresh(forge: string, org?: string | null, token?: string | null): AsyncGenerator<ForgeEvent> {
    const stream = this.rpc.call('hyperforge.forge.refresh', { forge, org, token });
    yield* extractData<ForgeEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.forge.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed hyperforge.forge client from an RPC client */
export function createHyperforgeForgeClient(rpc: RpcClient): HyperforgeForgeClient {
  return new HyperforgeForgeClientImpl(rpc);
}