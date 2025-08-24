#!/usr/bin/env node

/**
 * Test Stripe API Endpoint
 * Makes a direct call to test if the API is working
 */

const https = require('https');
const http = require('http');

console.log('🌐 Testing Stripe API Endpoint Directly');
console.log('=======================================\n');

const testData = {
  amount: 25.00,
  bookingData: {
    bookingId: 'test_booking_123',
    customerEmail: 'test@speedy-van.com',
    pickupAddress: { city: 'Glasgow' },
    dropoffAddress: { city: 'Edinburgh' },
    timestamp: new Date().toISOString()
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/stripe/create-payment-intent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 Sending test request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('📋 Test data:', JSON.stringify(testData, null, 2));
console.log('');

const req = http.request(options, (res) => {
  console.log('📡 Response Status:', res.statusCode);
  console.log('📡 Response Headers:', res.headers);
  console.log('');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const responseData = JSON.parse(data);
      console.log('✅ Response Data:');
      console.log(JSON.stringify(responseData, null, 2));
      
      if (responseData.success && responseData.checkoutUrl) {
        console.log('\n🎉 SUCCESS! Stripe checkout URL received:');
        console.log(responseData.checkoutUrl);
      } else {
        console.log('\n❌ Response indicates failure');
      }
    } catch (e) {
      console.log('❌ Failed to parse response as JSON:');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Request failed:', e.message);
  console.log('\n💡 Make sure your development server is running:');
  console.log('   pnpm dev');
});

req.write(postData);
req.end();

console.log('⏳ Waiting for response...\n');
