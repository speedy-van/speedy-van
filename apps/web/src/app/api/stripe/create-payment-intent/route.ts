import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe keys - support both test and production
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Stripe API called - Environment:', NODE_ENV);
    console.log('🔧 Stripe Secret Key configured:', !!STRIPE_SECRET_KEY);
    console.log('🔧 Stripe Publishable Key configured:', !!STRIPE_PUBLISHABLE_KEY);
    
    // Log the actual key prefixes for debugging
    if (STRIPE_SECRET_KEY) {
      console.log('🔧 Stripe Secret Key prefix:', STRIPE_SECRET_KEY.substring(0, 7));
    }
    if (STRIPE_PUBLISHABLE_KEY) {
      console.log('🔧 Stripe Publishable Key prefix:', STRIPE_PUBLISHABLE_KEY.substring(0, 7));
    }

    // Validate that Stripe keys are configured
    if (!STRIPE_SECRET_KEY) {
      console.error('❌ Stripe secret key not configured');
      console.error('❌ Please add STRIPE_SECRET_KEY to your environment variables');
      return NextResponse.json(
        { 
          error: 'Payment service not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing'
        },
        { status: 500 }
      );
    }

    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('❌ Stripe publishable key not configured');
      console.error('❌ Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables');
      return NextResponse.json(
        { 
          error: 'Payment service not configured',
          details: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is missing'
        },
        { status: 500 }
      );
    }

    // Validate key format based on environment
    const isProduction = NODE_ENV === 'production';
    const expectedSecretPrefix = isProduction ? 'sk_live_' : 'sk_test_';
    const expectedPublishablePrefix = isProduction ? 'pk_live_' : 'pk_test_';

    console.log('🔧 Expected secret prefix:', expectedSecretPrefix);
    console.log('🔧 Expected publishable prefix:', expectedPublishablePrefix);

    // In production, only allow live keys
    const validSecretPrefixes = isProduction ? ['sk_live_'] : ['sk_test_', 'sk_live_'];
    const validPublishablePrefixes = isProduction ? ['pk_live_'] : ['pk_test_', 'pk_live_'];

    const hasValidSecretKey = validSecretPrefixes.some(prefix => STRIPE_SECRET_KEY.startsWith(prefix));
    const hasValidPublishableKey = validPublishablePrefixes.some(prefix => STRIPE_PUBLISHABLE_KEY.startsWith(prefix));

    if (!hasValidSecretKey) {
      console.error(`❌ Invalid Stripe secret key format for ${NODE_ENV} environment. Expected one of: ${validSecretPrefixes.join(', ')}`);
      return NextResponse.json(
        { 
          error: 'Payment service configuration error',
          details: `Invalid secret key format. Expected one of: ${validSecretPrefixes.join(', ')} for ${NODE_ENV} environment`
        },
        { status: 500 }
      );
    }

    if (!hasValidPublishableKey) {
      console.error(`❌ Invalid Stripe publishable key format for ${NODE_ENV} environment. Expected one of: ${validPublishablePrefixes.join(', ')}`);
      return NextResponse.json(
        { 
          error: 'Payment service configuration error',
          details: `Invalid publishable key format. Expected one of: ${validPublishablePrefixes.join(', ')} for ${NODE_ENV} environment`
        },
        { status: 500 }
      );
    }

    const { amount, bookingData } = await request.json();

    console.log('💰 Payment request received:', { amount, bookingId: bookingData?.bookingId });

    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount received:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout session
    const checkoutUrl = await createStripeCheckoutSession(amount, bookingData);

    console.log('✅ Stripe checkout session created successfully');

    return NextResponse.json({
      success: true,
      checkoutUrl
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

async function createStripeCheckoutSession(amount: number, bookingData: any) {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Speedy Van Moving Service',
            description: `Move from ${bookingData.pickupAddress?.city || 'Unknown'} to ${bookingData.dropoffAddress?.city || 'Unknown'}`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://speedy-van.co.uk'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://speedy-van.co.uk'}/booking/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        bookingId: bookingData.bookingId || 'pending',
        customerEmail: bookingData.customer?.email || '',
        sessionId: '{CHECKOUT_SESSION_ID}',
      },
    });
    
    return session.url;

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}
