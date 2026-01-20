// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { ForgeEvent } from '../../../hyperforge/forge/types';

/** Typed client interface for hyperforge.forge.github plugin */
export interface HyperforgeForgeGithubClient {
  /** Check authentication status */
  authStatus(token: string): AsyncGenerator<ForgeEvent>;
  /** List repositories for a user */
  reposList(owner: string, token: string): AsyncGenerator<ForgeEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for hyperforge.forge.github plugin */
export class HyperforgeForgeGithubClientImpl implements HyperforgeForgeGithubClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Check authentication status */
  async *authStatus(token: string): AsyncGenerator<ForgeEvent> {
    const stream = this.rpc.call('hyperforge.forge.github.auth_status', { token });
    yield* extractData<ForgeEvent>(stream);
  }

  /** List repositories for a user */
  async *reposList(owner: string, token: string): AsyncGenerator<ForgeEvent> {
    const stream = this.rpc.call('hyperforge.forge.github.repos_list', { owner, token });
    yield* extractData<ForgeEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.forge.github.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed hyperforge.forge.github client from an RPC client */
export function createHyperforgeForgeGithubClient(rpc: RpcClient): HyperforgeForgeGithubClient {
  return new HyperforgeForgeGithubClientImpl(rpc);
}