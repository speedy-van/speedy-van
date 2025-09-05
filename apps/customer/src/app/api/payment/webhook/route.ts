import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// App Router optimizations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Find booking by payment intent ID
        const booking = await prisma.booking.findFirst({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
        });

        if (!booking) {
          console.error(
            'No booking found for payment intent:',
            paymentIntent.id
          );
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          );
        }

        // Update booking status
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CONFIRMED',
            paidAt: new Date(),
            stripePaymentIntentId: paymentIntent.id,
          },
        });

        console.log(`Booking ${booking.reference} confirmed via webhook`);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;

        // Find and update failed booking
        const failedBooking = await prisma.booking.findFirst({
          where: {
            stripePaymentIntentId: failedPayment.id,
          },
        });

        if (failedBooking) {
          await prisma.booking.update({
            where: { id: failedBooking.id },
            data: {
              status: 'CANCELLED',
            },
          });
          console.log(
            `Booking ${failedBooking.reference} marked as cancelled due to payment failure`
          );
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
