// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { EchoEvent } from './types';

/** Typed client interface for echo plugin */
export interface EchoClient {
  /** Echo a message back */
  echo(count: number, message: string): Promise<EchoEvent>;
  /** Echo a simple message once */
  once(message: string): Promise<EchoEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for echo plugin */
export class EchoClientImpl implements EchoClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Echo a message back */
  async echo(count: number, message: string): Promise<EchoEvent> {
    const stream = this.rpc.call('echo.echo', { count: count, message: message });
    return collectOne<EchoEvent>(stream);
  }

  /** Echo a simple message once */
  async once(message: string): Promise<EchoEvent> {
    const stream = this.rpc.call('echo.once', { message: message });
    return collectOne<EchoEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('echo.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed echo client from an RPC client */
export function createEchoClient(rpc: RpcClient): EchoClient {
  return new EchoClientImpl(rpc);
}