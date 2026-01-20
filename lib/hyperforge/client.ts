// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { HyperforgeEvent } from './types';

/** Typed client interface for hyperforge plugin */
export interface HyperforgeClient {
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
  /** Show hyperforge status */
  status(): AsyncGenerator<HyperforgeEvent>;
  /** Show version info */
  version(): AsyncGenerator<HyperforgeEvent>;
}

/** Typed client implementation for hyperforge plugin */
export class HyperforgeClientImpl implements HyperforgeClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.schema', {});
    return collectOne<unknown>(stream);
  }

  /** Show hyperforge status */
  async *status(): AsyncGenerator<HyperforgeEvent> {
    const stream = this.rpc.call('hyperforge.status', {});
    yield* extractData<HyperforgeEvent>(stream);
  }

  /** Show version info */
  async *version(): AsyncGenerator<HyperforgeEvent> {
    const stream = this.rpc.call('hyperforge.version', {});
    yield* extractData<HyperforgeEvent>(stream);
  }

}

/** Create a typed hyperforge client from an RPC client */
export function createHyperforgeClient(rpc: RpcClient): HyperforgeClient {
  return new HyperforgeClientImpl(rpc);
}