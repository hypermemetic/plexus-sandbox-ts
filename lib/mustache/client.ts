// Auto-generated typed client (Layer 2)
// Wraps RPC layer and unwraps PlexusStreamItem to domain types

import type { RpcClient } from '../rpc';
import { extractData, collectOne } from '../rpc';
import type { MustacheEvent } from './types';

/** Typed client interface for mustache plugin */
export interface MustacheClient {
  /** Delete a template */
  deleteTemplate(method: string, name: string, pluginId: string): AsyncGenerator<MustacheEvent>;
  /** Get a specific template */
  getTemplate(method: string, name: string, pluginId: string): AsyncGenerator<MustacheEvent>;
  /** List all templates for a plugin */
  listTemplates(pluginId: string): AsyncGenerator<MustacheEvent>;
  /** Register a template for a plugin/method  Templates are identified by (plugin_id, method, name). If a template with the same identifier already exists, it will be updated. */
  registerTemplate(method: string, name: string, pluginId: string, template: string): AsyncGenerator<MustacheEvent>;
  /** Render a value using a template  Looks up the template for the given plugin/method/name combination and renders the value using mustache templating. If template_name is None, uses "default". */
  render(method: string, pluginId: string, value: unknown, templateName?: string | null): AsyncGenerator<MustacheEvent>;
  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  schema(): Promise<unknown>;
}

/** Typed client implementation for mustache plugin */
export class MustacheClientImpl implements MustacheClient {
  constructor(private readonly rpc: RpcClient) {}

  /** Delete a template */
  async *deleteTemplate(method: string, name: string, pluginId: string): AsyncGenerator<MustacheEvent> {
    const stream = this.rpc.call('mustache.delete_template', { method: method, name: name, plugin_id: pluginId });
    yield* extractData<MustacheEvent>(stream);
  }

  /** Get a specific template */
  async *getTemplate(method: string, name: string, pluginId: string): AsyncGenerator<MustacheEvent> {
    const stream = this.rpc.call('mustache.get_template', { method: method, name: name, plugin_id: pluginId });
    yield* extractData<MustacheEvent>(stream);
  }

  /** List all templates for a plugin */
  async *listTemplates(pluginId: string): AsyncGenerator<MustacheEvent> {
    const stream = this.rpc.call('mustache.list_templates', { plugin_id: pluginId });
    yield* extractData<MustacheEvent>(stream);
  }

  /** Register a template for a plugin/method  Templates are identified by (plugin_id, method, name). If a template with the same identifier already exists, it will be updated. */
  async *registerTemplate(method: string, name: string, pluginId: string, template: string): AsyncGenerator<MustacheEvent> {
    const stream = this.rpc.call('mustache.register_template', { method: method, name: name, plugin_id: pluginId, template: template });
    yield* extractData<MustacheEvent>(stream);
  }

  /** Render a value using a template  Looks up the template for the given plugin/method/name combination and renders the value using mustache templating. If template_name is None, uses "default". */
  async *render(method: string, pluginId: string, value: unknown, templateName?: string | null): AsyncGenerator<MustacheEvent> {
    const stream = this.rpc.call('mustache.render', { method: method, plugin_id: pluginId, template_name: templateName, value: value });
    yield* extractData<MustacheEvent>(stream);
  }

  /** Get plugin or method schema. Pass {"method": "name"} for a specific method. */
  async schema(): Promise<unknown> {
    const stream = this.rpc.call('mustache.schema', {});
    return collectOne<unknown>(stream);
  }

}

/** Create a typed mustache client from an RPC client */
export function createMustacheClient(rpc: RpcClient): MustacheClient {
  return new MustacheClientImpl(rpc);
}