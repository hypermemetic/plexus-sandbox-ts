// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../rpc';
import { extractData, collectOne } from '../../rpc';
import type { OrgEvent } from './types';

/** Typed client interface for hyperforge.org plugin */
export interface HyperforgeOrgClient {
  /** Create a new organization */
  create(forges: string, orgName: string, origin: string, owner: string, sshKey: string, defaultVisibility?: string | null): AsyncGenerator<OrgEvent>;
  /** Import repositories from existing forges */
  import(orgName: string, dryRun?: boolean | null, includePrivate?: boolean | null): AsyncGenerator<OrgEvent>;
  /** List all configured organizations */
  list(): AsyncGenerator<OrgEvent>;
  /** Remove an organization */
  remove(orgName: string): AsyncGenerator<OrgEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
  /** Show details of a specific organization */
  show(orgName: string): AsyncGenerator<OrgEvent>;
}

/** Typed client implementation for hyperforge.org plugin */
export class HyperforgeOrgClientImpl implements HyperforgeOrgClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Create a new organization */
  async *create(forges: string, orgName: string, origin: string, owner: string, sshKey: string, defaultVisibility?: string | null): AsyncGenerator<OrgEvent> {
    const stream = this.rpc.call('hyperforge.org.create', { defaultVisibility, forges, orgName, origin, owner, sshKey });
    yield* extractData<OrgEvent>(stream);
  }

  /** Import repositories from existing forges */
  async *import(orgName: string, dryRun?: boolean | null, includePrivate?: boolean | null): AsyncGenerator<OrgEvent> {
    const stream = this.rpc.call('hyperforge.org.import', { dryRun, includePrivate, orgName });
    yield* extractData<OrgEvent>(stream);
  }

  /** List all configured organizations */
  async *list(): AsyncGenerator<OrgEvent> {
    const stream = this.rpc.call('hyperforge.org.list', {});
    yield* extractData<OrgEvent>(stream);
  }

  /** Remove an organization */
  async *remove(orgName: string): AsyncGenerator<OrgEvent> {
    const stream = this.rpc.call('hyperforge.org.remove', { orgName });
    yield* extractData<OrgEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.org.schema', {});
    return collectOne<unknown>(stream);
  }

  /** Show details of a specific organization */
  async *show(orgName: string): AsyncGenerator<OrgEvent> {
    const stream = this.rpc.call('hyperforge.org.show', { orgName });
    yield* extractData<OrgEvent>(stream);
  }

}

/** Create a typed hyperforge.org client from an RPC client */
export function createHyperforgeOrgClient(rpc: RpcClient): HyperforgeOrgClient {
  return new HyperforgeOrgClientImpl(rpc);
}