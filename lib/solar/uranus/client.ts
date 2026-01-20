// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { SolarEvent } from '../../solar/types';

/** Typed client interface for solar.uranus plugin */
export interface SolarUranusClient {
  /** Get information about Uranus */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.uranus plugin */
export class SolarUranusClientImpl implements SolarUranusClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Uranus */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.uranus.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.uranus client from an RPC client */
export function createSolarUranusClient(rpc: RpcClient): SolarUranusClient {
  return new SolarUranusClientImpl(rpc);
}