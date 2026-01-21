// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../../../../rpc';
import { extractData, collectOne } from '../../../../rpc';
import type { RepoEvent } from '../../../../hyperforge/org/hypermemetic/repos/types';

/** Typed client interface for hyperforge.org.juggernautlabs.repos plugin */
export interface HyperforgeOrgJuggernautlabsReposClient {
  /** Clone a repository from forges and configure remotes */
  clone(repoName: string, target?: string | null): AsyncGenerator<RepoEvent>;
  /** Clone all repositories for an organization */
  cloneAll(target?: string | null): AsyncGenerator<RepoEvent>;
  /** Full bidirectional sync with convergence verification */
  converge(dryRun?: boolean | null, yes?: boolean | null): AsyncGenerator<RepoEvent>;
  /** Create/update a repository configuration */
  create(repoName: string, description?: string | null, forges?: string | null, initLocal?: boolean | null, path?: string | null, visibility?: string | null): AsyncGenerator<RepoEvent>;
  /** Compare local desired state vs remote actual state */
  diff(refresh?: boolean | null): AsyncGenerator<RepoEvent>;
  /** List repositories in this organization */
  list(staged?: boolean | null): AsyncGenerator<RepoEvent>;
  /** Refresh local state from forge APIs */
  refresh(force?: boolean | null): AsyncGenerator<RepoEvent>;
  /** Mark a repository for deletion */
  remove(repoName: string, force?: boolean | null): AsyncGenerator<RepoEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
  /** Sync repositories to forges */
  sync(dryRun?: boolean | null, repoName?: string | null, yes?: boolean | null): AsyncGenerator<RepoEvent>;
}

/** Typed client implementation for hyperforge.org.juggernautlabs.repos plugin */
export class HyperforgeOrgJuggernautlabsReposClientImpl implements HyperforgeOrgJuggernautlabsReposClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Clone a repository from forges and configure remotes */
  async *clone(repoName: string, target?: string | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.clone', { repo_name: repoName, target: target });
    yield* extractData<RepoEvent>(stream);
  }

  /** Clone all repositories for an organization */
  async *cloneAll(target?: string | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.clone_all', { target: target });
    yield* extractData<RepoEvent>(stream);
  }

  /** Full bidirectional sync with convergence verification */
  async *converge(dryRun?: boolean | null, yes?: boolean | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.converge', { dry_run: dryRun, yes: yes });
    yield* extractData<RepoEvent>(stream);
  }

  /** Create/update a repository configuration */
  async *create(repoName: string, description?: string | null, forges?: string | null, initLocal?: boolean | null, path?: string | null, visibility?: string | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.create', { description: description, forges: forges, init_local: initLocal, path: path, repo_name: repoName, visibility: visibility });
    yield* extractData<RepoEvent>(stream);
  }

  /** Compare local desired state vs remote actual state */
  async *diff(refresh?: boolean | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.diff', { refresh: refresh });
    yield* extractData<RepoEvent>(stream);
  }

  /** List repositories in this organization */
  async *list(staged?: boolean | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.list', { staged: staged });
    yield* extractData<RepoEvent>(stream);
  }

  /** Refresh local state from forge APIs */
  async *refresh(force?: boolean | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.refresh', { _force: force });
    yield* extractData<RepoEvent>(stream);
  }

  /** Mark a repository for deletion */
  async *remove(repoName: string, force?: boolean | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.remove', { force: force, repo_name: repoName });
    yield* extractData<RepoEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.schema', {});
    return collectOne<unknown>(stream);
  }

  /** Sync repositories to forges */
  async *sync(dryRun?: boolean | null, repoName?: string | null, yes?: boolean | null): AsyncGenerator<RepoEvent> {
    const stream = this.rpc.call('hyperforge.org.juggernautlabs.repos.sync', { dry_run: dryRun, repo_name: repoName, yes: yes });
    yield* extractData<RepoEvent>(stream);
  }

}

/** Create a typed hyperforge.org.juggernautlabs.repos client from an RPC client */
export function createHyperforgeOrgJuggernautlabsReposClient(rpc: RpcClient): HyperforgeOrgJuggernautlabsReposClient {
  return new HyperforgeOrgJuggernautlabsReposClientImpl(rpc);
}