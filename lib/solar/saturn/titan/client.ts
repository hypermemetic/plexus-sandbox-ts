// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.saturn.titan plugin */
export interface SolarSaturnTitanClient {
  /** Get information about Titan */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.saturn.titan plugin */
export class SolarSaturnTitanClientImpl implements SolarSaturnTitanClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Titan */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.saturn.titan.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.saturn.titan client from an RPC client */
export function createSolarSaturnTitanClient(rpc: RpcClient): SolarSaturnTitanClient {
  return new SolarSaturnTitanClientImpl(rpc);
}