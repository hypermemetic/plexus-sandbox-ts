import { createClient } from '@plexus/client/transport';
import { Cone } from '@plexus/client';

async function main() {
  const rpc = createClient({ url: 'ws://localhost:4444' });
  const cone = new Cone.ConeClientImpl(rpc);

  console.log('Creating cone...');
  const result = await cone.create(
    'claude-sonnet-4-5-20250929',
    'test-response-check',
    {},
    'test prompt'
  );

  console.log('Result type:', result.type);
  console.log('Raw result:', JSON.stringify(result, null, 2));
  console.log('Has coneId?', 'coneId' in result);
  console.log('Has cone_id?', 'cone_id' in result);
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
