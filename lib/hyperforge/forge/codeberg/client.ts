// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { ForgeEvent } from '../../../hyperforge/forge/types';

/** Typed client interface for hyperforge.forge.codeberg plugin */
export interface HyperforgeForgeCodebergClient {
  /** List repositories for a user */
  reposList(owner: string, token: string): AsyncGenerator<ForgeEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for hyperforge.forge.codeberg plugin */
export class HyperforgeForgeCodebergClientImpl implements HyperforgeForgeCodebergClient {
  constructor(private readonly rpc: RpcClient) {}

  /** List repositories for a user */
  async *reposList(owner: string, token: string): AsyncGenerator<ForgeEvent> {
    const stream = this.rpc.call('hyperforge.forge.codeberg.repos_list', { owner: owner, token: token });
    yield* extractData<ForgeEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.forge.codeberg.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed hyperforge.forge.codeberg client from an RPC client */
export function createHyperforgeForgeCodebergClient(rpc: RpcClient): HyperforgeForgeCodebergClient {
  return new HyperforgeForgeCodebergClientImpl(rpc);
}