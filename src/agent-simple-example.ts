/**
 * Example: Self-Discovering Agent with Synapse
 *
 * This agent has ONE generic tool (synapse_call) and learns the
 * Plexus API surface by exploring with --help.
 *
 * The LLM discovers what's available and figures out how to use it.
 */

import { createClient } from '@plexus/client/transport';
import { Cone } from '@plexus/client';
import { createAgent, DefaultToolRegistry } from './agent';
import { createSynapseCallTool, getSynapseDiscoveryDocs } from './agent/tools-simple';

const PLEXUS_URL = process.env.PLEXUS_URL || 'ws://localhost:4444';

async function main() {
  console.log('🤖 Self-Discovering Agent with Synapse\n');
  console.log('═'.repeat(60));
  console.log('Architecture:');
  console.log('  • Agent: TypeScript orchestration');
  console.log('  • LLM: Cone (learns API dynamically)');
  console.log('  • Tools: ONE generic synapse_call tool');
  console.log('  • Discovery: Agent explores with --help');
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
    'discovery-agent',
    {},
    undefined  // No system prompt yet - we'll add it in agent config
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

  // Register just ONE tool - the generic synapse_call
  console.log('Registering tools...');
  const tools = new DefaultToolRegistry();
  tools.register(createSynapseCallTool());

  console.log('Available tools: synapse_call (discovers everything else)');
  console.log();

  // Build system prompt with discovery documentation
  const systemPrompt = `You are a helpful assistant that explores and uses the Plexus system via Synapse.

${getSynapseDiscoveryDocs()}

When asked to do something, first think about what Synapse commands you need, then use the synapse_call tool to execute them.

You can explore the API surface dynamically - use bash.execute to run synapse --help commands if you need to discover what's available.`;

  // Create agent
  const agent = createAgent('discovery-agent')
    .withSystem(systemPrompt)
    .withRPC(rpc)
    .withTools(tools)
    .withCone(coneIdentifier)
    .ephemeral(false)
    .maxTurns(10)
    .maxToolCallsPerTurn(5)
    .build();

  // Run example queries that require discovery
  const queries = [
    "Check if the system is healthy",
    "List all the cones in the system",
    "What activations are available? Explore the system."
  ];

  for (const query of queries) {
    console.log('─'.repeat(60));
    console.log(`👤 User: ${query}`);
    console.log();

    try {
      let turnCount = 0;

      for await (const event of agent.run(query)) {
        switch (event.type) {
          case 'thinking':
            console.log(`💭 ${event.message}`);
            break;

          case 'tool_call':
            console.log(`🔧 synapse_call:`);
            console.log(`   ${JSON.stringify(event.input, null, 2)}`);
            break;

          case 'tool_result':
            if (event.error) {
              console.log(`   ❌ Error: ${JSON.stringify(event.result)}`);
            } else {
              const resultStr = typeof event.result === 'string'
                ? event.result
                : JSON.stringify(event.result);
              const preview = resultStr.length > 150
                ? resultStr.substring(0, 150) + '...'
                : resultStr;
              console.log(`   ✓ Result: ${preview}`);
            }
            break;

          case 'response_chunk':
            process.stdout.write(event.text);
            break;

          case 'turn_complete':
            turnCount = event.turn;
            break;

          case 'done':
            console.log('\n');
            console.log(`✓ Complete in ${turnCount} turn(s)`);
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
  console.log('\n✨ Discovery demo complete!\n');
  console.log('The agent learned the API surface dynamically!');
  console.log();

  rpc.disconnect();
}

// Run with error handling
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
