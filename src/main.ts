/**
 * Substrate TypeScript Sandbox
 *
 * Demonstrates usage of the generated Plexus TypeScript client.
 * This serves as a starting point for building TypeScript frontends.
 */

import { createClient } from '@plexus/client/transport';
import {
  Health,
  Echo,
  Cone,
  Solar,
  Hyperforge,
  Arbor
} from '@plexus/client';

const PLEXUS_URL = process.env.PLEXUS_URL || 'ws://localhost:4444';

async function main() {
  console.log('🚀 Substrate TypeScript Sandbox\n');
  console.log(`Connecting to Plexus at ${PLEXUS_URL}...`);

  // Create RPC client
  const rpc = createClient({ url: PLEXUS_URL });

  try {
    // =========================================================================
    // Test 1: Health Check
    // =========================================================================
    console.log('\n📊 Health Check');
    console.log('─'.repeat(50));

    const health = new Health.HealthClientImpl(rpc);
    const healthStatus = await health.check();

    if (healthStatus.type === 'status') {
      console.log(`✓ Plexus is healthy`);
      console.log(`  Uptime: ${healthStatus.uptimeSeconds}s`);
    }

    // =========================================================================
    // Test 2: Echo Service
    // =========================================================================
    console.log('\n🔊 Echo Service');
    console.log('─'.repeat(50));

    const echo = new Echo.EchoClientImpl(rpc);

    // Simple echo
    const echoResult = await echo.once('Hello from TypeScript!');
    if (echoResult.type === 'echo') {
      console.log(`✓ Echo once: "${echoResult.message}"`);
    }

    // Multiple echoes
    const multiEcho = await echo.echo(3, 'TypeScript rocks');
    if (multiEcho.type === 'echo') {
      console.log(`✓ Echo ${multiEcho.count}x: "${multiEcho.message}"`);
    }

    // =========================================================================
    // Test 3: Solar System (Nested Namespaces)
    // =========================================================================
    console.log('\n🌍 Solar System Query');
    console.log('─'.repeat(50));

    const solar = new Solar.SolarClientImpl(rpc);

    for await (const event of solar.observe()) {
      if (event.type === 'system') {
        console.log(`✓ Solar system: ${event.star}`);
        console.log(`  Planets: ${event.planetCount}`);
        console.log(`  Moons: ${event.moonCount}`);
        console.log(`  Total bodies: ${event.totalBodies}`);
        break; // Just get first event
      }
    }

    // =========================================================================
    // Test 4: Cone List (LLM Agents)
    // =========================================================================
    console.log('\n🤖 Cone Management');
    console.log('─'.repeat(50));

    const cone = new Cone.ConeClientImpl(rpc);
    const coneList = await cone.list();

    if (coneList.type === 'cone_list') {
      if (coneList.cones.length === 0) {
        console.log('  No cones found');
      } else {
        console.log(`✓ Found ${coneList.cones.length} cone(s)`);
        for (const coneInfo of coneList.cones.slice(0, 5)) {
          console.log(`  - ${coneInfo.name} (${coneInfo.modelId})`);
        }
        if (coneList.cones.length > 5) {
          console.log(`  ... and ${coneList.cones.length - 5} more`);
        }
      }
    } else {
      console.log(`  Error listing cones: ${coneList.message}`);
    }

    // =========================================================================
    // Test 5: Arbor Trees (Conversation History)
    // =========================================================================
    console.log('\n🌳 Arbor Trees');
    console.log('─'.repeat(50));

    const arbor = new Arbor.ArborClientImpl(rpc);

    for await (const event of arbor.treeList()) {
      if (event.type === 'tree_list') {
        if (!event.treeIds || event.treeIds.length === 0) {
          console.log('  No trees found');
        } else {
          console.log(`✓ Found ${event.treeIds.length} tree(s)`);
          for (const treeId of event.treeIds.slice(0, 3)) {
            console.log(`  - Tree ${treeId.substring(0, 8)}...`);
          }
          if (event.treeIds.length > 3) {
            console.log(`  ... and ${event.treeIds.length - 3} more`);
          }
        }
        break; // Just get first event
      }
    }

    // =========================================================================
    // Test 6: Hyperforge Status (if available)
    // =========================================================================
    console.log('\n⚡ Hyperforge Status');
    console.log('─'.repeat(50));

    try {
      const hyperforge = new Hyperforge.HyperforgeClientImpl(rpc);

      for await (const event of hyperforge.status()) {
        if (event.type === 'status') {
          console.log(`✓ Hyperforge ${event.version}`);
          console.log(`  Config directory: ${event.configDir}`);
          console.log(`  Default org: ${event.defaultOrg || 'none'}`);
          console.log(`  Org count: ${event.orgCount}`);
          break;
        }
      }
    } catch (err) {
      console.log('  Hyperforge not available');
    }

    // =========================================================================
    // Success!
    // =========================================================================
    console.log('\n✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rpc.disconnect();
  }
}

// Run the sandbox
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
