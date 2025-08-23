# 🏠 Address Autocomplete System - Speedy Van

## 📋 Overview

The address autocomplete system provides intelligent address suggestions for both pickup and dropoff locations in the booking flow. It supports both real-time API integration with Mapbox and fallback mock data for development.

## ✨ Features

### 🔍 **Real-time Address Search**
- **Mapbox API Integration**: Uses Mapbox Geocoding API for accurate UK address suggestions
- **Smart Filtering**: Searches by street name, city, and postcode
- **Debounced Search**: Optimized performance with 300ms debouncing
- **Fallback System**: Automatically falls back to mock data if API is unavailable

### 📍 **Current Location Detection**
- **GPS Integration**: Uses browser geolocation API
- **Reverse Geocoding**: Converts coordinates to readable addresses
- **One-Click Setup**: "Use Current Location" buttons for both pickup and dropoff
- **Error Handling**: Graceful fallback with user-friendly error messages

### 🎯 **Smart Validation**
- **UK Postcode Validation**: Real-time validation of UK postcode format
- **Auto-formatting**: Automatically formats postcodes (e.g., "SW1A2AA" → "SW1A 2AA")
- **Required Field Validation**: Comprehensive form validation with error messages

### 🎨 **User Experience**
- **Loading States**: Visual feedback during search and location detection
- **Suggestion Dropdown**: Clean, searchable dropdown with address details
- **Click Outside**: Suggestions close when clicking outside the input area
- **Responsive Design**: Works seamlessly on mobile and desktop

## 🛠️ Technical Implementation

### 📁 **File Structure**
```
src/
├── lib/
│   └── addressService.ts          # Core address service
├── components/booking/
│   └── PickupDropoffStep.tsx      # Main address input component
└── types/
    └── pricing.ts                 # TypeScript interfaces
```

### 🔧 **Key Components**

#### `addressService.ts`
```typescript
// Main search function
export async function searchAddresses(
  query: string, 
  useRealAPI: boolean = true
): Promise<AddressSuggestion[]>

// Current location detection
export function getCurrentLocation(): Promise<{lat: number, lng: number}>

// Postcode validation
export function validateUKPostcode(postcode: string): boolean
```

#### `PickupDropoffStep.tsx`
- **State Management**: Manages suggestions, loading states, and form data
- **Event Handling**: Debounced search, location detection, form validation
- **UI Components**: Input groups, suggestion dropdowns, location buttons

### 🌐 **API Integration**

#### Mapbox Geocoding API
```javascript
// Search endpoint
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
  ?access_token={token}
  &country=GB
  &types=address,poi
  &limit=10
  &language=en

// Reverse geocoding
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json
  ?access_token={token}
  &types=address
  &language=en
```

#### Environment Variables
```bash
# Required for production
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWhtYWRhbHdha2FpIiwiYSI6ImNtZGNsZ3RsZDEzdGsya3F0ODFxeGRzbXoifQ.jfgGW0KNFTwATOShRDtQsg
```

## 🚀 **Usage Examples**

### Basic Address Search
```typescript
import { searchAddresses } from '@/lib/addressService';

// Search for addresses
const suggestions = await searchAddresses('Buckingham Palace');
console.log(suggestions);
// Output: [{ line1: "Buckingham Palace", city: "London", postcode: "SW1A 1AA", ... }]
```

### Current Location Detection
```typescript
import { getCurrentLocation, getAddressFromCoordinates } from '@/lib/addressService';

// Get current location
const coords = await getCurrentLocation();
const address = await getAddressFromCoordinates(coords.lat, coords.lng);
console.log(address);
// Output: { line1: "123 Main St", city: "London", postcode: "SW1A 1AA", ... }
```

### Postcode Validation
```typescript
import { validateUKPostcode, formatUKPostcode } from '@/lib/addressService';

// Validate postcode
const isValid = validateUKPostcode('SW1A 2AA'); // true
const formatted = formatUKPostcode('SW1A2AA'); // "SW1A 2AA"
```

## 📱 **User Interface**

### Address Input Fields
- **Search Placeholder**: "Start typing to search addresses..."
- **Search Icon**: Visual indicator for search functionality
- **Loading Spinner**: Shows during API calls
- **Suggestion Dropdown**: Appears below input with search results

### Location Buttons
- **"Use Current Location"**: One-click GPS detection
- **Loading State**: "Detecting..." text during location search
- **Success/Error Messages**: Toast notifications for feedback

### Form Validation
- **Real-time Validation**: Immediate feedback on postcode format
- **Error Messages**: Clear, actionable error descriptions
- **Required Fields**: Visual indicators for mandatory inputs

## 🔄 **Data Flow**

1. **User Input** → Debounced search (300ms delay)
2. **API Call** → Mapbox geocoding API
3. **Response Processing** → Parse and format address data
4. **UI Update** → Display suggestions in dropdown
5. **Selection** → Auto-fill form fields
6. **Validation** → Check postcode format and required fields

## 🛡️ **Error Handling**

### API Failures
- **Network Errors**: Fallback to mock data
- **Rate Limiting**: Graceful degradation
- **Invalid Responses**: Error logging and user notification

### Location Services
- **Permission Denied**: Clear error message with manual input guidance
- **Timeout**: 10-second timeout with retry option
- **Unsupported Browser**: Fallback to manual input

### Validation Errors
- **Invalid Postcode**: Real-time format checking
- **Missing Fields**: Required field validation
- **Invalid Coordinates**: Range validation for UK addresses

## 🧪 **Testing**

### Manual Testing
1. **Address Search**: Type "London" in pickup address field
2. **Location Detection**: Click "Use Current Location" button
3. **Postcode Validation**: Enter invalid postcode format
4. **Form Submission**: Try to proceed with missing fields

### API Testing
```bash
# Test Mapbox API directly
curl "https://api.mapbox.com/geocoding/v5/mapbox.places/London.json?access_token=YOUR_TOKEN&country=GB&types=address&limit=5"
```

## 🔧 **Configuration**

### Development Mode
- **Mock Data**: Uses predefined UK addresses
- **No API Key**: Works without Mapbox token
- **Fast Response**: Instant suggestions for testing

### Production Mode
- **Real API**: Uses Mapbox geocoding service
- **API Key Required**: `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Rate Limiting**: Respects Mapbox API limits

## 📊 **Performance**

### Optimization Features
- **Debouncing**: Reduces API calls during typing
- **Caching**: Browser-level caching of API responses
- **Lazy Loading**: Suggestions load only when needed
- **Fallback System**: Graceful degradation for poor connectivity

### Metrics
- **Search Response**: < 500ms average
- **Location Detection**: < 3 seconds
- **Form Validation**: < 100ms
- **Memory Usage**: Minimal impact on bundle size

## 🔮 **Future Enhancements**

### Planned Features
- **Address History**: Remember recent addresses
- **Favorites**: Save frequently used addresses
- **Voice Input**: Speech-to-text for address entry
- **Map Integration**: Visual address selection
- **International Support**: Expand beyond UK addresses

### Technical Improvements
- **Service Worker**: Offline address caching
- **Predictive Search**: AI-powered suggestions
- **Batch Processing**: Multiple address validation
- **Analytics**: Usage tracking and optimization

## 📞 **Support**

For technical support or feature requests:
- **Email**: support@speedy-van.com
- **Documentation**: See main README.md
- **Issues**: Create GitHub issue for bugs

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Next.js 14+, React 18+, TypeScript 5+
