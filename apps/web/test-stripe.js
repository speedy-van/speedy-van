#!/usr/bin/env node

/**
 * Stripe Integration Test Script
 * Tests if Stripe is properly configured and the API endpoint works
 */

require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Stripe Integration for Speedy Van');
console.log('============================================\n');

// Check environment variables
console.log('🔍 Environment Variables Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 
  `${process.env.STRIPE_SECRET_KEY.substring(0, 7)}...` : '❌ NOT SET');
console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 
  `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 7)}...` : '❌ NOT SET');
console.log('   STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 
  `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 7)}...` : '❌ NOT SET');
console.log('   NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || '❌ NOT SET');
console.log('');

// Validate Stripe keys
if (process.env.STRIPE_SECRET_KEY) {
  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.log('✅ Stripe Secret Key: LIVE mode detected');
  } else if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.log('⚠️  Stripe Secret Key: TEST mode detected');
  } else {
    console.log('❌ Stripe Secret Key: Invalid format');
  }
}

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
    console.log('✅ Stripe Publishable Key: LIVE mode detected');
  } else if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
    console.log('⚠️  Stripe Publishable Key: TEST mode detected');
  } else {
    console.log('❌ Stripe Publishable Key: Invalid format');
  }
}

console.log('');

// Test Stripe API endpoint
console.log('🌐 Testing Stripe API Endpoint...');
console.log('   URL: http://localhost:3000/api/stripe/create-payment-intent');
console.log('');

const testPaymentData = {
  amount: 25.00,
  bookingData: {
    bookingId: 'test_booking_123',
    customerEmail: 'test@speedy-van.com',
    pickupAddress: { city: 'Glasgow' },
    dropoffAddress: { city: 'Edinburgh' },
    timestamp: new Date().toISOString()
  }
};

console.log('📤 Test Payment Data:');
console.log(JSON.stringify(testPaymentData, null, 2));
console.log('');

console.log('🚀 To test the API endpoint:');
console.log('   1. Make sure your dev server is running (pnpm dev)');
console.log('   2. Run this command in another terminal:');
console.log('');
console.log('   curl -X POST http://localhost:3000/api/stripe/create-payment-intent \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'' + JSON.stringify(testPaymentData) + '\'');
console.log('');

console.log('📋 Or test via the browser:');
console.log('   1. Go to step 8 of the booking process');
console.log('   2. Accept terms and conditions');
console.log('   3. Click the Stripe payment button');
console.log('   4. Check browser console and network tab for errors');
console.log('');

console.log('🔍 Check these files for errors:');
console.log('   - Browser console (F12)');
console.log('   - Terminal running your dev server');
console.log('   - Network tab in browser dev tools');
console.log('');

console.log('✅ Test script completed!');
