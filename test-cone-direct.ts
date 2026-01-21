/**
 * Test cone.create directly via RPC (bypassing typed client)
 */
import { createClient } from '@plexus/client/transport';

const rpc = createClient({ url: 'ws://localhost:4444' });

console.log('Testing cone.create via direct RPC...\n');

// Call with snake_case parameters (what the method actually expects)
const stream = rpc.call('cone.create', {
  model_id: 'claude-sonnet-4-5-20250929',
  name: 'direct-rpc-test',
  system_prompt: 'You are a test assistant'
});

for await (const item of stream) {
  console.log('Item:', JSON.stringify(item, null, 2));
}

rpc.disconnect();
