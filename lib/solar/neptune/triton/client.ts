// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.neptune.triton plugin */
export interface SolarNeptuneTritonClient {
  /** Get information about Triton */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.neptune.triton plugin */
export class SolarNeptuneTritonClientImpl implements SolarNeptuneTritonClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Triton */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.neptune.triton.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.neptune.triton client from an RPC client */
export function createSolarNeptuneTritonClient(rpc: RpcClient): SolarNeptuneTritonClient {
  return new SolarNeptuneTritonClientImpl(rpc);
}