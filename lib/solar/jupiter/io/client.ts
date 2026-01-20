// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.jupiter.io plugin */
export interface SolarJupiterIoClient {
  /** Get information about Io */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.jupiter.io plugin */
export class SolarJupiterIoClientImpl implements SolarJupiterIoClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Io */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.jupiter.io.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.jupiter.io client from an RPC client */
export function createSolarJupiterIoClient(rpc: RpcClient): SolarJupiterIoClient {
  return new SolarJupiterIoClientImpl(rpc);
}