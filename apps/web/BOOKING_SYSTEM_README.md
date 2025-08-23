# Booking System Architecture

## 🎯 Single Source of Truth

This booking system follows a unified architecture to prevent duplication and ensure consistency.

### Core Components

#### 📋 Booking Flow
- **Primary**: `/booking` - Advanced 9-step booking experience
- **Legacy**: `/book` → redirects to `/booking` (deprecated)

#### 💰 Pricing Engine
- **Engine**: `@/lib/pricing.ts` - Single pricing calculation engine
- **API**: `/api/pricing/quote` - Primary pricing API endpoint
- **Legacy**: `/api/quotes` → proxy to `/api/pricing/quote` (deprecated)

#### 📦 Booking Management
- **Create**: `POST /api/bookings`
- **Retrieve**: `GET /api/bookings/[id]`
- **Update**: `PUT /api/bookings/[id]`

#### 💳 Payment Processing
- **Checkout**: `POST /api/payment/create-checkout-session`
- **Webhooks**: `POST /api/payment/webhook`

## 🚀 Quick Start

### Get a Quote
```typescript
import { calculatePrice } from '@/lib/pricing';

const quote = calculatePrice({
  distanceMiles: 10,
  pickupFloors: 2,
  dropoffFloors: 0,
  crewSize: 'TWO',
  isWeekend: false,
  // ... other options
});
```

### API Quote Request
```bash
curl -X POST /api/pricing/quote \
  -H 'Content-Type: application/json' \
  -d '{
    "pickupAddress": {"lat": 51.5074, "lng": -0.1278},
    "dropoffAddress": {"lat": 51.5014, "lng": -0.1419},
    "crewSize": "TWO",
    "scheduledAt": "2024-12-20T10:00:00Z"
  }'
```

### Create Booking
```bash
curl -X POST /api/bookings \
  -H 'Content-Type: application/json' \
  -d '{
    "pickupAddress": {...},
    "dropoffAddress": {...},
    "crewSize": "TWO",
    "customerName": "John Doe",
    "customerPhone": "07000000000",
    "customerEmail": "john@example.com"
  }'
```

## 🛡️ Guardrails

### ESLint Rule
Prevents creation of duplicate pricing modules:
```json
"no-duplicate-pricing-module": "error"
```

### CI Check
GitHub Actions workflow prevents duplicate pricing files from being merged.

## 📚 Documentation

- **ADR**: `docs/adr/0001-unify-booking-and-pricing.md`
- **API Contracts**: `API_CONTRACTS.md`
- **Pricing Engine**: `src/lib/pricing.ts`

## 🔄 Migration Status

- ✅ `/book` → `/booking` redirect implemented
- ✅ `/api/quotes` → `/api/pricing/quote` proxy implemented
- ✅ All imports use `@/lib/pricing`
- ✅ ESLint rules in place
- ✅ CI guards active

## 🚫 What NOT to Do

- ❌ Don't create new pricing files outside `@/lib/pricing.ts`
- ❌ Don't use `/api/quotes` for new integrations
- ❌ Don't create alternative booking flows
- ❌ Don't bypass the pricing engine for calculations

## ✅ What TO Do

- ✅ Use `@/lib/pricing` for all pricing calculations
- ✅ Use `/api/pricing/quote` for quote requests
- ✅ Use `/booking` for the booking flow
- ✅ Follow the ADR for architectural decisions
- ✅ Add tests for new pricing scenarios

## 🧪 Testing

### Smoke Tests
```bash
# Test pricing API
curl -X POST http://localhost:3000/api/pricing/quote \
  -H 'Content-Type: application/json' \
  -d '{...}'

# Test booking creation
curl -X POST http://localhost:3000/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{...}'

# Test payment session
curl -X POST http://localhost:3000/api/payment/create-checkout-session \
  -H 'Content-Type: application/json' \
  -d '{"bookingId": "..."}'
```

### Stripe Webhook Testing
```bash
stripe listen --forward-to http://localhost:3000/api/payment/webhook \
  --events checkout.session.completed,payment_intent.succeeded
```

## 🔧 Environment Variables

Required for full functionality:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📞 Support

For questions about the booking system architecture:
1. Check the ADR first
2. Review this README
3. Check existing implementations in the codebase
4. Create an issue for architectural questions
