/**
 * Debug test for agent tool calling
 *
 * This logs the raw Cone responses to see if tool calls are being made
 */

import { createClient } from '@plexus/client/transport';
import { Cone } from '@plexus/client';
import { createAgent, DefaultToolRegistry } from './agent';
import { createSynapseCallTool, getSynapseDiscoveryDocs } from './agent/tools-simple';

const PLEXUS_URL = process.env.PLEXUS_URL || 'ws://localhost:4444';

async function main() {
  console.log('🔍 Debug Test - Tool Calling\n');

  const rpc = createClient({ url: PLEXUS_URL });
  const cone = new Cone.ConeClientImpl(rpc);

  const tools = new DefaultToolRegistry();
  tools.register(createSynapseCallTool());

  const systemPrompt = `You are a helpful assistant that explores and uses the Plexus system via Synapse.

${getSynapseDiscoveryDocs()}

When asked to do something, first think about what Synapse commands you need, then use the synapse_call tool to execute them.

IMPORTANT: You MUST use the synapse_call tool to answer questions about the system. Do not guess or make up information.

Example:
User: "Is the system healthy?"
You should output:
<tool>
{"name": "synapse_call", "input": {"activation": "health", "method": "check", "params": {}}}
</tool>

Then provide an answer based on the result.`;

  // Create Cone with unique name and system prompt
  const coneName = `debug-agent-${Date.now()}`;
  const createResult = await cone.create(
    'claude-sonnet-4-5-20250929',
    coneName,
    {},
    systemPrompt  // ← PASS SYSTEM PROMPT HERE!
  );

  if (createResult.type !== 'cone_created') {
    console.error('Failed to create cone:', createResult);
    process.exit(1);
  }

  console.log(`✓ Created Cone: ${coneName} (${createResult.coneId})\n`);

  const coneIdentifier: Cone.ConeIdentifier = {
    type: 'by_id',
    id: createResult.coneId
  };

  const agent = createAgent('debug-agent')
    .withSystem(systemPrompt)
    .withRPC(rpc)
    .withTools(tools)
    .withCone(coneIdentifier)
    .ephemeral(false)
    .maxTurns(10)
    .maxToolCallsPerTurn(5)
    .build();

  const query = "Check if the system is healthy. Use the synapse_call tool.";

  console.log(`👤 User: ${query}\n`);

  for await (const event of agent.run(query)) {
    console.log('EVENT:', JSON.stringify(event, null, 2));
  }

  rpc.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
