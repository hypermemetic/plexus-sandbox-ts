// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.jupiter.ganymede plugin */
export interface SolarJupiterGanymedeClient {
  /** Get information about Ganymede */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.jupiter.ganymede plugin */
export class SolarJupiterGanymedeClientImpl implements SolarJupiterGanymedeClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Ganymede */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.jupiter.ganymede.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.jupiter.ganymede client from an RPC client */
export function createSolarJupiterGanymedeClient(rpc: RpcClient): SolarJupiterGanymedeClient {
  return new SolarJupiterGanymedeClientImpl(rpc);
}