// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { WorkspaceEvent } from './types';

/** Typed client interface for hyperforge.workspace plugin */
export interface HyperforgeWorkspaceClient {
  /** Bind a directory to an organization */
  bind(orgName: string, path: string, autoCreate?: boolean | null): AsyncGenerator<WorkspaceEvent>;
  /** Clone all repos for all orgs bound to current workspace */
  cloneAll(): AsyncGenerator<WorkspaceEvent>;
  /** Show diff for all orgs bound to current workspace */
  diff(path?: string | null): AsyncGenerator<WorkspaceEvent>;
  /** Import repos for all orgs bound to current workspace */
  import(includePrivate?: boolean | null): AsyncGenerator<WorkspaceEvent>;
  /** List all workspace bindings */
  list(): AsyncGenerator<WorkspaceEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
  /** Show current workspace resolution */
  show(path?: string | null): AsyncGenerator<WorkspaceEvent>;
  /** Sync repos for all orgs bound to current workspace */
  sync(yes?: boolean | null): AsyncGenerator<WorkspaceEvent>;
  /** Remove a workspace binding */
  unbind(path: string): AsyncGenerator<WorkspaceEvent>;
}

/** Typed client implementation for hyperforge.workspace plugin */
export class HyperforgeWorkspaceClientImpl implements HyperforgeWorkspaceClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Bind a directory to an organization */
  async *bind(orgName: string, path: string, autoCreate?: boolean | null): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.bind', { auto_create: autoCreate, org_name: orgName, path: path });
    yield* extractData<WorkspaceEvent>(stream);
  }

  /** Clone all repos for all orgs bound to current workspace */
  async *cloneAll(): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.clone_all', {});
    yield* extractData<WorkspaceEvent>(stream);
  }

  /** Show diff for all orgs bound to current workspace */
  async *diff(path?: string | null): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.diff', { path: path });
    yield* extractData<WorkspaceEvent>(stream);
  }

  /** Import repos for all orgs bound to current workspace */
  async *import(includePrivate?: boolean | null): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.import', { include_private: includePrivate });
    yield* extractData<WorkspaceEvent>(stream);
  }

  /** List all workspace bindings */
  async *list(): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.list', {});
    yield* extractData<WorkspaceEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.workspace.schema', {});
    return collectOne<unknown>(stream);
  }

  /** Show current workspace resolution */
  async *show(path?: string | null): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.show', { path: path });
    yield* extractData<WorkspaceEvent>(stream);
  }

  /** Sync repos for all orgs bound to current workspace */
  async *sync(yes?: boolean | null): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.sync', { yes: yes });
    yield* extractData<WorkspaceEvent>(stream);
  }

  /** Remove a workspace binding */
  async *unbind(path: string): AsyncGenerator<WorkspaceEvent> {
    const stream = this.rpc.call('hyperforge.workspace.unbind', { path: path });
    yield* extractData<WorkspaceEvent>(stream);
  }

}

/** Create a typed hyperforge.workspace client from an RPC client */
export function createHyperforgeWorkspaceClient(rpc: RpcClient): HyperforgeWorkspaceClient {
  return new HyperforgeWorkspaceClientImpl(rpc);
}