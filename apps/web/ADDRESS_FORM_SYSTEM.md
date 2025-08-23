# 🚚 Address Form System

A production-ready address form system with Mapbox integration, featuring pickup and dropoff address management with current location support.

## ✨ Features

- **Address Autocomplete**: Powered by Mapbox API with intelligent address parsing
- **Current Location**: GPS-based location detection for both pickup and dropoff
- **Dual Address Management**: Separate pickup and dropoff sections
- **Form Validation**: Real-time validation with user-friendly error messages
- **Lift Availability**: Checkboxes for accessibility information
- **Additional Notes**: Optional field for special instructions
- **Responsive Design**: Beautiful Chakra UI components
- **Error Handling**: Graceful fallbacks for API failures

## 📁 File Structure

```
src/
├── components/
│   ├── AddressAutocomplete.tsx    # Autocomplete input component
│   └── AddressForm.tsx            # Main form modal component
├── app/
│   ├── api/places/
│   │   ├── suggest/route.ts       # Address search API
│   │   └── reverse/route.ts       # Reverse geocoding API
│   └── test-address/
│       └── page.tsx               # Demo/test page
```

## 🚀 Quick Start

### 1. Environment Setup

Add your Mapbox token to your environment variables:

```bash
# .env.local
MAPBOX_TOKEN=your_mapbox_access_token_here
```

### 2. Basic Usage

```tsx
import AddressForm from './components/AddressForm';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (pickup: Address, dropoff: Address) => {
    console.log('Pickup:', pickup);
    console.log('Dropoff:', dropoff);
    // Save to your database, etc.
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Enter Addresses
      </Button>
      
      <AddressForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
```

### 3. Test the System

Visit `/test-address` to see a working demo of the address form system.

## 🔧 API Endpoints

### `/api/places/suggest`

**GET** `/api/places/suggest?q=search&country=GB&limit=6`

Returns address suggestions based on user input.

**Parameters:**
- `q` (required): Search query
- `country` (optional): Country code (default: GB)
- `limit` (optional): Number of results (default: 6)

**Response:**
```json
{
  "suggestions": [
    {
      "id": "mapbox_id",
      "label": "10 Downing Street, London, SW1A 2AA, United Kingdom",
      "address": {
        "line1": "10 Downing Street",
        "city": "London",
        "postcode": "SW1A 2AA"
      },
      "coords": {
        "lat": 51.5034,
        "lng": -0.1276
      }
    }
  ]
}
```

### `/api/places/reverse`

**GET** `/api/places/reverse?lat=51.5034&lng=-0.1276`

Converts coordinates to address information.

**Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude

**Response:**
```json
{
  "label": "10 Downing Street, London, SW1A 2AA, United Kingdom",
  "address": {
    "line1": "10 Downing Street",
    "city": "London",
    "postcode": "SW1A 2AA"
  },
  "coords": {
    "lat": 51.5034,
    "lng": -0.1276
  }
}
```

## 🎨 Components

### AddressAutocomplete

A controlled input component with address autocomplete functionality.

**Props:**
```tsx
interface AddressAutocompleteProps {
  value: string;                                    // Controlled input value
  onChange: (val: string) => void;                 // Input change handler
  onSelect: (sel: AutocompleteSelection) => void;  // Selection handler
  placeholder?: string;                            // Input placeholder
  disabled?: boolean;                              // Disable input
  country?: string;                                // Country filter
  limit?: number;                                  // Max suggestions
  minLength?: number;                              // Min chars before search
  debounceMs?: number;                             // Debounce delay
}
```

### AddressForm

A modal form component for managing pickup and dropoff addresses.

**Props:**
```tsx
interface AddressFormProps {
  isOpen: boolean;                                 // Modal open state
  onClose: () => void;                            // Close handler
  onSave: (pickup: Address, dropoff: Address) => void; // Save handler
}
```

## 📊 Data Types

### Address

```tsx
interface Address {
  label: string;                                   // Display label
  line1: string;                                   // Street address
  city: string;                                    // City name
  postcode: string;                                // Postal code
  notes?: string;                                  // Additional notes
  lift?: boolean;                                  // Lift availability
  coords?: { lat: number; lng: number };          // GPS coordinates
}
```

### AutocompleteSelection

```tsx
interface AutocompleteSelection {
  id: string;                                      // Unique identifier
  label: string;                                   // Display label
  address: AddressParts;                          // Structured address
  coords: Coordinates;                            // GPS coordinates
  raw?: any;                                      // Original API response
}
```

## 🔒 Error Handling

The system includes comprehensive error handling:

- **API Failures**: Graceful fallbacks when Mapbox is unavailable
- **Geolocation**: Handles permission denials and unsupported browsers
- **Network Issues**: Timeout protection and retry logic
- **Invalid Data**: Validation and sanitization of user input

## 🎯 Best Practices

1. **Environment Variables**: Always use environment variables for API tokens
2. **Error Boundaries**: Wrap the form in error boundaries for production
3. **Loading States**: The form includes built-in loading indicators
4. **Accessibility**: All components include proper ARIA labels and keyboard navigation
5. **Mobile Support**: Optimized for touch devices and mobile browsers

## 🧪 Testing

Visit `/test-address` to test all features:

1. **Address Search**: Type in the autocomplete fields
2. **Current Location**: Click "Use Current Location" buttons
3. **Form Validation**: Try submitting without required fields
4. **Lift Checkboxes**: Toggle accessibility options
5. **Notes Field**: Add additional instructions

## 🔧 Customization

### Styling

The components use Chakra UI and can be customized through:

- Theme overrides in `theme.ts`
- Component-specific styling props
- CSS custom properties

### API Integration

To use a different geocoding service:

1. Update the API routes in `/api/places/`
2. Modify the `normalizeSuggestions` function in `AddressAutocomplete`
3. Adjust the response format to match the expected structure

### Validation

Custom validation can be added by:

1. Extending the `Address` interface
2. Adding validation logic in the form component
3. Implementing custom error messages

## 📱 Mobile Considerations

- Touch-friendly button sizes
- Optimized autocomplete for mobile keyboards
- Geolocation permission handling
- Responsive modal sizing
- Swipe gestures for form navigation

## 🚀 Performance

- Debounced API calls (250ms default)
- Request cancellation on component unmount
- Cached responses with appropriate headers
- Lazy loading of non-critical features
- Optimized bundle size with tree shaking

## 🔐 Security

- API tokens kept server-side
- Input sanitization and validation
- CORS protection on API routes
- Rate limiting considerations
- HTTPS enforcement for geolocation

---

**Built with ❤️ using Next.js, Chakra UI, and Mapbox**

