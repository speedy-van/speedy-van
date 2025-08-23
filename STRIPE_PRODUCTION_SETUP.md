# Stripe Production Setup Guide

## Overview
This guide explains how to configure Stripe from development/test mode to production mode for the Speedy Van application.

## ⚠️ Important Security Notes

**NEVER commit production Stripe keys to version control!**
- Production keys start with `sk_live_` and `pk_live_`
- Test keys start with `sk_test_` and `pk_test_`
- Keep production keys secure and separate from code

## 🔄 Changes Made

### 1. Environment Configuration
- Updated `env.example` to use production Stripe key patterns
- Created `env.production` with production-specific settings
- Changed `NODE_ENV` from `development` to `production`

### 2. Stripe API Route Updates
- Removed test key fallbacks in `create-payment-intent/route.ts`
- Added validation to ensure production keys are configured
- Added error handling for missing production keys

### 3. Stripe Configuration Updates
- Enhanced `stripe.ts` with production key validation
- Added warnings for test keys in production
- Added success logging for production keys

## 🚀 Production Deployment Steps

### Step 1: Update Environment Variables
```bash
# In your production environment (Render, Vercel, etc.)
STRIPE_SECRET_KEY=sk_live_your_actual_production_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

### Step 2: Verify Key Format
- **Secret Key**: Must start with `sk_live_`
- **Publishable Key**: Must start with `pk_live_`
- **Webhook Secret**: Must start with `whsec_`

### Step 3: Update Webhook Endpoints
In your Stripe Dashboard:
1. Go to Developers → Webhooks
2. Update webhook endpoint URL to your production domain
3. Ensure webhook events include:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `checkout.session.completed`

### Step 4: Test Production Integration
1. Create a test transaction with a small amount
2. Verify webhook delivery
3. Check payment processing
4. Monitor Stripe dashboard

## 🔧 Configuration Files

### Environment Files
- `env.example` - Template with production key patterns
- `env.production` - Production-specific configuration
- `.env.local` - Your local development settings (keep test keys)

### Code Files Updated
- `apps/web/src/app/api/stripe/create-payment-intent/route.ts`
- `apps/web/src/lib/stripe.ts`

## 🧪 Testing vs Production

| Feature | Test Mode | Production Mode |
|---------|-----------|-----------------|
| Keys | `sk_test_`, `pk_test_` | `sk_live_`, `pk_live_` |
| Transactions | No real charges | Real money transactions |
| Webhooks | Test endpoint | Production endpoint |
| Dashboard | Test mode | Live mode |

## 🚨 Common Issues & Solutions

### Issue: "Production Stripe secret key not configured"
**Solution**: Ensure `STRIPE_SECRET_KEY` is set in your production environment

### Issue: "Using Stripe test keys in production"
**Solution**: Update environment variables to use live keys

### Issue: Webhooks not working
**Solution**: 
1. Verify webhook endpoint URL is correct
2. Check webhook secret matches
3. Ensure endpoint is publicly accessible

## 📊 Monitoring & Alerts

### Stripe Dashboard
- Monitor transaction volume
- Check for failed payments
- Review refund requests
- Monitor webhook delivery

### Application Logs
- Payment success/failure logs
- Webhook processing logs
- Error logs for debugging

## 🔒 Security Best Practices

1. **Key Rotation**: Regularly rotate production keys
2. **Access Control**: Limit access to production keys
3. **Monitoring**: Set up alerts for suspicious activity
4. **Webhook Security**: Validate all webhook signatures
5. **Error Handling**: Don't expose sensitive data in errors

## 📞 Support

- **Stripe Support**: https://support.stripe.com/
- **Stripe Documentation**: https://stripe.com/docs
- **Webhook Testing**: Use Stripe CLI for local testing

## ✅ Checklist

- [ ] Environment variables updated with production keys
- [ ] Webhook endpoints configured for production domain
- [ ] Test transaction completed successfully
- [ ] Webhook delivery verified
- [ ] Error handling tested
- [ ] Monitoring and alerts configured
- [ ] Security measures implemented
- [ ] Team members notified of production mode

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!
