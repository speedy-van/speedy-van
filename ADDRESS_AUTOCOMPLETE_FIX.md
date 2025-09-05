# Address Autocomplete Selection Fix

## Issue Description

When selecting an address from the autocomplete suggestions in the booking form (Step 1), the selected address would disappear after clicking on it. This was happening because:

1. The `AddressAutocomplete` component was calling `onChange(item.label)` after calling `onSelect(selection)`
2. This triggered the search effect again, which could interfere with the selection
3. The parent component's `onChange` handler was also updating the `line1` field during search, potentially overwriting the selected address data

## Root Cause Analysis

### Problem 1: Double onChange Call

```typescript
// In AddressAutocomplete.tsx - selectItem function
onSelect(selection);
onChange(item.label); // This was causing the issue
```

### Problem 2: Search Effect Interference

The search effect in `AddressAutocomplete` was being triggered when the value was updated after selection, causing unwanted API calls and potential data overwrites.

### Problem 3: Parent Component Interference

The parent component's `onChange` handler was updating the `line1` field during search, which could overwrite the selected address data.

## Solution Implemented

### 1. Removed onChange Call from AddressAutocomplete

```typescript
// Before
onSelect(selection);
onChange(item.label); // Removed this line

// After
onSelect(selection);
// Let parent component handle updating the search field
```

### 2. Added Selection Flag to Prevent API Calls

```typescript
// Added new ref to track value updates from selection
const isValueUpdateFromSelectionRef = React.useRef(false);

// In selectItem function
isValueUpdateFromSelectionRef.current = true;

// In search effect
if (
  !value ||
  value.length < minLength ||
  disabled ||
  isSelectingRef.current ||
  isValueUpdateFromSelectionRef.current
) {
  // Block API calls when value is updated from selection
  return;
}
```

### 3. Updated Parent Component Handlers

```typescript
// In PickupDropoffStep.tsx
const handlePickupAddressSelect = useCallback(
  (address: any) => {
    updateBookingData({
      pickupAddress: {
        line1: address.address?.line1 || address.line1 || '',
        city: address.address?.city || address.city || '',
        postcode: address.address?.postcode || address.postcode || '',
        coordinates: address.coords || address.coordinates,
      },
    });
    // Update search field with selected address label
    setPickupSearch(address.label || address.address?.line1 || '');
  },
  [updateBookingData]
);
```

### 4. Improved onChange Handler Logic

```typescript
// In PickupDropoffStep.tsx - onChange handler
onChange={(value) => {
  setPickupSearch(value);
  // Only update line1 during search if it's a short query (not a full address)
  // This prevents overwriting selected address data
  if (value.length < 50 && !value.includes(',')) {
    updatePickupAddress('line1', value);
  }
}}
```

## Technical Details

### Files Modified:

1. `apps/web/src/components/AddressAutocomplete.tsx`
   - Removed `onChange(item.label)` call from `selectItem` function
   - Added `isValueUpdateFromSelectionRef` to prevent API calls during value updates
   - Updated search effect to check the new flag

2. `apps/web/src/components/booking/PickupDropoffStep.tsx`
   - Updated `handlePickupAddressSelect` and `handleDropoffAddressSelect` to properly handle the selection data structure
   - Modified `onChange` handlers to prevent overwriting selected address data
   - Fixed responsive font size issues

### Key Changes:

- **Selection Flow**: `AddressAutocomplete` → `onSelect` → Parent component updates search field
- **API Call Prevention**: Flags prevent unwanted API calls during selection
- **Data Preservation**: Selected address data is preserved and not overwritten by search updates

## Testing

### Test Cases:

1. **Basic Selection**: Select an address from autocomplete suggestions
2. **Search After Selection**: Type in the search field after selecting an address
3. **Multiple Selections**: Select different addresses multiple times
4. **Edge Cases**: Test with various address formats and lengths

### Expected Behavior:

- ✅ Selected address remains visible in search field
- ✅ Address data (line1, city, postcode) is properly populated
- ✅ No unwanted API calls during selection
- ✅ Search functionality still works after selection
- ✅ Form validation works correctly with selected addresses

## Benefits

1. **Improved User Experience**: Selected addresses no longer disappear
2. **Better Performance**: Reduced unnecessary API calls
3. **Data Integrity**: Selected address data is preserved
4. **Maintainability**: Cleaner separation of concerns between components

## Future Considerations

1. **Debouncing**: Consider implementing debouncing for search queries
2. **Caching**: Implement caching for frequently searched addresses
3. **Error Handling**: Add better error handling for failed selections
4. **Accessibility**: Ensure keyboard navigation works properly with the new flow
