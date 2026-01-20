// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.uranus.titania plugin */
export interface SolarUranusTitaniaClient {
  /** Get information about Titania */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.uranus.titania plugin */
export class SolarUranusTitaniaClientImpl implements SolarUranusTitaniaClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Titania */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.uranus.titania.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.uranus.titania client from an RPC client */
export function createSolarUranusTitaniaClient(rpc: RpcClient): SolarUranusTitaniaClient {
  return new SolarUranusTitaniaClientImpl(rpc);
}