// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.mars.phobos plugin */
export interface SolarMarsPhobosClient {
  /** Get information about Phobos */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.mars.phobos plugin */
export class SolarMarsPhobosClientImpl implements SolarMarsPhobosClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Phobos */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.mars.phobos.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.mars.phobos client from an RPC client */
export function createSolarMarsPhobosClient(rpc: RpcClient): SolarMarsPhobosClient {
  return new SolarMarsPhobosClientImpl(rpc);
}