/**
 * Test tool system and tool call parsing
 */
import { createEchoTool, createHealthCheckTool, buildToolsPrompt } from './src/agent/tools';

console.log('🧪 Testing Tool System\n');

// Test 1: Tool creation
console.log('Test 1: Tool Creation');
const echoTool = createEchoTool();
console.log('Tool name:', echoTool.name);
console.log('Tool description:', echoTool.description);
console.log('Input schema:', JSON.stringify(echoTool.inputSchema, null, 2));

const synapseCmd = echoTool.toSynapseCommand({ message: 'test' });
console.log('Synapse command:', synapseCmd);
console.log();

// Test 2: Build tools prompt
console.log('Test 2: Tools Prompt Generation');
const tools = [createEchoTool(), createHealthCheckTool()];
const prompt = buildToolsPrompt(tools);
console.log(prompt);
console.log();

// Test 3: Tool call parsing simulation
console.log('Test 3: Tool Call Parsing (simulated)');
const llmOutput = `
Let me check the system health for you.

<tool>
{"name": "health_check", "input": {}}
</tool>
`;

const regex = /<tool>(.*?)<\/tool>/gs;
const match = regex.exec(llmOutput);
if (match) {
  const parsed = JSON.parse(match[1].trim());
  console.log('Parsed tool call:', parsed);
}
console.log();

console.log('✅ Tool tests complete');
