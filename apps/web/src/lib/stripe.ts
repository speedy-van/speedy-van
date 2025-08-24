/**
 * Stripe integration utilities for Speedy Van
 */

import Stripe from 'stripe';

// Initialize Stripe with error handling
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    // Validate keys in production environment
    if (process.env.NODE_ENV === 'production') {
      if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        console.error('❌ ERROR: Using Stripe test keys in production environment!');
        console.error('   Please update STRIPE_SECRET_KEY to use live keys (sk_live_...)');
        throw new Error('Stripe test keys cannot be used in production');
      }
      
      if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
        console.log('✅ Stripe configured with production keys');
      } else {
        console.error('❌ ERROR: Invalid Stripe secret key format in production');
        console.error('   Expected: sk_live_..., got:', process.env.STRIPE_SECRET_KEY.substring(0, 7));
        throw new Error('Invalid Stripe secret key format in production');
      }
    } else {
      // Development/Staging environment - allow both test and live keys
      if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        console.log('🔧 Stripe configured with test keys (development mode)');
      } else if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
        console.log('🔧 Stripe configured with live keys (development mode)');
      } else {
        console.error('❌ ERROR: Invalid Stripe secret key format');
        throw new Error('Invalid Stripe secret key format');
      }
    }
    
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  // In production, fail fast if Stripe is not properly configured
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

/**
 * Get Stripe instance (throws if not configured)
 */
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(amount: number, currency = 'gbp', metadata: Record<string, string> = {}) {
  const stripeInstance = getStripe();
  
  return await stripeInstance.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

/**
 * Create a checkout session for a booking
 */
export async function createCheckoutSession({
  amount,
  currency = 'gbp',
  customerEmail,
  bookingId,
  successUrl,
  cancelUrl,
}: {
  amount: number;
  currency?: string;
  customerEmail: string;
  bookingId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripeInstance = getStripe();
  
  return await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: 'Speedy Van Moving Service',
            description: `Booking ID: ${bookingId}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: customerEmail,
    metadata: {
      bookingId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.paymentIntents.cancel(paymentIntentId);
}

/**
 * Create a refund for a payment intent
 */
export async function createRefund(paymentIntentId: string, amount?: number, reason?: string) {
  const stripeInstance = getStripe();
  
  const refundData: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };
  
  if (amount) {
    refundData.amount = amount;
  }
  
  if (reason) {
    refundData.reason = reason as Stripe.RefundCreateParams.Reason;
  }
  
  return await stripeInstance.refunds.create(refundData);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripeInstance = getStripe();
  return stripeInstance.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Format amount for Stripe (convert to smallest currency unit)
 */
export function formatAmountForStripe(amount: number, currency = 'gbp'): number {
  // Most currencies use 2 decimal places (multiply by 100)
  // Some currencies like JPY don't use decimal places
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  
  return Math.round(amount * 100);
}

/**
 * Format amount from Stripe (convert from smallest currency unit)
 */
export function formatAmountFromStripe(amount: number, currency = 'gbp'): number {
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }
  
  return amount / 100;
}

/**
 * Get customer payment methods
 */
export async function getCustomerPaymentMethods(customerId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return stripe !== null;
}
