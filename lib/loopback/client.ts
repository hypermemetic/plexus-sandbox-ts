// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { ConfigureResult, PendingResult, RespondResult, String } from './types';

/** Typed client interface for loopback plugin */
export interface LoopbackClient {
  /** Generate MCP configuration for a loopback session */
  configure(sessionId: string): Promise<ConfigureResult>;
  /** List pending approval requests */
  pending(sessionId?: string | null): Promise<PendingResult>;
  /** Permission prompt handler - blocks until parent approves/denies  This is called by Claude Code CLI via --permission-prompt-tool. It blocks (polls) until the parent calls loopback.respond().  Returns a JSON string (not object) because Claude Code expects the MCP response to have the permission JSON already stringified in content[0].text. See: https://github.com/anthropics/claude-code/blob/main/docs/permission-prompt-tool.md */
  permit(input: unknown, toolName: string, toolUseId: string): Promise<String>;
  /** Respond to a pending approval request */
  respond(approvalId: string, approve: boolean, message?: string | null): Promise<RespondResult>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for loopback plugin */
export class LoopbackClientImpl implements LoopbackClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Generate MCP configuration for a loopback session */
  async configure(sessionId: string): Promise<ConfigureResult> {
    const stream = this.rpc.call('loopback.configure', { sessionId });
    return collectOne<ConfigureResult>(stream);
  }

  /** List pending approval requests */
  async pending(sessionId?: string | null): Promise<PendingResult> {
    const stream = this.rpc.call('loopback.pending', { sessionId });
    return collectOne<PendingResult>(stream);
  }

  /** Permission prompt handler - blocks until parent approves/denies  This is called by Claude Code CLI via --permission-prompt-tool. It blocks (polls) until the parent calls loopback.respond().  Returns a JSON string (not object) because Claude Code expects the MCP response to have the permission JSON already stringified in content[0].text. See: https://github.com/anthropics/claude-code/blob/main/docs/permission-prompt-tool.md */
  async permit(input: unknown, toolName: string, toolUseId: string): Promise<String> {
    const stream = this.rpc.call('loopback.permit', { input, toolName, toolUseId });
    return collectOne<String>(stream);
  }

  /** Respond to a pending approval request */
  async respond(approvalId: string, approve: boolean, message?: string | null): Promise<RespondResult> {
    const stream = this.rpc.call('loopback.respond', { approvalId, approve, message });
    return collectOne<RespondResult>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('loopback.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed loopback client from an RPC client */
export function createLoopbackClient(rpc: RpcClient): LoopbackClient {
  return new LoopbackClientImpl(rpc);
}