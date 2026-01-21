/**
 * Example: TypeScript Agent with Cone + Synapse
 *
 * Demonstrates an agent that:
 * - Runs in TypeScript (orchestration)
 * - Uses Cone for LLM reasoning (via Plexus)
 * - Executes tools via Synapse CLI (bash.execute)
 * - No external API keys required
 */

import { createClient } from '@plexus/client/transport';
import { Cone } from '@plexus/client';
import {
  createAgent,
  DefaultToolRegistry,
  getBasicTools,
  getSystemTools
} from './agent';

const PLEXUS_URL = process.env.PLEXUS_URL || 'ws://localhost:4444';

async function main() {
  console.log('🤖 TypeScript Agent with Cone + Synapse\n');
  console.log('═'.repeat(60));
  console.log('Architecture:');
  console.log('  • Agent: TypeScript orchestration (this code)');
  console.log('  • LLM: Cone (Plexus RPC)');
  console.log('  • Tools: Synapse CLI → Plexus methods');
  console.log('  • Runtime: Substrate/Plexus');
  console.log('  • No API keys required!');
  console.log('═'.repeat(60));
  console.log();

  // Connect to Plexus
  console.log(`Connecting to Plexus at ${PLEXUS_URL}...`);
  const rpc = createClient({ url: PLEXUS_URL });

  // Create a Cone for LLM reasoning
  console.log('Creating Cone for reasoning...');
  const cone = new Cone.ConeClientImpl(rpc);

  const createResult = await cone.create(
    'claude-sonnet-4-5-20250929',
    'typescript-agent-demo',
    {},
    'You are a helpful assistant that can explore the Substrate/Plexus system.'
  );

  if (createResult.type !== 'cone_created') {
    console.error('Failed to create cone:', createResult);
    process.exit(1);
  }

  // Create proper ConeIdentifier using the generated type
  const coneIdentifier: Cone.ConeIdentifier = {
    type: 'by_id',
    id: createResult.coneId
  };
  console.log(`✓ Cone created: ${createResult.coneId.substring(0, 8)}...`);
  console.log();

  // Set up tools
  console.log('Registering tools...');
  const tools = new DefaultToolRegistry();
  tools.registerAll([
    ...getBasicTools(),
    ...getSystemTools()
  ]);

  console.log(`Available tools: ${tools.list().map(t => t.name).join(', ')}`);
  console.log();

  // Create agent
  const agent = createAgent('substrate-explorer')
    .withSystem(`You are a helpful assistant that can explore the Substrate/Plexus system.

You have access to tools that let you interact with the system.
When asked questions about the system, use these tools to gather information.
Be concise but informative in your responses.`)
    .withRPC(rpc)
    .withTools(tools)
    .withCone(coneIdentifier)
    .ephemeral(false)
    .maxTurns(5)
    .maxToolCallsPerTurn(3)
    .build();

  // Run some example queries
  const queries = [
    "Is the system healthy? Check and tell me the uptime.",
    "What's in the solar system?",
    "Are there any LLM agents (cones) in the system? List them."
  ];

  for (const query of queries) {
    console.log('─'.repeat(60));
    console.log(`👤 User: ${query}`);
    console.log();

    try {
      let turnCount = 0;
      let responseText = '';

      for await (const event of agent.run(query)) {
        switch (event.type) {
          case 'thinking':
            console.log(`💭 ${event.message}`);
            break;

          case 'tool_call':
            console.log(`🔧 Calling tool: ${event.tool}`);
            console.log(`   Input: ${JSON.stringify(event.input)}`);
            break;

          case 'tool_result':
            if (event.error) {
              console.log(`   ❌ Error: ${event.result}`);
            } else {
              const resultStr = typeof event.result === 'string'
                ? event.result
                : JSON.stringify(event.result);
              const preview = resultStr.length > 100
                ? resultStr.substring(0, 100) + '...'
                : resultStr;
              console.log(`   ✓ Result: ${preview}`);
            }
            break;

          case 'response_chunk':
            responseText += event.text;
            process.stdout.write(event.text);
            break;

          case 'response_complete':
            responseText = event.text;
            break;

          case 'turn_complete':
            turnCount = event.turn;
            break;

          case 'done':
            if (!responseText) {
              console.log(`\n🤖 Agent: ${event.finalResponse}`);
            } else {
              console.log(); // New line after streaming
            }
            console.log(`\n✓ Complete in ${turnCount} turn(s)`);
            break;

          case 'error':
            console.error(`\n❌ Error: ${event.error}`);
            break;
        }
      }

      console.log();
    } catch (error) {
      console.error('Failed:', error);
    }
  }

  console.log('─'.repeat(60));
  console.log('\n✨ Demo complete!\n');

  rpc.disconnect();
}

// Run with error handling
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
