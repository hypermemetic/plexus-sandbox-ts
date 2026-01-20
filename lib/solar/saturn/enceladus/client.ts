// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.saturn.enceladus plugin */
export interface SolarSaturnEnceladusClient {
  /** Get information about Enceladus */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.saturn.enceladus plugin */
export class SolarSaturnEnceladusClientImpl implements SolarSaturnEnceladusClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Enceladus */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.saturn.enceladus.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.saturn.enceladus client from an RPC client */
export function createSolarSaturnEnceladusClient(rpc: RpcClient): SolarSaturnEnceladusClient {
  return new SolarSaturnEnceladusClientImpl(rpc);
}