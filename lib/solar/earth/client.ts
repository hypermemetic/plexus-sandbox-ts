// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { SolarEvent } from '../../solar/types';

/** Typed client interface for solar.earth plugin */
export interface SolarEarthClient {
  /** Get information about Earth */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.earth plugin */
export class SolarEarthClientImpl implements SolarEarthClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Earth */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.earth.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.earth client from an RPC client */
export function createSolarEarthClient(rpc: RpcClient): SolarEarthClient {
  return new SolarEarthClientImpl(rpc);
}