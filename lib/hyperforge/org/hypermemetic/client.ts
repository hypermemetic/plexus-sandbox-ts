// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { OrgEvent } from '../../../hyperforge/org/types';

/** Typed client interface for hyperforge.org.hypermemetic plugin */
export interface HyperforgeOrgHypermemeticClient {
  /** Show organization info */
  info(): AsyncGenerator<OrgEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for hyperforge.org.hypermemetic plugin */
export class HyperforgeOrgHypermemeticClientImpl implements HyperforgeOrgHypermemeticClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Show organization info */
  async *info(): AsyncGenerator<OrgEvent> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.info', {});
    yield* extractData<OrgEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.org.hypermemetic.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed hyperforge.org.hypermemetic client from an RPC client */
export function createHyperforgeOrgHypermemeticClient(rpc: RpcClient): HyperforgeOrgHypermemeticClient {
  return new HyperforgeOrgHypermemeticClientImpl(rpc);
}