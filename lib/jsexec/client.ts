// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { JsExecEvent, ScriptId, ScriptMetadata } from './types';

/** Typed client interface for jsexec plugin */
export interface JsexecClient {
  /** Delete a stored script */
  deleteScript(scriptId: ScriptId): AsyncGenerator<JsExecEvent>;
  /** Evaluate a JavaScript expression and return the result */
  eval(expr: string): AsyncGenerator<JsExecEvent>;
  /** Execute JavaScript code and stream results */
  execute(code: string): AsyncGenerator<JsExecEvent>;
  /** Run a previously stored script */
  executeScript(scriptId: ScriptId): AsyncGenerator<JsExecEvent>;
  /** List all stored scripts */
  listScripts(): Promise<ScriptMetadata>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
  /** Store a script for later execution */
  store(code: string, name: string, description?: string | null): AsyncGenerator<JsExecEvent>;
}

/** Typed client implementation for jsexec plugin */
export class JsexecClientImpl implements JsexecClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Delete a stored script */
  async *deleteScript(scriptId: ScriptId): AsyncGenerator<JsExecEvent> {
    const stream = this.rpc.call('jsexec.delete_script', { script_id: scriptId });
    yield* extractData<JsExecEvent>(stream);
  }

  /** Evaluate a JavaScript expression and return the result */
  async *eval(expr: string): AsyncGenerator<JsExecEvent> {
    const stream = this.rpc.call('jsexec.eval', { expr: expr });
    yield* extractData<JsExecEvent>(stream);
  }

  /** Execute JavaScript code and stream results */
  async *execute(code: string): AsyncGenerator<JsExecEvent> {
    const stream = this.rpc.call('jsexec.execute', { code: code });
    yield* extractData<JsExecEvent>(stream);
  }

  /** Run a previously stored script */
  async *executeScript(scriptId: ScriptId): AsyncGenerator<JsExecEvent> {
    const stream = this.rpc.call('jsexec.execute_script', { script_id: scriptId });
    yield* extractData<JsExecEvent>(stream);
  }

  /** List all stored scripts */
  async listScripts(): Promise<ScriptMetadata> {
    const stream = this.rpc.call('jsexec.list_scripts', {});
    return collectOne<ScriptMetadata>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('jsexec.schema', {});
    return collectOne<unknown>(stream);
  }

  /** Store a script for later execution */
  async *store(code: string, name: string, description?: string | null): AsyncGenerator<JsExecEvent> {
    const stream = this.rpc.call('jsexec.store', { code: code, description: description, name: name });
    yield* extractData<JsExecEvent>(stream);
  }

}

/** Create a typed jsexec client from an RPC client */
export function createJsexecClient(rpc: RpcClient): JsexecClient {
  return new JsexecClientImpl(rpc);
}