// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.earth.luna plugin */
export interface SolarEarthLunaClient {
  /** Get information about Luna */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.earth.luna plugin */
export class SolarEarthLunaClientImpl implements SolarEarthLunaClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Luna */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.earth.luna.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.earth.luna client from an RPC client */
export function createSolarEarthLunaClient(rpc: RpcClient): SolarEarthLunaClient {
  return new SolarEarthLunaClientImpl(rpc);
}