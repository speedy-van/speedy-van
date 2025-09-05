# ADR 0001: Unify Booking and Pricing Systems

## Status

Accepted

## Date

2024-12-19

## Context

The Speedy Van application had multiple booking flows and pricing systems that were causing:

- Code duplication and maintenance overhead
- Inconsistent user experiences
- Potential for pricing drift between different systems
- Confusion for developers about which system to use

## Decision

We will unify the booking and pricing systems to establish a single source of truth:

### Booking System

- **Primary Flow**: Use the advanced 9-step `/booking` flow as the single booking experience
- **Legacy Flow**: Redirect `/book` to `/booking` with deprecation notice
- **API**: Use `/api/bookings` and `/api/bookings/[id]` as the primary booking APIs

### Pricing System

- **Engine**: Use `apps/web/src/lib/pricing.ts` as the single pricing calculation engine
- **API**: Use `/api/pricing/quote` as the primary pricing API
- **Legacy API**: Convert `/api/quotes` to a proxy that forwards to `/api/pricing/quote`

### Payment System

- **Checkout**: Use `/api/payment/create-checkout-session` for Stripe integration
- **Webhooks**: Use `/api/payment/webhook` for payment status updates

## Consequences

### Positive

- Single source of truth for pricing calculations
- Consistent user experience across all booking flows
- Reduced maintenance overhead
- Clear developer guidelines on which systems to use
- Easier to implement new features and bug fixes

### Negative

- Breaking change for any external clients using `/api/quotes` (mitigated by proxy)
- Need to update any hardcoded references to old booking flows
- Temporary complexity during migration period

### Migration Strategy

1. **Phase 1**: Create new pricing API and proxy the old quotes API
2. **Phase 2**: Redirect old booking flow to new booking flow
3. **Phase 3**: Update all internal references to use new APIs
4. **Phase 4**: Remove deprecated APIs after 1 sprint (2 weeks)

### Rollback Plan

- Keep the proxy in place for `/api/quotes` during migration
- Maintain the old booking flow code in git history
- Can quickly revert redirects if issues arise

## Implementation Details

### ESLint Rules

Added custom ESLint rule to prevent creation of duplicate pricing modules:

```json
"no-duplicate-pricing-module": {
  "create": function(context) {
    const filename = context.getFilename();
    if (/pricing\.(ts|tsx)$/.test(filename) &&
        !/apps\/web\/src\/lib\/pricing\.ts$/.test(filename)) {
      context.report({
        node: null,
        message: 'Use "@/lib/pricing" only. Do not create duplicate pricing modules.'
      });
    }
    return {};
  }
}
```

### Path Aliases

All pricing imports should use the standardized path alias:

```typescript
import { calculatePrice } from '@/lib/pricing';
```

### Deprecation Headers

The proxy API includes deprecation warnings:

```typescript
response.headers.set(
  'X-Deprecation-Warning',
  'This endpoint is deprecated. Use /api/pricing/quote instead.'
);
```

## Related

- Issue: #XXX (Booking system unification)
- PR: #XXX (Implement unified booking flow)
- PR: #XXX (Add pricing API proxy)
