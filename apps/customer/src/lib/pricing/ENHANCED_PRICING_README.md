# Enhanced Pricing System - Speedy Van

## Overview

This enhanced pricing system implements volume factor-based pricing with intelligent item normalization and autocomplete. The system maintains backward compatibility while adding sophisticated pricing logic.

## Key Features

### 1. Volume Factor Pricing

- **Base Formula**: `basePrice(distance) × totalVolumeFactor + floorsCost + helpersCost + extras(ULEZ/VAT)`
- **Minimum Price**: £55 (unified across all scenarios)
- **Distance Pricing** (unchanged):
  - 0–10 mi → £40
  - 10–50 mi → £60
  - > 50 mi → £60 + £1.20/mi beyond 50

### 2. Item Normalization

- Converts free text input to standardized catalog items
- Handles synonyms and size qualifiers
- Provides disambiguation options for unclear inputs
- Maps "small/medium/large" to specific item variants

### 3. Smart Autocomplete

- Real-time suggestions based on user input
- Context-aware ranking (exact matches, synonyms, categories)
- Caches recent searches for improved relevance
- Configurable suggestion limits

### 4. Enhanced Cost Calculation

- **Floors/Lift**: £10/floor without lift, 60% discount with lift
- **Helpers**: £20 per additional worker (auto-suggested for heavy items)
- **ULEZ**: £12.50 when applicable
- **VAT**: 20% when registered

## Feature Flags

The system uses feature flags for gradual rollout:

```bash
# Enable all pricing features
NEXT_PUBLIC_FEATURE_PRICING_NORMALIZATION=true
NEXT_PUBLIC_FEATURE_PRICING_AUTOCOMPLETE=true
NEXT_PUBLIC_FEATURE_PRICING_VOLUME_FACTOR=true

# Control rollout percentages (0-100)
NEXT_PUBLIC_FEATURE_PRICING_NORMALIZATION_ROLLOUT=25
NEXT_PUBLIC_FEATURE_PRICING_AUTOCOMPLETE_ROLLOUT=50
NEXT_PUBLIC_FEATURE_PRICING_VOLUME_FACTOR_ROLLOUT=75
```

## API Usage

### Basic Quote Request

```typescript
POST /api/pricing/quote
{
  "miles": 12,
  "items": [
    {
      "id": "sofa-2seat",
      "name": "Sofa – 2-seat",
      "quantity": 1,
      "volumeFactor": 1.2,
      "requiresTwoPerson": false,
      "isFragile": false,
      "requiresDisassembly": false,
      "basePriceHint": 32
    }
  ],
  "workersTotal": 1,
  "pickup": { "floors": 0, "hasLift": false },
  "dropoff": { "floors": 0, "hasLift": false },
  "extras": { "ulezApplicable": false },
  "vatRegistered": false
}
```

### Raw Text Input (with normalization)

```typescript
POST /api/pricing/quote
{
  "miles": 12,
  "rawItems": [
    { "text": "small sofa", "quantity": 1 },
    { "text": "6 large boxes", "quantity": 6 }
  ],
  "workersTotal": 1,
  "pickup": { "floors": 0, "hasLift": false },
  "dropoff": { "floors": 0, "hasLift": false }
}
```

### Response Format

```typescript
{
  "totalGBP": 216,
  "breakdown": {
    "baseRate": 60,
    "distanceCost": 0,
    "volumeMultiplier": 3.6,
    "volumeAdjustedBase": 216,
    "workersCost": 0,
    "stairsCost": 0,
    "extrasCost": 0,
    "subtotal": 216,
    "vat": 0,
    "total": 216,
    "priceAdjustment": 0
  },
  "normalizedItems": [...],
  "rawInput": [...] // if rawItems were provided
}
```

## UAT Test Scenarios

### Scenario 1: Small Sofa + 6 Large Boxes

- **Input**: "small sofa + 6 large boxes", 12mi, Ground↔Ground
- **Expected**: base=£60, VF=3.6 (1.2 + 6×0.4), total=£216

### Scenario 2: Corner Sofa + American Fridge

- **Input**: "corner sofa + american fridge", 7mi, Pickup 2nd no lift
- **Expected**: base=£40, VF=5.0, floors=+£10, total=£230

### Scenario 3: Studio Package

- **Input**: Predefined package with virtual items
- **Expected**: Loads default items, calculates VF from package

## Implementation Files

- `engine.ts` - Core pricing logic with feature flag support
- `normalizer.ts` - Text-to-item conversion with disambiguation
- `autocomplete.ts` - Smart suggestion system
- `catalog-dataset.ts` - Item catalog management
- `uat-test-scenarios.ts` - Comprehensive test scenarios
- `settings.ts` - Pricing configuration and adjustments

## Rollout Strategy

### Phase 1: Shadow Mode

- Enable autocomplete and normalization (no price impact)
- Monitor user behavior and system performance
- Collect feedback on suggestion quality

### Phase 2: Gradual Pricing

- Enable volume factor pricing for small user percentage
- Monitor price deviation and customer feedback
- Adjust volume factors based on real usage data

### Phase 3: Full Rollout

- Enable all features for all users
- Monitor system performance and pricing accuracy
- Fine-tune parameters based on production data

### Rollback Plan

- Disable feature flags to revert to distance-only pricing
- Maintain backward compatibility throughout rollout
- Quick fallback to previous pricing logic if issues arise

## Error Handling

- **Unknown Items**: Provide 3 closest suggestions
- **Distance Failures**: Clear error message with retry option
- **Invalid Quantities**: Prevent negative/zero quantities
- **Price Below Minimum**: Auto-apply £55 minimum

## Performance Considerations

- Catalog data cached in memory for fast lookups
- Autocomplete results limited to prevent UI lag
- Timeout protection (12s) for external API calls
- Efficient volume factor calculations with minimal overhead

## Security

- Input validation with Zod schemas
- Feature flag-based access control
- Rate limiting on pricing API endpoints
- Secure handling of pricing adjustments
