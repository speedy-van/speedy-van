# Speedy Van Pricing Module

A comprehensive, production-ready pricing engine for Speedy Van's UK moving services. This module implements dynamic pricing based on distance, items, workers, property types, weather, traffic, and other factors.

## Features

### Core Pricing Factors

- **Base rates**: £900 (self-pack) / £1,150 (with packing)
- **Distance**: £1.50/mile after 15 miles
- **Items**: £1.00/ft³ based on volume catalog
- **Workers**: £100 per extra worker (driver included in base)
- **Floors**: £15 with lift, £35 without lift per floor
- **Property type**: Surcharges for different property types

### Dynamic Factors

- **Traffic**: 1.00–1.35 ratio with 20% cap
- **Weather**: 0–20% surcharge based on conditions
- **Time/day**: Peak/off-peak multipliers
- **Availability**: 0–12% demand-based uplift
- **ULEZ**: £12.50 flat fee for ULEZ zone
- **VAT**: 20% optional for registered businesses

### Safety Features

- **Guardrails**: Hard caps on surcharges (20% per section, 35% combined)
- **Validation**: Zod schema validation for all inputs
- **Timeouts**: 12-second API timeout protection
- **Error handling**: Comprehensive error responses

## File Structure

```
src/lib/pricing/
├── catalog.ts              # Item volume definitions (ft³)
├── engine.ts               # Main pricing calculation logic
├── example.ts              # Usage examples and test scenarios
├── PricingCalculator.tsx   # React component for pricing form
├── SimplePricingTest.tsx   # Simple test component
└── README.md               # This documentation

src/app/api/pricing/
└── quote/
    └── route.ts            # Next.js API endpoint

src/app/test-pricing/
└── page.tsx                # Test page for pricing components
```

## Quick Start

### Testing the Pricing Engine

1. **Visit the test page**: Navigate to `/test-pricing` in your browser
2. **Use the simple test**: Click "اختبار التسعير" to see immediate results
3. **Use the full calculator**: Interact with the complete pricing form

### Basic Usage

```typescript
import { computeQuote } from '@/lib/pricing/engine';

const result = computeQuote({
  miles: 25,
  items: [
    { key: 'sofa', quantity: 1 },
    { key: 'dining_table', quantity: 1 },
    { key: 'medium-box', quantity: 10 },
  ],
  workersTotal: 2, // driver + 1 helper
  pickup: { floorsWithoutLift: 2, propertyType: 'Flat' },
  dropoff: { floorsWithLift: 1 },
  withPackingService: false,
  vatRegistered: true,
});

console.log(`Total: £${result.totalGBP}`);
console.log('Breakdown:', result.breakdown);
```

### API Usage

```typescript
const response = await fetch('/api/pricing/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    miles: 25,
    items: [
      { key: 'sofa', quantity: 1 },
      { key: 'dining_table', quantity: 1 },
    ],
    workersTotal: 2,
    pickup: { floorsWithoutLift: 2, propertyType: 'Flat' },
    dropoff: { floorsWithLift: 1 },
    vatRegistered: true,
  }),
});

const { totalGBP, breakdown } = await response.json();
```

## Item Catalog

The system includes a comprehensive catalog of common items with their volumes in cubic feet:

### Furniture

- `sofa`: 90 ft³ (3-seater)
- `bed`: 60 ft³ (double)
- `dining_table`: 40 ft³
- `coffee_table`: 20 ft³
- `chair`: 10 ft³

### Appliances

- `fridge_freezer`: 60 ft³
- `washing_machine`: 45 ft³
- `oven`: 40 ft³
- `dishwasher`: 35 ft³

### Boxes & Containers

- `box`: 3 ft³ (small)
- `medium-box`: 6 ft³
- `large-box`: 10 ft³

### Custom Items

For items not in the catalog, use `explicitVolumeFt3`:

```typescript
{ key: "custom_piano", quantity: 1, explicitVolumeFt3: 200 }
```

## Property Types

- **Bungalow**: No surcharge
- **Flat**: +£50
- **Terrace**: +£40
- **Semi**: +£30
- **Detached**: +£20

## Weather Classes

- `normal`: No surcharge
- `rain_medium`: +5%
- `rain_heavy`: +10%
- `wind_strong`: +10%
- `snow_ice`: +15%
- `storm_warning`: +20%

## Pricing Breakdown

The engine returns a detailed breakdown:

```typescript
interface PricingBreakdown {
  base: number; // Base rate (£900 or £1,150)
  distance: number; // Miles after 15
  items: number; // Volume-based pricing
  workers: number; // Extra workers
  stairs: number; // Floor charges
  property: number; // Property type surcharge
  extras: number; // Packing materials, dismantle, etc.

  trafficGBP: number; // Traffic surcharge
  weatherGBP: number; // Weather surcharge
  timeMultiplier: number; // Peak/off-peak factor
  availabilityRate: number; // Demand-based rate
  ulez: number; // ULEZ zone fee

  subtotalA: number; // Before traffic/weather/time
  subtotalB: number; // + traffic & weather, then * time
  subtotalC: number; // + availability
  subtotalD: number; // + ULEZ
  totalNoVat: number; // Rounded before VAT
  vatGBP: number; // VAT amount
  totalGBP: number; // Final total
}
```

## Examples

See `example.ts` for comprehensive examples including:

- Basic residential move
- Office relocation with traffic/weather
- Small apartment move
- Custom item handling
- ULEZ zone move

## Testing

### Run the examples:

```bash
# In your project directory
npx tsx src/lib/pricing/example.ts
```

### Test in browser:

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-pricing`
3. Use both test components to verify pricing calculations

## Troubleshooting

### If prices show as zero:

1. **Check the test page**: Visit `/test-pricing` to see if the issue is in your implementation
2. **Verify inputs**: Ensure all required fields are provided
3. **Check console**: Look for any JavaScript errors
4. **Test the engine directly**: Use the simple test component first

### Common issues:

- **Missing items**: Ensure items array is not empty
- **Invalid item keys**: Use keys that exist in the catalog
- **Zero quantities**: Ensure quantities are >= 1
- **Negative miles**: Miles should be >= 0

## Integration Notes

### Server-Side Enhancements

The API route is designed to be easily extended with:

- **Distance calculation**: Integrate with Mapbox/Google Maps
- **Traffic data**: Real-time traffic API integration
- **Weather data**: Met Office API integration
- **Availability tracking**: Real-time demand monitoring

### Client-Side Integration

- Use the API endpoint for real-time quotes
- Cache results for better UX
- Implement progressive disclosure of pricing factors
- Show detailed breakdown for transparency

## Configuration

Key constants in `engine.ts`:

- `BASE_SELF_PACK`: £900
- `BASE_WITH_PACKING`: £1,150
- `RATE_PER_MILE`: £1.50
- `RATE_PER_FT3`: £1.00
- `EXTRA_WORKER_FLAT_GBP`: £100
- `VAT_RATE`: 20%

## Error Handling

The API returns structured errors:

- `400`: Invalid request (with validation details)
- `500`: Internal error (with timeout protection)

## Performance

- **Client-side**: Sub-millisecond calculations
- **API**: <100ms response time
- **Memory**: Minimal footprint
- **Scalability**: Stateless, horizontally scalable

## Security

- Input validation with Zod schemas
- No SQL injection (no database queries)
- Rate limiting recommended at API gateway level
- Audit logging for pricing decisions

## Future Enhancements

- **Seasonal pricing**: Holiday/weekend multipliers
- **Loyalty discounts**: Customer tier pricing
- **Bulk discounts**: Volume-based reductions
- **Dynamic availability**: Real-time capacity pricing
- **A/B testing**: Pricing experiment framework
