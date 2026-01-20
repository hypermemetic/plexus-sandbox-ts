// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { SolarEvent } from '../../solar/types';

/** Typed client interface for solar.mars plugin */
export interface SolarMarsClient {
  /** Get information about Mars */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.mars plugin */
export class SolarMarsClientImpl implements SolarMarsClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Mars */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.mars.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.mars client from an RPC client */
export function createSolarMarsClient(rpc: RpcClient): SolarMarsClient {
  return new SolarMarsClientImpl(rpc);
}