// src/lib/pricing/distance-calculator.ts
// -----------------------------------------------------------------------------
// Distance calculation service for pricing engine.
// Uses Haversine formula for coordinate-based distance calculation.
// -----------------------------------------------------------------------------

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  line1?: string;
  city?: string;
  postcode?: string;
  coordinates?: Coordinates;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in miles
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two addresses
 * @param pickup Pickup address
 * @param dropoff Dropoff address
 * @returns Distance in miles, or null if coordinates are missing
 */
export function calculateAddressDistance(pickup: Address, dropoff: Address): number | null {
  if (!pickup.coordinates || !dropoff.coordinates) {
    return null;
  }
  
  return calculateDistance(pickup.coordinates, dropoff.coordinates);
}

/**
 * Get estimated distance based on postcodes (fallback method)
 * This is a simplified estimation - in production you'd use a proper postcode API
 */
export function estimateDistanceByPostcode(pickup: Address, dropoff: Address): number | null {
  if (!pickup.postcode || !dropoff.postcode) {
    return null;
  }
  
  // This is a very basic estimation - in production you'd use:
  // 1. Postcode lookup API to get coordinates
  // 2. Then use calculateDistance function
  // 3. Or use a routing API like Google Maps, Mapbox, etc.
  
  // For now, return a default distance
  return 25; // Default 25 miles
}

/**
 * Calculate distance for pricing purposes
 * @param pickup Pickup address
 * @param dropoff Dropoff address
 * @returns Distance in miles (minimum 1 mile)
 */
export function getPricingDistance(pickup: Address, dropoff: Address): number {
  console.log('Distance calculator - pickup:', pickup);
  console.log('Distance calculator - dropoff:', dropoff);
  
  // Try coordinate-based calculation first
  const coordDistance = calculateAddressDistance(pickup, dropoff);
  console.log('Distance calculator - coordinate distance:', coordDistance);
  
  if (coordDistance !== null) {
    const result = Math.max(1, coordDistance);
    console.log('Distance calculator - returning coordinate distance:', result);
    return result;
  }
  
  // Try postcode-based estimation
  const postcodeDistance = estimateDistanceByPostcode(pickup, dropoff);
  console.log('Distance calculator - postcode distance:', postcodeDistance);
  
  if (postcodeDistance !== null) {
    const result = Math.max(1, postcodeDistance);
    console.log('Distance calculator - returning postcode distance:', result);
    return result;
  }
  
  // Default fallback
  const result = 25; // Default 25 miles
  console.log('Distance calculator - returning default distance:', result);
  return result;
}

/**
 * Format distance for display
 * @param distance Distance in miles
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return '< 1 mile';
  }
  
  if (distance === Math.round(distance)) {
    return `${distance} mile${distance !== 1 ? 's' : ''}`;
  }
  
  return `${distance} miles`;
}
