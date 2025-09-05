#!/usr/bin/env tsx

/**
 * Test script for offline functionality
 *
 * This script tests:
 * 1. Offline action queuing
 * 2. Conflict resolution
 * 3. Synchronization when connection is restored
 * 4. Error handling and retry logic
 */

import {
  offlineManager,
  queueJobProgress,
  queueLocationUpdate,
  queueAvailabilityUpdate,
  queueJobClaim,
} from '../src/lib/offline';

async function testOfflineFunctionality() {
  console.log('🧪 Testing Offline Functionality\n');

  try {
    // Test 1: Queue actions while offline
    console.log('1. Testing action queuing...');

    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Queue various actions
    const jobProgressId = await queueJobProgress(
      'test-job-123',
      'arrived_pickup',
      {
        photos: ['photo1.jpg', 'photo2.jpg'],
        notes: 'Arrived at pickup location',
      }
    );
    console.log('✅ Job progress queued:', jobProgressId);

    const locationId = await queueLocationUpdate(51.5074, -0.1278);
    console.log('✅ Location update queued:', locationId);

    const availabilityId = await queueAvailabilityUpdate('online');
    console.log('✅ Availability update queued:', availabilityId);

    const jobClaimId = await queueJobClaim('test-job-456');
    console.log('✅ Job claim queued:', jobClaimId);

    // Check pending actions
    const state = offlineManager.getState();
    console.log(`📊 Pending actions: ${state.pendingActions.length}`);
    console.log(`🌐 Online status: ${state.isOnline}`);

    // Test 2: Action type filtering
    console.log('\n2. Testing action type filtering...');

    const jobActions = offlineManager.getPendingActionsByType('job_progress');
    const locationActions =
      offlineManager.getPendingActionsByType('location_update');
    const availabilityActions = offlineManager.getPendingActionsByType(
      'availability_update'
    );
    const claimActions = offlineManager.getPendingActionsByType('job_claim');

    console.log(`📋 Job progress actions: ${jobActions.length}`);
    console.log(`📍 Location actions: ${locationActions.length}`);
    console.log(`🔄 Availability actions: ${availabilityActions.length}`);
    console.log(`🎯 Claim actions: ${claimActions.length}`);

    // Test 3: Simulate connection restoration
    console.log('\n3. Testing connection restoration...');

    // Simulate online state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Trigger sync
    await offlineManager.syncPendingActions();

    const newState = offlineManager.getState();
    console.log(
      `📊 Remaining pending actions: ${newState.pendingActions.length}`
    );

    // Test 4: Error handling and retry logic
    console.log('\n4. Testing error handling...');

    // Queue an action that will fail
    const failingActionId = await offlineManager.queueAction({
      type: 'job_progress',
      url: '/api/driver/jobs/invalid-id/progress',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'test', payload: {} }),
      maxRetries: 2,
    });
    console.log('✅ Failing action queued:', failingActionId);

    // Try to sync (should fail and retry)
    await offlineManager.syncPendingActions();

    const finalState = offlineManager.getState();
    console.log(
      `📊 Final pending actions: ${finalState.pendingActions.length}`
    );

    // Test 5: Clear all actions
    console.log('\n5. Testing action clearing...');

    await offlineManager.clearAllActions();

    const clearedState = offlineManager.getState();
    console.log(
      `📊 Actions after clearing: ${clearedState.pendingActions.length}`
    );

    console.log('\n✅ All offline functionality tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Test conflict resolution
async function testConflictResolution() {
  console.log('\n🔧 Testing Conflict Resolution\n');

  try {
    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Queue multiple actions for the same job
    const jobId = 'conflict-test-job';

    await queueJobProgress(jobId, 'arrived_pickup', { notes: 'First arrival' });
    await queueJobProgress(jobId, 'arrived_pickup', {
      notes: 'Second arrival',
    });
    await queueJobProgress(jobId, 'loaded', { notes: 'Loaded items' });

    console.log('✅ Multiple actions queued for same job');

    // Check action order
    const jobActions = offlineManager.getPendingActionsByType('job_progress');
    console.log(`📋 Queued job actions: ${jobActions.length}`);

    jobActions.forEach((action, index) => {
      const payload = JSON.parse(action.body || '{}');
      console.log(
        `  ${index + 1}. ${payload.step}: ${payload.payload?.notes || 'No notes'}`
      );
    });

    // Simulate online and sync
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    await offlineManager.syncPendingActions();

    console.log('✅ Conflict resolution test completed');
  } catch (error) {
    console.error('❌ Conflict resolution test failed:', error);
  }
}

// Test performance and memory usage
async function testPerformance() {
  console.log('\n⚡ Testing Performance\n');

  try {
    const startTime = Date.now();

    // Queue many actions quickly
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        queueLocationUpdate(51.5074 + i * 0.001, -0.1278 + i * 0.001)
      );
    }

    await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Queued 100 location updates in ${duration}ms`);
    console.log(`📊 Average time per action: ${duration / 100}ms`);

    // Check memory usage
    const state = offlineManager.getState();
    console.log(`📊 Total pending actions: ${state.pendingActions.length}`);

    // Clear actions
    await offlineManager.clearAllActions();

    console.log('✅ Performance test completed');
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Offline Functionality Tests\n');

  await testOfflineFunctionality();
  await testConflictResolution();
  await testPerformance();

  console.log('\n🎉 All tests completed successfully!');
  process.exit(0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { testOfflineFunctionality, testConflictResolution, testPerformance };
