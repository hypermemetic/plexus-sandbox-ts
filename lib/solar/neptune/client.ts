// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { SolarEvent } from '../../solar/types';

/** Typed client interface for solar.neptune plugin */
export interface SolarNeptuneClient {
  /** Get information about Neptune */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.neptune plugin */
export class SolarNeptuneClientImpl implements SolarNeptuneClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Neptune */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.neptune.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.neptune client from an RPC client */
export function createSolarNeptuneClient(rpc: RpcClient): SolarNeptuneClient {
  return new SolarNeptuneClientImpl(rpc);
}