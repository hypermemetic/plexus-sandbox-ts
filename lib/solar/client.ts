// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { SolarEvent } from './types';

/** Typed client interface for solar plugin */
export interface SolarClient {
  /** Get information about a specific celestial body */
  info(path: string): AsyncGenerator<SolarEvent>;
  /** Observe the entire solar system */
  observe(): AsyncGenerator<SolarEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for solar plugin */
export class SolarClientImpl implements SolarClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about a specific celestial body */
  async *info(path: string): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.info', { path });
    yield* extractData<SolarEvent>(stream);
  }

  /** Observe the entire solar system */
  async *observe(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.observe', {});
    yield* extractData<SolarEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('solar.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed solar client from an RPC client */
export function createSolarClient(rpc: RpcClient): SolarClient {
  return new SolarClientImpl(rpc);
}