import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { bookingData, successUrl, cancelUrl } = await request.json();

    if (!bookingData || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // This would integrate with Stripe API
    // For demo purposes, we'll return mock session data

    const sessionData = generateMockStripeSession(
      bookingData,
      successUrl,
      cancelUrl
    );

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

function generateMockStripeSession(
  bookingData: any,
  successUrl: string,
  cancelUrl: string
): any {
  // Generate a mock session ID
  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Server-side price validation and conversion to pence
  const totalGBP = Number(
    bookingData.calculatedTotal || bookingData.total || 0
  );
  if (totalGBP <= 0) {
    throw new Error('Invalid total amount: must be greater than 0');
  }

  // Convert GBP to pence (Stripe requires integer amounts in smallest currency unit)
  const amountInPence = Math.round(totalGBP * 100);

  // Create a mock checkout URL (in real implementation, this would be Stripe's hosted checkout)
  const sessionUrl = `${successUrl.replace('{CHECKOUT_SESSION_ID}', sessionId)}?demo=true`;

  return {
    sessionId: sessionId,
    sessionUrl: sessionUrl,
    amount: amountInPence, // Amount in pence
    amountGBP: totalGBP, // Original amount in GBP for reference
    currency: 'gbp',
    status: 'DRAFT',
    created: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
    metadata: {
      bookingReference: bookingData.bookingReference || 'SV-DEMO',
      customerName: bookingData.customer?.name || 'Demo Customer',
      moveDate: bookingData.date || '2024-01-01',
      pickupAddress: bookingData.pickupAddress?.line1 || 'Demo Pickup',
      dropoffAddress: bookingData.dropoffAddress?.line1 || 'Demo Dropoff',
      totalGBP: totalGBP.toString(),
      amountInPence: amountInPence.toString(),
    },
  };
}

// In a real implementation, you would use Stripe like this:
/*
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { bookingData, successUrl, cancelUrl } = await request.json();

    // Server-side price validation and conversion to pence
    const totalGBP = Number(bookingData.calculatedTotal || bookingData.total || 0);
    if (totalGBP <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount: must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Convert GBP to pence (Stripe requires integer amounts in smallest currency unit)
    const amountInPence = Math.round(totalGBP * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Move from ${bookingData.pickupAddress?.line1} to ${bookingData.dropoffAddress?.line1}`,
              description: `Moving service on ${bookingData.date} with ${bookingData.crewSize} movers`,
            },
            unit_amount: amountInPence, // Amount in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingReference: bookingData.bookingReference,
        customerName: bookingData.customer?.name,
        moveDate: bookingData.date,
        pickupAddress: bookingData.pickupAddress?.line1,
        dropoffAddress: bookingData.dropoffAddress?.line1,
        totalGBP: totalGBP.toString(),
        amountInPence: amountInPence.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
*/
