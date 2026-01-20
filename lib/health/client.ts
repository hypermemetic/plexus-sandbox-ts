// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { HealthEvent, SchemaResult } from './types';

/** Typed client interface for health plugin */
export interface HealthClient {
  /** Check the health status of the hub and return uptime */
  check(): Promise<HealthEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<SchemaResult>;
}

/** Typed client implementation for health plugin */
export class HealthClientImpl implements HealthClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Check the health status of the hub and return uptime */
  async check(): Promise<HealthEvent> {
    const stream = this.rpc.call('health.check', {});
    return collectOne<HealthEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<SchemaResult> {
    const stream = this.rpc.call('health.schema', {});
    return collectOne<SchemaResult>(stream);
  }

}

/** Create a typed health client from an RPC client */
export function createHealthClient(rpc: RpcClient): HealthClient {
  return new HealthClientImpl(rpc);
}