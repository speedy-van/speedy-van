# Speedy Van Stripe Integration Guide

## Overview

This guide explains how the Stripe payment integration works in the booking system. When users click "Pay via Stripe", they are redirected to Stripe Checkout before confirming their order.

## Payment Flow

### 1. User Clicks "Pay via Stripe"

- User is on Step 7 (Payment) of the booking flow
- They must accept terms and conditions first
- The button shows the actual calculated price

### 2. API Call to Create Payment Intent

- `StripePaymentButton` calls `/api/stripe/create-payment-intent`
- Sends amount and booking data
- API creates a Stripe payment intent (or mock for demo)

### 3. Redirect to Stripe Checkout

- User is redirected to Stripe Checkout page
- In production: Actual Stripe Checkout
- In demo: Mock Stripe page (`/mock-stripe-checkout`)

### 4. Payment Processing

- User enters card details on Stripe page
- Payment is processed securely
- Stripe handles all payment validation

### 5. Success/Cancel Redirect

- **Success**: Redirected to `/booking/success`
- **Cancel**: Redirected to `/booking/cancel`
- **Error**: Error handling on Stripe page

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── stripe/
│   │       └── create-payment-intent/
│   │           └── route.ts              # API endpoint
│   ├── mock-stripe-checkout/
│   │   └── page.tsx                      # Mock Stripe page
│   └── booking/
│       ├── success/
│       │   └── page.tsx                  # Success page
│       └── cancel/
│           └── page.tsx                  # Cancel page
├── components/
│   └── booking/
│       ├── StripePaymentButton.tsx       # Payment button
│       └── PaymentStep.tsx               # Payment step
```

## Key Components

### 1. StripePaymentButton

- **Location**: `src/components/booking/StripePaymentButton.tsx`
- **Purpose**: Handles payment initiation and redirect
- **Features**:
  - Calls API to create payment intent
  - Redirects to Stripe Checkout
  - Handles payment errors
  - Shows loading states

### 2. Payment Intent API

- **Location**: `src/app/api/stripe/create-payment-intent/route.ts`
- **Purpose**: Creates payment intent and checkout session
- **Features**:
  - Validates payment amount
  - Creates Stripe payment intent
  - Returns checkout URL
  - Handles errors gracefully

### 3. Mock Stripe Checkout

- **Location**: `src/app/mock-stripe-checkout/page.tsx`
- **Purpose**: Simulates Stripe Checkout for demo
- **Features**:
  - Card input form
  - Payment simulation
  - Success/error handling
  - Redirect to success page

### 4. Success Page

- **Location**: `src/app/booking/success/page.tsx`
- **Purpose**: Shows payment confirmation
- **Features**:
  - Payment details
  - Next steps
  - Download invoice
  - Return to home

### 5. Cancel Page

- **Location**: `src/app/booking/cancel/page.tsx`
- **Purpose**: Handles cancelled payments
- **Features**:
  - Explanation of what happened
  - Retry payment option
  - Return to booking
  - Contact support

## API Endpoints

### POST `/api/stripe/create-payment-intent`

**Request Body:**

```json
{
  "amount": 150.0,
  "bookingData": {
    "amount": 150.0,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response:**

```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_1234567890",
    "client_secret": "pi_1234567890_secret_abc123",
    "amount": 15000,
    "currency": "gbp",
    "status": "requires_payment_method"
  },
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

## Environment Variables

For production, you'll need these environment variables:

```bash
# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Production Implementation

### 1. Install Stripe SDK

```bash
npm install stripe
```

### 2. Update API Route

Replace the mock implementation in `create-payment-intent/route.ts`:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create actual payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: 'gbp',
  metadata: {
    bookingId: bookingData.bookingId || 'pending',
    customerEmail: bookingData.customerEmail || '',
  },
});

// Create checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'Speedy Van Move',
          description: `Move from ${pickupCity} to ${dropoffCity}`,
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancel`,
  metadata: {
    bookingId: bookingData.bookingId || 'pending',
    customerEmail: bookingData.customerEmail || '',
  },
});

return NextResponse.json({
  success: true,
  paymentIntent,
  checkoutUrl: session.url,
});
```

### 3. Handle Webhooks

Create webhook endpoint to handle Stripe events:

```typescript
// src/app/api/stripe/webhooks/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Update booking status
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}
```

## Testing

### 1. Test Payment Flow

```bash
# Start the development server
npm run dev

# Navigate to booking flow
http://localhost:3000/booking

# Complete steps 1-6, then test payment on step 7
```

### 2. Test API Endpoint

```bash
# Test payment intent creation
curl -X POST http://localhost:3000/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 150.00, "bookingData": {"amount": 150.00}}'
```

### 3. Test Mock Stripe

```bash
# Navigate to mock Stripe page
http://localhost:3000/mock-stripe-checkout?amount=150&bookingId=SV12345678
```

## Security Considerations

### 1. API Key Protection

- Never expose secret keys in client-side code
- Use environment variables
- Implement proper authentication

### 2. Payment Validation

- Validate amounts server-side
- Check booking data integrity
- Implement rate limiting

### 3. Webhook Security

- Verify webhook signatures
- Use HTTPS in production
- Implement idempotency

## Error Handling

### 1. Payment Failures

- Network errors
- Invalid card details
- Insufficient funds
- Stripe API errors

### 2. User Experience

- Clear error messages
- Retry options
- Support contact information
- Graceful fallbacks

## Future Enhancements

### 1. Additional Payment Methods

- Apple Pay
- Google Pay
- Bank transfers
- Buy now, pay later

### 2. Advanced Features

- Recurring payments
- Payment plans
- Refund handling
- Dispute management

### 3. Analytics

- Payment success rates
- User behavior tracking
- Conversion optimization
- A/B testing

## Support

For integration issues:

1. Check the test pages first
2. Review browser console for errors
3. Verify API responses
4. Test with minimal data
5. Check Stripe dashboard for errors

The integration is designed to be robust and handle edge cases gracefully while providing clear feedback to users.
