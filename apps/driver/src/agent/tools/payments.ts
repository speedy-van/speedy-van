import { z } from 'zod';
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const Input = z.object({ paymentIntentId: z.string() });

export async function toolPaymentStatus(input: unknown) {
  const { paymentIntentId } = Input.parse(input);
  // const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  const pi = { id: paymentIntentId, status: 'succeeded' }; // placeholder
  return { ok: true, data: pi };
}

