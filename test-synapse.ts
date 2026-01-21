/**
 * Test Synapse execution directly
 */
import { createClient } from '@plexus/client/transport';
import { executeSynapse } from './src/agent/synapse';

const rpc = createClient({ url: 'ws://localhost:4444' });

console.log('🧪 Testing Synapse Execution\n');

// Test 1: Echo
console.log('Test 1: Echo');
const echoResult = await executeSynapse(rpc, {
  plugin: 'echo',
  method: 'once',
  args: { message: 'Hello from Synapse test!' },
  raw: true
});

console.log('Success:', echoResult.success);
console.log('Data:', echoResult.data);
console.log();

// Test 2: Health Check
console.log('Test 2: Health Check');
const healthResult = await executeSynapse(rpc, {
  plugin: 'health',
  method: 'check',
  args: {},
  raw: true
});

console.log('Success:', healthResult.success);
console.log('Data:', healthResult.data);
console.log();

// Test 3: Invalid command (error handling)
console.log('Test 3: Invalid Command (should fail gracefully)');
const errorResult = await executeSynapse(rpc, {
  plugin: 'nonexistent',
  method: 'method',
  args: {},
  raw: true
});

console.log('Success:', errorResult.success);
console.log('Exit Code:', errorResult.exitCode);
console.log('Stderr:', errorResult.stderr.substring(0, 100));
console.log();

console.log('✅ Synapse tests complete');
rpc.disconnect();
