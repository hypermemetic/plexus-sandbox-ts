// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { OrgEvent } from '../../../hyperforge/org/types';

/** Typed client interface for hyperforge.org.juggernautlabs plugin */
export interface HyperforgeOrgJuggernautlabsClient {
  /** Show organization info */
  info(): AsyncGenerator<OrgEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for hyperforge.org.juggernautlabs plugin */
export class HyperforgeOrgJuggernautlabsClientImpl implements HyperforgeOrgJuggernautlabsClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Show organization info */
  async *info(): AsyncGenerator<OrgEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.info', {});
    yield* extractData<OrgEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed hyperforge.org.juggernautlabs client from an RPC client */
export function createHyperforgeOrgJuggernautlabsClient(rpc: RpcClient): HyperforgeOrgJuggernautlabsClient {
  return new HyperforgeOrgJuggernautlabsClientImpl(rpc);
}