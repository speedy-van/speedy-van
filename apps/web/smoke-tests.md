# 🚀 **Speedy Van Premium Booking - Smoke Tests**

## **Prerequisites**
- Database seeded: `pnpm -F @apps/web prisma db seed`
- Stripe CLI running: `stripe listen --forward-to localhost:3000/api/payment/webhook`
- Environment variables set (see `.env.example`)

---

## **🧪 Test 1: Get Sample Booking**

### **Request**
```bash
curl -X GET "http://localhost:3000/api/bookings/SAMPLE_BOOKING_ID" \
  -H "Content-Type: application/json"
```

### **Expected Response**
```json
{
  "id": "...",
  "reference": "SV-123456",
  "status": "DRAFT",
  "customer": {
    "name": "John Smith",
    "email": "john.smith@example.com"
  },
  "pricing": {
    "totalGBP": 2800
  }
}
```

---

## **🧪 Test 2: Calculate Route**

### **Request**
```bash
curl -X POST "http://localhost:3000/api/routing/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup": {
      "lat": 51.5074,
      "lng": -0.1278
    },
    "dropoff": {
      "lat": 51.5154,
      "lng": -0.1419
    }
  }'
```

### **Expected Response**
```json
{
  "distanceMiles": 2.5,
  "durationMinutes": 12,
  "route": [...]
}
```

---

## **🧪 Test 3: Check Weather Forecast**

### **Request**
```bash
curl -X GET "http://localhost:3000/api/weather/forecast?date=2024-09-15" \
  -H "Content-Type: application/json"
```

### **Expected Response**
```json
{
  "forecast": "Partly cloudy",
  "temperature": 18,
  "windSpeed": 12,
  "weatherWarning": false
}
```

---

## **🧪 Test 4: Check Availability**

### **Request**
```bash
curl -X GET "http://localhost:3000/api/availability/check?date=2024-09-15" \
  -H "Content-Type: application/json"
```

### **Expected Response**
```json
{
  "available": true,
  "timeSlots": ["09:00", "10:00", "11:00"],
  "crewAvailable": 3,
  "vansAvailable": 2
}
```

---

## **🧪 Test 5: Create Stripe Checkout Session**

### **Request**
```bash
curl -X POST "http://localhost:3000/api/payment/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "SAMPLE_BOOKING_ID",
    "amount": 2800,
    "currency": "gbp",
    "customerEmail": "john.smith@example.com"
  }'
```

### **Expected Response**
```json
{
  "sessionId": "cs_test_...",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "success": true
}
```

---

## **🧪 Test 6: Simulate Webhook (Payment Success)**

### **Request**
```bash
curl -X POST "http://localhost:3000/api/payment/webhook" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_success_123"
      }
    }
  }'
```

### **Expected Response**
```json
{
  "received": true
}
```

---

## **🧪 Test 7: Verify Booking Status Update**

### **Request**
```bash
curl -X GET "http://localhost:3000/api/bookings/SAMPLE_BOOKING_ID" \
  -H "Content-Type: application/json"
```

### **Expected Response**
```json
{
  "status": "CONFIRMED",
  "payment": {
    "status": "CONFIRMED",
    "paidAt": "2024-09-08T10:30:00.000Z"
  }
}
```

---

## **🧪 Test 8: Generate Invoice**

### **Request**
```bash
curl -X POST "http://localhost:3000/api/invoice/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "SAMPLE_BOOKING_ID"
  }'
```

### **Expected Response**
```json
{
  "invoiceUrl": "https://example.com/invoices/SV-123456.pdf",
  "success": true
}
```

---

## **🧪 Test 9: Send Confirmation Email**

### **Request**
```bash
curl -X POST "http://localhost:3000/api/email/send-confirmation" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "SAMPLE_BOOKING_ID"
  }'
```

### **Expected Response**
```json
{
  "messageId": "msg_123456",
  "success": true
}
```

---

## **🔍 Verification Checklist**

After running all tests, verify:

- ✅ **Database**: Sample bookings exist with proper relations
- ✅ **API Endpoints**: All return expected data structures
- ✅ **Webhook**: Payment confirmation updates booking status
- ✅ **Relations**: Addresses, properties, and items properly linked
- ✅ **Pricing**: Calculations match expected totals
- ✅ **Status Flow**: DRAFT → PENDING_PAYMENT → CONFIRMED

---

## **🐛 Troubleshooting**

### **Common Issues**
1. **Database Connection**: Check `DATABASE_URL` in environment
2. **Prisma Client**: Run `npx prisma generate` if models changed
3. **Stripe Webhook**: Ensure `STRIPE_WEBHOOK_SECRET` is set
4. **CORS**: Frontend should be able to call all endpoints

### **Debug Commands**
```bash
# Check database state
npx prisma studio

# View logs
pnpm dev

# Test database connection
npx prisma db push --preview-feature
```

---

## **🎯 Success Criteria**

All smoke tests pass = **Production Ready** ✅

The system can:
- Create and retrieve bookings
- Process payments via Stripe
- Handle webhooks for status updates
- Generate invoices and send emails
- Maintain data integrity across all relations

---

## **🔍 End-to-End Flow Verification**

### **Pre-Payment State Check**
```bash
# 1. Get booking before payment
curl -X GET "http://localhost:3000/api/bookings/SAMPLE_BOOKING_ID"

# Expected: status should be "DRAFT" or "PENDING_PAYMENT"
# paidAt should be null
```

### **Payment Flow Verification**
```bash
# 2. Create Stripe checkout session
curl -X POST "http://localhost:3000/api/payment/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "SAMPLE_BOOKING_ID",
    "amount": 2800,
    "currency": "gbp",
    "customerEmail": "john.smith@example.com"
  }'

# 3. Complete payment in Stripe dashboard or test mode
# 4. Verify webhook received (check server logs)
```

### **Post-Payment State Check**
```bash
# 5. Get booking after payment
curl -X GET "http://localhost:3000/api/bookings/SAMPLE_BOOKING_ID"

# Expected: status should be "CONFIRMED"
# paidAt should be non-null timestamp
# stripePaymentIntentId should be populated
```

### **Status Flow Verification**
- ✅ **DRAFT** → Initial booking state
- ✅ **PENDING_PAYMENT** → After checkout session created
- ✅ **CONFIRMED** → After webhook processes payment success
- ✅ **CANCELLED** → After webhook processes payment failure
