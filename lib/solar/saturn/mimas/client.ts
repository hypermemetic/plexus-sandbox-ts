// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.saturn.mimas plugin */
export interface SolarSaturnMimasClient {
  /** Get information about Mimas */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.saturn.mimas plugin */
export class SolarSaturnMimasClientImpl implements SolarSaturnMimasClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Mimas */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.saturn.mimas.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.saturn.mimas client from an RPC client */
export function createSolarSaturnMimasClient(rpc: RpcClient): SolarSaturnMimasClient {
  return new SolarSaturnMimasClientImpl(rpc);
}