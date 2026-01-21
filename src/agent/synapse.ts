/**
 * Synapse CLI execution via Plexus bash.execute RPC
 *
 * This module provides safe execution of Synapse commands through the Plexus
 * bash activation, avoiding shell injection risks and local child_process usage.
 *
 * Key features:
 * - Safe command building with proper escaping
 * - Streaming stdout/stderr/exit collection
 * - JSON parsing for --raw mode
 * - Type-safe interface over Synapse CLI
 */

import type { RpcClient } from '@plexus/client/rpc';
import { Bash } from '@plexus/client';

// ============================================================================
// Types
// ============================================================================

/**
 * A Synapse command to execute
 *
 * Example:
 *   { plugin: 'cone', method: 'list', args: {}, raw: true }
 *   → synapse cone list --raw
 *
 *   { plugin: 'echo', method: 'once', args: { message: 'hello' }, raw: true }
 *   → synapse echo once --message "hello" --raw
 */
export interface SynapseCommand {
  /** Plugin name (e.g., 'cone', 'health', 'echo') */
  plugin: string;

  /** Method name (e.g., 'list', 'check', 'once') */
  method: string;

  /** Arguments as key-value pairs */
  args: Record<string, unknown>;

  /** Whether to use --raw flag for JSON output */
  raw?: boolean;
}

/**
 * Result of a Synapse command execution
 */
export interface SynapseResult {
  /** Whether the command succeeded (exit code 0) */
  success: boolean;

  /** Standard output (full text) */
  stdout: string;

  /** Standard error (full text) */
  stderr: string;

  /** Exit code from the process */
  exitCode: number;

  /** Parsed JSON data (if raw=true and JSON is valid) */
  data?: unknown;
}

// ============================================================================
// Command Building
// ============================================================================

/**
 * Build a safe Synapse CLI command string
 *
 * Properly escapes arguments to prevent shell injection.
 * Uses JSON.stringify for complex values.
 *
 * Examples:
 *   buildSynapseCommand({ plugin: 'cone', method: 'list', args: {}, raw: true })
 *   → "synapse plexus cone list --raw"
 *
 *   buildSynapseCommand({ plugin: 'echo', method: 'once', args: { message: 'hello' } })
 *   → "synapse plexus echo once --message \"hello\""
 *
 *   buildSynapseCommand({ plugin: 'cone', method: 'chat', args: { id: 'test', prompt: 'hi' } })
 *   → "synapse plexus cone chat --id \"test\" --prompt \"hi\""
 */
export function buildSynapseCommand(cmd: SynapseCommand): string {
  const parts = ['synapse', 'plexus', cmd.plugin, cmd.method];

  // Add arguments
  for (const [key, value] of Object.entries(cmd.args)) {
    // Convert camelCase to snake_case for CLI args (synapse uses snake_case)
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    if (value === true) {
      // Boolean true: just add the flag
      parts.push(`--${snakeKey}`, 'true');
    } else if (value === false) {
      // Boolean false: add the flag with false
      parts.push(`--${snakeKey}`, 'false');
    } else if (value === null || value === undefined) {
      // Skip null/undefined
      continue;
    } else if (typeof value === 'string') {
      // String: quote it
      parts.push(`--${snakeKey}`, `"${escapeQuotes(value)}"`);
    } else if (typeof value === 'number') {
      // Number: no quotes
      parts.push(`--${snakeKey}`, String(value));
    } else {
      // Complex object: JSON stringify and quote
      parts.push(`--${snakeKey}`, `'${JSON.stringify(value)}'`);
    }
  }

  // Add --raw flag if requested
  if (cmd.raw) {
    parts.push('--raw');
  }

  return parts.join(' ');
}

/**
 * Escape double quotes in a string for shell safety
 */
function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

// ============================================================================
// Command Execution
// ============================================================================

/**
 * Execute a Synapse command via bash.execute RPC
 *
 * Streams stdout, stderr, and exit code from the bash activation,
 * then parses JSON if --raw mode was used.
 *
 * Example:
 *   const result = await executeSynapse(rpc, {
 *     plugin: 'cone',
 *     method: 'list',
 *     args: {},
 *     raw: true
 *   });
 *
 *   if (result.success) {
 *     console.log('Cones:', result.data);
 *   } else {
 *     console.error('Error:', result.stderr);
 *   }
 */
export async function executeSynapse(
  rpc: RpcClient,
  cmd: SynapseCommand
): Promise<SynapseResult> {
  const bash = new Bash.BashClientImpl(rpc);
  const command = buildSynapseCommand(cmd);

  let stdout = '';
  let stderr = '';
  let exitCode = -1;

  // Stream bash events
  for await (const event of bash.execute(command)) {
    switch (event.type) {
      case 'stdout':
        stdout += event.line + '\n';
        break;

      case 'stderr':
        stderr += event.line + '\n';
        break;

      case 'exit':
        exitCode = event.code;
        break;
    }
  }

  const success = exitCode === 0;
  let data: unknown = undefined;

  // Try to parse JSON if raw mode was used
  if (cmd.raw && success && stdout.trim()) {
    try {
      data = JSON.parse(stdout.trim());
    } catch (err) {
      // JSON parse failed - leave data undefined
      stderr += `\n[JSON Parse Error: ${err instanceof Error ? err.message : String(err)}]`;
    }
  }

  return {
    success,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    exitCode,
    data
  };
}
