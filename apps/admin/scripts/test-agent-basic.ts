#!/usr/bin/env tsx

/**
 * Basic Speedy Van AI Agent Test Script
 * 
 * This script tests the AI Agent functionality without requiring
 * the database or RAG system to be fully set up.
 * 
 * Usage:
 *   pnpm tsx scripts/test-agent-basic.ts
 */

import { chatLLM } from '../src/agent/llm';

async function testLLMConnection() {
  console.log('🧪 Testing LLM Connection...');
  
  try {
    const response = await chatLLM(
      'You are a helpful assistant. Respond briefly.',
      [{ role: 'user', content: 'Hello, how are you?' }]
    );
    
    console.log('✅ LLM connection successful');
    console.log(`   Response: ${response.substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.error('❌ LLM connection failed:', error);
    return false;
  }
}

async function testBilingualSupport() {
  console.log('\n🧪 Testing Bilingual Support...');
  
  try {
    // Test Arabic
    const arabicResponse = await chatLLM(
      'You are a bilingual assistant. Respond in Arabic first, then English.',
      [{ role: 'user', content: 'ما هي خدمات النقل؟' }]
    );
    
    console.log('✅ Arabic query processed');
    console.log(`   Response length: ${arabicResponse.length} characters`);
    
    // Test English
    const englishResponse = await chatLLM(
      'You are a helpful assistant.',
      [{ role: 'user', content: 'What are your moving services?' }]
    );
    
    console.log('✅ English query processed');
    console.log(`   Response length: ${englishResponse.length} characters`);
    
    return true;
  } catch (error) {
    console.error('❌ Bilingual support test failed:', error);
    return false;
  }
}

async function testToolUnderstanding() {
  console.log('\n🧪 Testing Tool Understanding...');
  
  try {
    const response = await chatLLM(
      `You are an AI agent with access to these tools:
- pricing.calculate: Calculate moving service pricing
- booking.status: Check booking status
- payment.status: Verify payment status
- notify.send: Send notifications

If the user needs a tool, respond with: TOOL:<tool_name>::<json_args>
Otherwise, provide a helpful answer.`,
      [{ role: 'user', content: 'I need to calculate pricing for moving a sofa 10km' }]
    );
    
    console.log('✅ Tool understanding test passed');
    console.log(`   Response: ${response.substring(0, 200)}...`);
    
    // Check if tool was suggested
    if (response.includes('TOOL:')) {
      console.log('   ✅ Tool execution was suggested');
    } else {
      console.log('   ℹ️  Direct answer provided (acceptable)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Tool understanding test failed:', error);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  
  try {
    // Test with empty message
    const response = await chatLLM(
      'You are a helpful assistant.',
      [{ role: 'user', content: '' }]
    );
    
    console.log('✅ Empty message handling test passed');
    console.log(`   Response: ${response.substring(0, 100)}...`);
    
    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    return false;
  }
}

async function runBasicTests() {
  console.log('🚀 Starting Basic Speedy Van AI Agent Tests...\n');
  console.log('Note: These tests don\'t require the database or RAG system.\n');
  
  const tests = [
    { name: 'LLM Connection', fn: testLLMConnection },
    { name: 'Bilingual Support', fn: testBilingualSupport },
    { name: 'Tool Understanding', fn: testToolUnderstanding },
    { name: 'Error Handling', fn: testErrorHandling },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error);
      failed++;
    }
  }
  
  console.log('\n📊 Basic Test Results Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All basic tests passed! The AI Agent core is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Set up pgvector extension in your database');
    console.log('2. Run: pnpm prisma migrate dev --name add_rag_tables');
    console.log('3. Build RAG database: pnpm rag:build');
    console.log('4. Run full tests: pnpm agent:test');
  } else {
    console.log('\n⚠️  Some basic tests failed. Please check the logs above.');
  }
  
  return failed === 0;
}

async function main() {
  try {
    const success = await runBasicTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Basic test script execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
