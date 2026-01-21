// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { ChangelogEvent } from './types';

/** Typed client interface for changelog plugin */
export interface ChangelogClient {
  /** Add a changelog entry for a plexus hash transition */
  add(hash: string, summary: string, author?: string | null, details?: unknown[] | null, previousHash?: string | null, queueId?: string | null): AsyncGenerator<ChangelogEvent>;
  /** Check current status - is the current plexus hash documented? */
  check(currentHash: string): AsyncGenerator<ChangelogEvent>;
  /** Get a specific changelog entry by hash */
  get(hash: string): AsyncGenerator<ChangelogEvent>;
  /** List all changelog entries */
  list(): AsyncGenerator<ChangelogEvent>;
  /** Add a planned change to the queue */
  queueAdd(description: string, tags?: unknown[] | null): AsyncGenerator<ChangelogEvent>;
  /** Mark a queue entry as complete */
  queueComplete(hash: string, id: string): AsyncGenerator<ChangelogEvent>;
  /** Get a specific queue entry by ID */
  queueGet(id: string): AsyncGenerator<ChangelogEvent>;
  /** List all queue entries, optionally filtered by tag */
  queueList(tag?: string | null): AsyncGenerator<ChangelogEvent>;
  /** List pending queue entries, optionally filtered by tag */
  queuePending(tag?: string | null): AsyncGenerator<ChangelogEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for changelog plugin */
export class ChangelogClientImpl implements ChangelogClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Add a changelog entry for a plexus hash transition */
  async *add(hash: string, summary: string, author?: string | null, details?: unknown[] | null, previousHash?: string | null, queueId?: string | null): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.add', { author: author, details: details, hash: hash, previous_hash: previousHash, queue_id: queueId, summary: summary });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** Check current status - is the current plexus hash documented? */
  async *check(currentHash: string): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.check', { current_hash: currentHash });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** Get a specific changelog entry by hash */
  async *get(hash: string): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.get', { hash: hash });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** List all changelog entries */
  async *list(): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.list', {});
    yield* extractData<ChangelogEvent>(stream);
  }

  /** Add a planned change to the queue */
  async *queueAdd(description: string, tags?: unknown[] | null): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.queue_add', { description: description, tags: tags });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** Mark a queue entry as complete */
  async *queueComplete(hash: string, id: string): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.queue_complete', { hash: hash, id: id });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** Get a specific queue entry by ID */
  async *queueGet(id: string): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.queue_get', { id: id });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** List all queue entries, optionally filtered by tag */
  async *queueList(tag?: string | null): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.queue_list', { tag: tag });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** List pending queue entries, optionally filtered by tag */
  async *queuePending(tag?: string | null): AsyncGenerator<ChangelogEvent> {
    const stream = this.rpc.call('changelog.queue_pending', { tag: tag });
    yield* extractData<ChangelogEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('changelog.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed changelog client from an RPC client */
export function createChangelogClient(rpc: RpcClient): ChangelogClient {
  return new ChangelogClientImpl(rpc);
}