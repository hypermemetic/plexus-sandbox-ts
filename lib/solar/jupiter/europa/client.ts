// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.jupiter.europa plugin */
export interface SolarJupiterEuropaClient {
  /** Get information about Europa */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.jupiter.europa plugin */
export class SolarJupiterEuropaClientImpl implements SolarJupiterEuropaClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Europa */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.jupiter.europa.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.jupiter.europa client from an RPC client */
export function createSolarJupiterEuropaClient(rpc: RpcClient): SolarJupiterEuropaClient {
  return new SolarJupiterEuropaClientImpl(rpc);
}