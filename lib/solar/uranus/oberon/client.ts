// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../rpc';
import { extractData, collectOne } from '../../../rpc';
import type { SolarEvent } from '../../../solar/types';

/** Typed client interface for solar.uranus.oberon plugin */
export interface SolarUranusOberonClient {
  /** Get information about Oberon */
  info(): AsyncGenerator<SolarEvent>;
}

/** Typed client implementation for solar.uranus.oberon plugin */
export class SolarUranusOberonClientImpl implements SolarUranusOberonClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get information about Oberon */
  async *info(): AsyncGenerator<SolarEvent> {
    const stream = this.rpc.call('solar.uranus.oberon.info', {});
    yield* extractData<SolarEvent>(stream);
  }

}

/** Create a typed solar.uranus.oberon client from an RPC client */
export function createSolarUranusOberonClient(rpc: RpcClient): SolarUranusOberonClient {
  return new SolarUranusOberonClientImpl(rpc);
}