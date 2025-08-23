# Speedy Van Pricing Integration Guide

## Overview

This guide explains how the pricing module has been integrated with the 9-step booking flow to provide real-time pricing throughout the customer journey.

## Integration Points

### 1. PricingDisplay Component

The main integration component that converts booking data to pricing inputs and displays real-time quotes.

**Location:** `src/components/booking/PricingDisplay.tsx`

**Features:**
- Converts booking data to pricing engine inputs
- Calculates distance between addresses
- Shows real-time pricing updates
- Displays detailed breakdown
- Handles loading and error states

### 2. Enhanced Booking Summary

A comprehensive booking summary that includes pricing information.

**Location:** `src/components/booking/EnhancedBookingSummary.tsx`

**Features:**
- Shows all booking details in one place
- Includes integrated pricing display
- Professional layout with icons and badges
- Responsive design

### 3. Distance Calculator

Service for calculating distances between addresses.

**Location:** `src/lib/pricing/distance-calculator.ts`

**Features:**
- Haversine formula for coordinate-based distance
- Fallback to postcode-based estimation
- Minimum distance enforcement
- Distance formatting utilities

## Booking Flow Integration

### Step 3: Item Selection
- **Component:** `ItemSelectionStep.tsx`
- **Integration:** Compact pricing display
- **Purpose:** Show price as items are added/removed

### Step 6: Crew Selection
- **Component:** `CrewSelectionStep.tsx`
- **Integration:** Full pricing display with breakdown
- **Purpose:** Show price impact of crew size changes

### Step 7: Payment
- **Component:** `PaymentStep.tsx`
- **Integration:** Full pricing display with breakdown
- **Purpose:** Final price confirmation before payment

### Step 8: Confirmation
- **Component:** `ConfirmationStep.tsx`
- **Integration:** Enhanced booking summary with pricing
- **Purpose:** Complete booking summary with final price

## Data Flow

### Booking Data → Pricing Inputs

```typescript
// Example conversion
const bookingData = {
  pickupAddress: { line1: "123 Main St", city: "London", coordinates: { lat: 51.5074, lng: -0.1278 } },
  dropoffAddress: { line1: "456 Oak Ave", city: "Manchester", coordinates: { lat: 53.4808, lng: -2.2426 } },
  items: [
    { name: "sofa", quantity: 1, volume: 2.5 },
    { name: "dining_table", quantity: 1, volume: 1.5 }
  ],
  crewSize: 2,
  pickupProperty: { propertyType: "Flat", floor: 2, hasLift: false },
  dropoffProperty: { propertyType: "House", floor: 1, hasLift: true }
};

// Converts to:
const pricingInputs = {
  miles: 163.2, // Calculated distance
  items: [
    { key: "sofa", quantity: 1, explicitVolumeFt3: 2.5 },
    { key: "dining_table", quantity: 1, explicitVolumeFt3: 1.5 }
  ],
  workersTotal: 2,
  pickup: { floorsWithoutLift: 2, propertyType: "Flat" },
  dropoff: { floorsWithLift: 1, propertyType: "House" },
  vatRegistered: false,
  withPackingService: false
};
```

## Key Features

### Real-Time Updates
- Pricing updates automatically when booking data changes
- No manual refresh required
- Smooth user experience

### Distance Calculation
- Automatic distance calculation from coordinates
- Fallback to postcode estimation
- Minimum distance enforcement (1 mile)

### Error Handling
- Graceful handling of missing data
- Clear error messages
- Loading states for better UX

### Responsive Design
- Works on all screen sizes
- Compact mode for mobile
- Full breakdown on desktop

## Usage Examples

### Basic Integration
```typescript
import PricingDisplay from '@/components/booking/PricingDisplay';

function MyComponent() {
  const [bookingData, setBookingData] = useState({});
  
  return (
    <PricingDisplay 
      bookingData={bookingData} 
      compact={true} 
    />
  );
}
```

### Enhanced Summary
```typescript
import EnhancedBookingSummary from '@/components/booking/EnhancedBookingSummary';

function ConfirmationPage() {
  return (
    <EnhancedBookingSummary 
      bookingData={bookingData} 
      showPricing={true} 
    />
  );
}
```

## Testing

### Test Pages
1. **`/test-pricing`** - Standalone pricing module test
2. **`/test-booking-integration`** - Integration overview
3. **`/booking`** - Full booking flow with pricing

### Test Scenarios
- Add/remove items and see price updates
- Change crew size and see price impact
- Test with different property types
- Verify distance calculations
- Check error handling with invalid data

## Configuration

### Pricing Constants
All pricing constants are in `src/lib/pricing/engine.ts`:
- Base rates
- Per-mile rates
- Item volume rates
- Worker costs
- Property surcharges

### Distance Calculation
Configured in `src/lib/pricing/distance-calculator.ts`:
- Earth radius for calculations
- Minimum distance enforcement
- Distance formatting

## Future Enhancements

### Planned Features
- Real-time traffic data integration
- Weather-based pricing adjustments
- Dynamic availability pricing
- Loyalty discount system
- A/B testing framework

### API Integrations
- Google Maps Distance Matrix API
- Met Office Weather API
- Real-time traffic APIs
- Postcode lookup services

## Troubleshooting

### Common Issues

**Price shows as zero:**
1. Check if items array is not empty
2. Verify address coordinates are present
3. Ensure crew size is set
4. Check browser console for errors

**Distance calculation fails:**
1. Verify coordinates are valid
2. Check if addresses are complete
3. Review distance calculator logs

**Pricing not updating:**
1. Ensure booking data is properly structured
2. Check for React state update issues
3. Verify component re-renders

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('pricing-debug', 'true');
```

This will log all pricing calculations to the console.

## Support

For integration issues:
1. Check the test pages first
2. Review the console for errors
3. Verify data structure matches expected format
4. Test with minimal data to isolate issues

The pricing module is designed to be robust and handle edge cases gracefully while providing clear feedback to users.
