// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { ChatEvent, ChatStartResult, CreateResult, DeleteResult, ForkResult, GetResult, ListResult, Model, PollResult } from './types';

/** Typed client interface for claudecode plugin */
export interface ClaudecodeClient {
  /** Chat with a session, streaming tokens like Cone */
  chat(name: string, prompt: string, ephemeral?: boolean | null): AsyncGenerator<ChatEvent>;
  /** Start an async chat - returns immediately with session_id for polling  This is the non-blocking version of chat, designed for loopback scenarios where the parent needs to poll for events and handle tool approvals. */
  chatAsync(name: string, prompt: string, ephemeral?: boolean | null): Promise<ChatStartResult>;
  /** Create a new Claude Code session */
  create(model: Model, name: string, workingDir: string, loopbackEnabled?: boolean | null, systemPrompt?: string | null): Promise<CreateResult>;
  /** Delete a session */
  delete(name: string): Promise<DeleteResult>;
  /** Fork a session to create a branch point */
  fork(name: string, newName: string): Promise<ForkResult>;
  /** Get session configuration details */
  get(name: string): Promise<GetResult>;
  /** List all Claude Code sessions */
  list(): Promise<ListResult>;
  /** Poll a session for new chat events  Returns events since the last poll (or from the specified offset). Use this to read events from an async chat started with chat_async. */
  poll(sessionId: string, fromSeq?: number | null, limit?: number | null): Promise<PollResult>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for claudecode plugin */
export class ClaudecodeClientImpl implements ClaudecodeClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Chat with a session, streaming tokens like Cone */
  async *chat(name: string, prompt: string, ephemeral?: boolean | null): AsyncGenerator<ChatEvent> {
    const stream = this.rpc.call('claudecode.chat', { ephemeral, name, prompt });
    yield* extractData<ChatEvent>(stream);
  }

  /** Start an async chat - returns immediately with session_id for polling  This is the non-blocking version of chat, designed for loopback scenarios where the parent needs to poll for events and handle tool approvals. */
  async chatAsync(name: string, prompt: string, ephemeral?: boolean | null): Promise<ChatStartResult> {
    const stream = this.rpc.call('claudecode.chat_async', { ephemeral, name, prompt });
    return collectOne<ChatStartResult>(stream);
  }

  /** Create a new Claude Code session */
  async create(model: Model, name: string, workingDir: string, loopbackEnabled?: boolean | null, systemPrompt?: string | null): Promise<CreateResult> {
    const stream = this.rpc.call('claudecode.create', { loopbackEnabled, model, name, systemPrompt, workingDir });
    return collectOne<CreateResult>(stream);
  }

  /** Delete a session */
  async delete(name: string): Promise<DeleteResult> {
    const stream = this.rpc.call('claudecode.delete', { name });
    return collectOne<DeleteResult>(stream);
  }

  /** Fork a session to create a branch point */
  async fork(name: string, newName: string): Promise<ForkResult> {
    const stream = this.rpc.call('claudecode.fork', { name, newName });
    return collectOne<ForkResult>(stream);
  }

  /** Get session configuration details */
  async get(name: string): Promise<GetResult> {
    const stream = this.rpc.call('claudecode.get', { name });
    return collectOne<GetResult>(stream);
  }

  /** List all Claude Code sessions */
  async list(): Promise<ListResult> {
    const stream = this.rpc.call('claudecode.list', {});
    return collectOne<ListResult>(stream);
  }

  /** Poll a session for new chat events  Returns events since the last poll (or from the specified offset). Use this to read events from an async chat started with chat_async. */
  async poll(sessionId: string, fromSeq?: number | null, limit?: number | null): Promise<PollResult> {
    const stream = this.rpc.call('claudecode.poll', { fromSeq, limit, sessionId });
    return collectOne<PollResult>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('claudecode.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed claudecode client from an RPC client */
export function createClaudecodeClient(rpc: RpcClient): ClaudecodeClient {
  return new ClaudecodeClientImpl(rpc);
}