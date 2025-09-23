/**
 * Address autocomplete functionality for Speedy Van
 */

import { useState } from 'react';


export interface AddressSuggestion {
  id: string;
  address: {
    houseNumber?: string;
    street?: string;
    city: string;
    postcode: string;
    flatNumber?: string;
  };
  placeName?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  postcode?: string;
  city?: string;
  country: string;
  formattedAddress: string;
}

export interface AutocompleteOptions {
  limit?: number;
  country?: string;
  proximity?: {
    lat: number;
    lng: number;
  };
  types?: string[];
}

class AddressAutocompleteService {
  private cache = new Map<string, AddressSuggestion[]>();

  async searchAddresses(
    query: string,
    options: AutocompleteOptions = {}
  ): Promise<AddressSuggestion[]> {
    if (!query || query.length < 3) {
      return [];
    }

    // Check cache first
    const cacheKey = `${query}-${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // In a real implementation, this would call a geocoding service
      // For now, return mock data
      const suggestions: AddressSuggestion[] = [
        {
          id: '1',
          address: {
            houseNumber: '123',
            street: `${query} Street`,
            city: 'London',
            postcode: 'SW1A 1AA',
          },
          placeName: `${query} Address`,
          coordinates: { lat: 51.5074, lng: -0.1278 },
          postcode: 'SW1A 1AA',
          city: 'London',
          country: 'UK',
          formattedAddress: `${query}, London SW1A 1AA, UK`,
        },
        {
          id: '2',
          address: {
            houseNumber: '456',
            street: `${query} Avenue`,
            city: 'Manchester',
            postcode: 'M1 1AA',
          },
          placeName: `${query} Address`,
          coordinates: { lat: 53.4808, lng: -2.2426 },
          postcode: 'M1 1AA',
          city: 'Manchester',
          country: 'UK',
          formattedAddress: `${query}, Manchester M1 1AA, UK`,
        },
      ];

      // Cache the results
      this.cache.set(cacheKey, suggestions);
      
      return suggestions.slice(0, options.limit || 5);
    } catch (error) {
      console.error('Address autocomplete error:', error);
      return [];
    }
  }

  async geocodeAddress(address: string): Promise<AddressSuggestion | null> {
    try {
      // In a real implementation, this would call a geocoding service
      const suggestion: AddressSuggestion = {
        id: 'geocode-' + Date.now(),
        address: {
          city: 'London',
          postcode: 'SW1A 1AA',
          street: address,
        },
        coordinates: { lat: 51.5074, lng: -0.1278 },
        country: 'UK',
        formattedAddress: address,
      };

      return suggestion;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const addressAutocompleteService = new AddressAutocompleteService();

// React hook for address autocomplete
export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddresses = async (
    query: string,
    options?: AutocompleteOptions
  ): Promise<AddressSuggestion[]> => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await addressAutocompleteService.searchAddresses(query, options);
      setSuggestions(results);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSuggestions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setError(null);
  };

  return {
    suggestions,
    isLoading,
    error,
    searchAddresses,
    clearSuggestions,
  };
}
