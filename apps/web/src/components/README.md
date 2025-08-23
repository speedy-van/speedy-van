# Components Structure

This directory contains all React components organized by feature and functionality.

## Directory Structure

```
components/
├── Booking/           # Booking-related components
│   ├── Wizard.tsx     # Main booking wizard
│   ├── BookingSummary.tsx # Booking summary display
│   └── index.ts       # Exports
├── Checkout/          # Payment and checkout components
│   ├── CheckoutButton.tsx # Stripe checkout button
│   ├── PriceDisplay.tsx   # Price display component
│   └── index.ts       # Exports
├── Stripe/            # Stripe integration components
│   ├── StripeProvider.tsx # Stripe context provider
│   └── index.ts       # Exports
├── admin/             # Admin dashboard components
├── auth/              # Authentication components
├── Calendar/          # Calendar and scheduling components
├── Chat/              # Chat and messaging components
├── Consent/           # Consent and legal components
├── Driver/            # Driver-specific components
├── Forms/             # Form components
├── Items/             # Item management components
├── Map/               # Map and location components
├── site/              # Site-wide components (Header, Footer, etc.)
├── Weather/           # Weather-related components
└── __tests__/         # Component tests
```

## Key Components

### Booking Components
- **Wizard.tsx**: Main booking form with address selection, date/time picker, and service options
- **BookingSummary.tsx**: Displays booking details in a clean, organized format

### Checkout Components
- **CheckoutButton.tsx**: Handles Stripe checkout session creation with loading states and error handling
- **PriceDisplay.tsx**: Shows pricing information with optional breakdown

### Stripe Components
- **StripeProvider.tsx**: Context provider for Stripe integration with error handling

## Usage Examples

### Using CheckoutButton
```tsx
import { CheckoutButton } from '@/components/Checkout';

<CheckoutButton 
  bookingId="booking_123"
  amount={26800} // in pence
  disabled={false}
/>
```

### Using BookingSummary
```tsx
import { BookingSummary } from '@/components/Booking';

<BookingSummary 
  booking={bookingData}
  className="custom-styles"
/>
```

### Using StripeProvider
```tsx
import { StripeProvider, useStripe } from '@/components/Stripe';

function App() {
  return (
    <StripeProvider>
      <YourApp />
    </StripeProvider>
  );
}

function PaymentComponent() {
  const { createCheckoutSession, error } = useStripe();
  
  const handlePayment = async () => {
    const url = await createCheckoutSession('booking_123');
    if (url) window.location.href = url;
  };
}
```

## Best Practices

1. **Component Organization**: Group related components in feature-specific directories
2. **TypeScript**: All components use TypeScript with proper interfaces
3. **Error Handling**: Components include proper error states and loading indicators
4. **Accessibility**: Components follow accessibility best practices
5. **Responsive Design**: Components are mobile-friendly and responsive
6. **Performance**: Components are optimized for performance with proper memoization

## Integration with Stripe

The Stripe integration is handled through:
- **API Routes**: `/api/checkout/session` for creating checkout sessions
- **Webhooks**: `/api/webhooks/stripe` for processing payment events
- **Components**: CheckoutButton and StripeProvider for UI integration

## File Naming Conventions

- Use PascalCase for component files: `CheckoutButton.tsx`
- Use camelCase for utility files: `stripeUtils.ts`
- Use kebab-case for CSS modules: `checkout-button.module.css`
- Include index.ts files for clean imports

## Testing

Components include tests in the `__tests__` directory following Jest and React Testing Library patterns.
