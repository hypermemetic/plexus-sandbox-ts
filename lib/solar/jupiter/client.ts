// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { SolarEvent } from '../../solar/types';

/** Typed client interface for solar.jupiter plugin */
export interface SolarJupiterClient {
  /** Get information about Jupiter */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.jupiter plugin */
export class SolarJupiterClientImpl implements SolarJupiterClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Jupiter */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.jupiter.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.jupiter client from an RPC client */
export function createSolarJupiterClient(rpc: RpcClient): SolarJupiterClient {
  return new SolarJupiterClientImpl(rpc);
}