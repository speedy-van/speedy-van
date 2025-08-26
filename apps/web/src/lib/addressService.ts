/**
 * Address Service for autocomplete functionality
 * Supports both mock data and real API integration
 */

export interface AddressSuggestion {
  line1: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  formatted?: string;
}

// Extended mock address data for development (when API is not available)
const MOCK_ADDRESSES: AddressSuggestion[] = [
  // London Addresses
  { line1: "10 Downing Street", city: "London", postcode: "SW1A 2AA", lat: 51.5034, lng: -0.1276 },
  { line1: "221B Baker Street", city: "London", postcode: "NW1 6XE", lat: 51.5238, lng: -0.1585 },
  { line1: "Buckingham Palace", city: "London", postcode: "SW1A 1AA", lat: 51.5014, lng: -0.1419 },
  { line1: "Tower Bridge", city: "London", postcode: "SE1 2UP", lat: 51.5055, lng: -0.0754 },
  { line1: "Big Ben", city: "London", postcode: "SW1A 0AA", lat: 51.4994, lng: -0.1245 },
  { line1: "Trafalgar Square", city: "London", postcode: "WC2N 5DN", lat: 51.5080, lng: -0.1281 },
  { line1: "Hyde Park", city: "London", postcode: "W2 2UH", lat: 51.5073, lng: -0.1657 },
  { line1: "Covent Garden", city: "London", postcode: "WC2E 8RF", lat: 51.5123, lng: -0.1223 },
  { line1: "Camden Market", city: "London", postcode: "NW1 8AF", lat: 51.5419, lng: -0.1456 },
  { line1: "Notting Hill", city: "London", postcode: "W11 1PA", lat: 51.5167, lng: -0.2000 },
  { line1: "Oxford Street", city: "London", postcode: "W1C 1AP", lat: 51.5154, lng: -0.1419 },
  { line1: "Piccadilly Circus", city: "London", postcode: "W1J 9HS", lat: 51.5101, lng: -0.1340 },
  { line1: "Leicester Square", city: "London", postcode: "WC2H 7NA", lat: 51.5113, lng: -0.1288 },
  { line1: "Regent Street", city: "London", postcode: "W1B 4HA", lat: 51.5139, lng: -0.1397 },
  { line1: "Bond Street", city: "London", postcode: "W1S 1SR", lat: 51.5144, lng: -0.1495 },
  
  // Manchester Addresses
  { line1: "Manchester Town Hall", city: "Manchester", postcode: "M60 2LA", lat: 53.4799, lng: -2.2446 },
  { line1: "Old Trafford", city: "Manchester", postcode: "M16 0RA", lat: 53.4631, lng: -2.2913 },
  { line1: "Etihad Stadium", city: "Manchester", postcode: "M11 3FF", lat: 53.4831, lng: -2.2004 },
  { line1: "Manchester Central", city: "Manchester", postcode: "M2 3GX", lat: 53.4775, lng: -2.2458 },
  { line1: "Spinningfields", city: "Manchester", postcode: "M3 3HF", lat: 53.4819, lng: -2.2508 },
  
  // Birmingham Addresses
  { line1: "Birmingham Town Hall", city: "Birmingham", postcode: "B3 3DQ", lat: 52.4800, lng: -1.9036 },
  { line1: "Bullring", city: "Birmingham", postcode: "B5 4BU", lat: 52.4775, lng: -1.8936 },
  { line1: "Birmingham New Street", city: "Birmingham", postcode: "B2 4QA", lat: 52.4779, lng: -1.8986 },
  { line1: "Birmingham Airport", city: "Birmingham", postcode: "B26 3QJ", lat: 52.4539, lng: -1.7480 },
  
  // Glasgow Addresses
  { line1: "Glasgow City Chambers", city: "Glasgow", postcode: "G2 1DU", lat: 55.8609, lng: -4.2514 },
  { line1: "Buchanan Street", city: "Glasgow", postcode: "G1 2FF", lat: 55.8607, lng: -4.2524 },
  { line1: "Glasgow Central Station", city: "Glasgow", postcode: "G1 3SL", lat: 55.8589, lng: -4.2575 },
  { line1: "Kelvingrove Art Gallery", city: "Glasgow", postcode: "G3 8AG", lat: 55.8687, lng: -4.2875 },
  
  // Edinburgh Addresses
  { line1: "Edinburgh Castle", city: "Edinburgh", postcode: "EH1 2NG", lat: 55.9486, lng: -3.1999 },
  { line1: "Royal Mile", city: "Edinburgh", postcode: "EH1 1RE", lat: 55.9497, lng: -3.1905 },
  { line1: "Princes Street", city: "Edinburgh", postcode: "EH2 2DF", lat: 55.9533, lng: -3.1883 },
  { line1: "Edinburgh Waverley", city: "Edinburgh", postcode: "EH1 1BB", lat: 55.9520, lng: -3.1896 },
  
  // Liverpool Addresses
  { line1: "Liverpool Town Hall", city: "Liverpool", postcode: "L2 3SW", lat: 53.4084, lng: -2.9916 },
  { line1: "Albert Dock", city: "Liverpool", postcode: "L3 4AA", lat: 53.4007, lng: -2.9932 },
  { line1: "Liverpool Lime Street", city: "Liverpool", postcode: "L1 1JD", lat: 53.4075, lng: -2.9778 },
  { line1: "Anfield Stadium", city: "Liverpool", postcode: "L4 0TH", lat: 53.4308, lng: -2.9608 }
];

/**
 * Search for address suggestions
 * @param query - The search query
 * @param useRealAPI - Whether to use real API (requires API keys)
 * @returns Promise<AddressSuggestion[]>
 */
export async function searchAddresses(
  query: string, 
  useRealAPI: boolean = true // Default to true now that we have Mapbox token
): Promise<AddressSuggestion[]> {
  
  // Return empty array if query is too short
  if (!query || query.length < 2) {
    return [];
  }

  // Use real API (Mapbox) by default
  if (useRealAPI) {
    return searchRealAddresses(query);
  }

  // Use mock data for development/testing
  return searchMockAddresses(query);
}

/**
 * Search mock addresses
 */
function searchMockAddresses(query: string): AddressSuggestion[] {
  const lowerQuery = query.toLowerCase();
  
  return MOCK_ADDRESSES.filter(address => 
    address.line1.toLowerCase().includes(lowerQuery) ||
    address.city.toLowerCase().includes(lowerQuery) ||
    address.postcode.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit to 10 results
}

/**
 * Search real addresses using Mapbox API
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN environment variable
 */
async function searchRealAddresses(query: string): Promise<AddressSuggestion[]> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!mapboxToken) {
    console.warn('Mapbox token not found, falling back to mock data');
    return searchMockAddresses(query);
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
      `access_token=${mapboxToken}&` +
      `country=GB&` +
      `types=address,poi&` +
      `limit=10&` +
      `language=en`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return searchMockAddresses(query); // Fallback to mock data
    }

    return data.features.map((feature: any) => {
      // Extract address components
      const context = feature.context || [];
      const place = context.find((ctx: any) => ctx.id.startsWith('place'))?.text || '';
      const postcode = context.find((ctx: any) => ctx.id.startsWith('postcode'))?.text || '';
      const region = context.find((ctx: any) => ctx.id.startsWith('region'))?.text || '';
      
      // Parse the full address
      const addressParts = feature.place_name.split(', ');
      const streetAddress = addressParts[0];
      const city = place || region || addressParts[1] || '';
      
      return {
        line1: streetAddress,
        city: city,
        postcode: postcode,
        lat: feature.center[1],
        lng: feature.center[0],
        formatted: feature.place_name
      };
    });

  } catch (error) {
    console.error('Error fetching addresses from Mapbox:', error);
    // Fallback to mock data
    return searchMockAddresses(query);
  }
}

/**
 * Get current location using browser geolocation
 */
export function getCurrentLocation(): Promise<{coords: {latitude: number, longitude: number}}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      },
      (error) => {
        let errorMessage = 'Failed to get current location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access or enter address manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please enter address manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter address manually.';
            break;
          default:
            errorMessage = 'Failed to get current location. Please enter address manually.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Get address details by coordinates (reverse geocoding)
 */
export async function getAddressFromCoordinates(
  lat: number, 
  lng: number,
  useRealAPI: boolean = true
): Promise<AddressSuggestion | null> {
  
  if (!useRealAPI) {
    // Find closest mock address
    const closest = MOCK_ADDRESSES.reduce((closest, current) => {
      const closestDistance = Math.sqrt(
        Math.pow(closest.lat - lat, 2) + Math.pow(closest.lng - lng, 2)
      );
      const currentDistance = Math.sqrt(
        Math.pow(current.lat - lat, 2) + Math.pow(current.lng - lng, 2)
      );
      return currentDistance < closestDistance ? current : closest;
    });
    
    return closest;
  }

  // Use Mapbox reverse geocoding
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!mapboxToken) {
    console.warn('Mapbox token not found, falling back to mock data');
    // Fallback to mock data when no token is available
    return getAddressFromCoordinates(lat, lng, false);
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
      `access_token=${mapboxToken}&` +
      `types=address&` +
      `language=en`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];
      const place = context.find((ctx: any) => ctx.id.startsWith('place'))?.text || '';
      const postcode = context.find((ctx: any) => ctx.id.startsWith('postcode'))?.text || '';
      
      return {
        line1: feature.place_name.split(',')[0],
        city: place,
        postcode: postcode,
        lat: feature.center[1],
        lng: feature.center[0],
        formatted: feature.place_name
      };
    }

    // If no address found, try with broader search
    const broadResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
      `access_token=${mapboxToken}&` +
      `types=place&` +
      `language=en`
    );

    if (broadResponse.ok) {
      const broadData = await broadResponse.json();
      if (broadData.features && broadData.features.length > 0) {
        const feature = broadData.features[0];
        return {
          line1: feature.place_name.split(',')[0],
          city: feature.place_name.split(',')[1]?.trim() || '',
          postcode: '',
          lat: feature.center[1],
          lng: feature.center[0],
          formatted: feature.place_name
        };
      }
    }

    // If still no result, return a generic address based on coordinates
    return {
      line1: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: 'Unknown',
      postcode: '',
      lat: lat,
      lng: lng,
      formatted: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };

  } catch (error) {
    console.error('Error reverse geocoding:', error);
    // Fallback to mock data
    return getAddressFromCoordinates(lat, lng, false);
  }
}

/**
 * Calculate distance between two addresses
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  // Convert to miles
  return distance * 0.621371;
}

/**
 * Validate UK postcode format
 */
export function validateUKPostcode(postcode: string): boolean {
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return ukPostcodeRegex.test(postcode);
}

/**
 * Format UK postcode
 */
export function formatUKPostcode(postcode: string): string {
  // Remove all spaces and convert to uppercase
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  
  // Add space before the last 3 characters
  if (cleaned.length >= 3) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }
  
  return cleaned;
}
