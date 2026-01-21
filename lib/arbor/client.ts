// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { ArborEvent, Handle } from './types';
import type { UUID } from '../cone/types';

/** Typed client interface for arbor plugin */
export interface ArborClient {
  /** Get all external handles in the path to a node */
  contextGetHandles(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Get the full path data from root to a node */
  contextGetPath(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** List all leaf nodes in a tree */
  contextListLeaves(treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Create an external node in a tree */
  nodeCreateExternal(handle: Handle, treeId: UUID, metadata?: unknown, parent?: UUID | null): AsyncGenerator<ArborEvent>;
  /** Create a text node in a tree */
  nodeCreateText(content: string, treeId: UUID, metadata?: unknown, parent?: UUID | null): AsyncGenerator<ArborEvent>;
  /** Get a node by ID */
  nodeGet(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Get the children of a node */
  nodeGetChildren(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Get the parent of a node */
  nodeGetParent(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Get the path from root to a node */
  nodeGetPath(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
  /** Claim ownership of a tree (increment reference count) */
  treeClaim(count: number, ownerId: string, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Create a new conversation tree */
  treeCreate(ownerId: string, metadata?: unknown): AsyncGenerator<ArborEvent>;
  /** Retrieve a complete tree with all nodes */
  treeGet(treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Get lightweight tree structure without node data */
  treeGetSkeleton(treeId: UUID): AsyncGenerator<ArborEvent>;
  /** List all active trees */
  treeList(): AsyncGenerator<ArborEvent>;
  /** List archived trees */
  treeListArchived(): AsyncGenerator<ArborEvent>;
  /** List trees scheduled for deletion */
  treeListScheduled(): AsyncGenerator<ArborEvent>;
  /** Release ownership of a tree (decrement reference count) */
  treeRelease(count: number, ownerId: string, treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Render tree as text visualization  If parent context is available, automatically resolves handles to show actual content. Otherwise, shows handle references. */
  treeRender(treeId: UUID): AsyncGenerator<ArborEvent>;
  /** Update tree metadata */
  treeUpdateMetadata(metadata: unknown, treeId: UUID): AsyncGenerator<ArborEvent>;
}

/** Typed client implementation for arbor plugin */
export class ArborClientImpl implements ArborClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Get all external handles in the path to a node */
  async *contextGetHandles(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.context_get_handles', { node_id: nodeId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Get the full path data from root to a node */
  async *contextGetPath(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.context_get_path', { node_id: nodeId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** List all leaf nodes in a tree */
  async *contextListLeaves(treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.context_list_leaves', { tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Create an external node in a tree */
  async *nodeCreateExternal(handle: Handle, treeId: UUID, metadata?: unknown, parent?: UUID | null): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.node_create_external', { handle: handle, metadata: metadata, parent: parent, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Create a text node in a tree */
  async *nodeCreateText(content: string, treeId: UUID, metadata?: unknown, parent?: UUID | null): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.node_create_text', { content: content, metadata: metadata, parent: parent, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Get a node by ID */
  async *nodeGet(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.node_get', { node_id: nodeId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Get the children of a node */
  async *nodeGetChildren(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.node_get_children', { node_id: nodeId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Get the parent of a node */
  async *nodeGetParent(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.node_get_parent', { node_id: nodeId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Get the path from root to a node */
  async *nodeGetPath(nodeId: UUID, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.node_get_path', { node_id: nodeId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('arbor.schema', {});
    return collectOne<unknown>(stream);
  }

  /** Claim ownership of a tree (increment reference count) */
  async *treeClaim(count: number, ownerId: string, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_claim', { count: count, owner_id: ownerId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Create a new conversation tree */
  async *treeCreate(ownerId: string, metadata?: unknown): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_create', { metadata: metadata, owner_id: ownerId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Retrieve a complete tree with all nodes */
  async *treeGet(treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_get', { tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Get lightweight tree structure without node data */
  async *treeGetSkeleton(treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_get_skeleton', { tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** List all active trees */
  async *treeList(): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_list', {});
    yield* extractData<ArborEvent>(stream);
  }

  /** List archived trees */
  async *treeListArchived(): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_list_archived', {});
    yield* extractData<ArborEvent>(stream);
  }

  /** List trees scheduled for deletion */
  async *treeListScheduled(): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_list_scheduled', {});
    yield* extractData<ArborEvent>(stream);
  }

  /** Release ownership of a tree (decrement reference count) */
  async *treeRelease(count: number, ownerId: string, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_release', { count: count, owner_id: ownerId, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Render tree as text visualization  If parent context is available, automatically resolves handles to show actual content. Otherwise, shows handle references. */
  async *treeRender(treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_render', { tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

  /** Update tree metadata */
  async *treeUpdateMetadata(metadata: unknown, treeId: UUID): AsyncGenerator<ArborEvent> {
    const stream = this.rpc.call('arbor.tree_update_metadata', { metadata: metadata, tree_id: treeId });
    yield* extractData<ArborEvent>(stream);
  }

}

/** Create a typed arbor client from an RPC client */
export function createArborClient(rpc: RpcClient): ArborClient {
  return new ArborClientImpl(rpc);
}