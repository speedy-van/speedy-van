import { UKAddressService } from '../address-service';
import { Coordinates, Address } from '../types';

// Mock fetch for testing
global.fetch = jest.fn();

describe('UKAddressService', () => {
  let addressService: UKAddressService;
  const mockMapboxToken = 'test-token';

  beforeEach(() => {
    addressService = new UKAddressService(mockMapboxToken);
    jest.clearAllMocks();
  });

  describe('Postcode Validation', () => {
    test('validates correct UK postcodes', () => {
      const validPostcodes = [
        'SW1A 1AA',
        'M1 1AA',
        'B33 8TH',
        'W1A 0AX',
        'EC1A 1BB',
        'sw1a 1aa', // lowercase
        'SW1A1AA', // no space
      ];

      validPostcodes.forEach(postcode => {
        expect(addressService.validatePostcode(postcode)).toBe(true);
      });
    });

    test('rejects invalid postcodes', () => {
      const invalidPostcodes = [
        'INVALID',
        '12345',
        'A1A 1A1', // Invalid format
        'SW1A 1AAA', // Too long
        'SW1 1A', // Too short
        '', // Empty
        'US12345', // US zip code
      ];

      invalidPostcodes.forEach(postcode => {
        expect(addressService.validatePostcode(postcode)).toBe(false);
      });
    });

    test('normalizes postcode format', () => {
      expect(addressService.normalizePostcode('sw1a1aa')).toBe('SW1A 1AA');
      expect(addressService.normalizePostcode('SW1A1AA')).toBe('SW1A 1AA');
      expect(addressService.normalizePostcode('SW1A 1AA')).toBe('SW1A 1AA');
      expect(addressService.normalizePostcode('  sw1a  1aa  ')).toBe(
        'SW1A 1AA'
      );
    });
  });

  describe('Address Autocomplete', () => {
    test('searches addresses with Mapbox API', async () => {
      const mockResponse = {
        features: [
          {
            place_name: '123 Test Street, London, UK',
            center: [-0.1278, 51.5074],
            properties: {
              accuracy: 'high',
            },
            context: [
              { id: 'postcode', text: 'SW1A 1AA' },
              { id: 'place', text: 'London' },
              { id: 'country', text: 'United Kingdom' },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await addressService.searchAddresses('123 Test Street');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'api.mapbox.com/geocoding/v5/mapbox.places/123%20Test%20Street.json'
        ),
        expect.objectContaining({
          method: 'GET',
        }));

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        formatted: '123 Test Street, London, UK',
        line1: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom',
        coordinates: [-0.1278, 51.5074],
        accuracy: 'high',
      });
    });

    test('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const results = await addressService.searchAddresses('123 Test Street');

      expect(results).toEqual([]);
    });

    test('handles empty search results', async () => {
      const mockResponse = { features: [] };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await addressService.searchAddresses('NonExistentAddress');

      expect(results).toEqual([]);
    });
  });

  describe('Address Validation', () => {
    test('validates complete addresses', () => {
      const validAddress: Address = {
        line1: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        verified: false,
      };

      const result = addressService.validateAddress(validAddress);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing required fields', () => {
      const invalidAddress: Partial<Address> = {
        line1: '',
        city: 'London',
        postcode: 'SW1A 1AA',
      };

      const result = addressService.validateAddress(invalidAddress as Address);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Address line 1 is required');
    });

    test('validates postcode format', () => {
      const invalidAddress: Address = {
        line1: '123 Test Street',
        city: 'London',
        postcode: 'INVALID',
        verified: false,
      };

      const result = addressService.validateAddress(invalidAddress);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid UK postcode');
    });
  });

  describe('Coordinate Validation', () => {
    test('validates valid coordinates', () => {
      const validCoordinates: Coordinates = {
        lat: 51.5074,
        lng: -0.1278,
      };

      const result = addressService.validateCoordinates(validCoordinates);
      expect(result.isValid).toBe(true);
    });

    test('detects invalid latitude', () => {
      const invalidCoordinates: Coordinates = {
        lat: 91.0, // Invalid latitude
        lng: -0.1278,
      };

      const result = addressService.validateCoordinates(invalidCoordinates);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90');
    });

    test('detects invalid longitude', () => {
      const invalidCoordinates: Coordinates = {
        lat: 51.5074,
        lng: 181.0, // Invalid longitude
      };

      const result = addressService.validateCoordinates(invalidCoordinates);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Longitude must be between -180 and 180');
    });
  });

  describe('Address Formatting', () => {
    test('formats address for display', () => {
      const address: Address = {
        line1: '123 Test Street',
        line2: 'Apartment 4B',
        city: 'London',
        postcode: 'SW1A 1AA',
        verified: false,
      };

      const formatted = addressService.formatAddress(address);
      expect(formatted).toBe('123 Test Street, Apartment 4B, London, SW1A 1AA');
    });

    test('formats address without line2', () => {
      const address: Address = {
        line1: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        verified: false,
      };

      const formatted = addressService.formatAddress(address);
      expect(formatted).toBe('123 Test Street, London, SW1A 1AA');
    });

    test('formats address with coordinates', () => {
      const address: Address = {
        line1: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        verified: false,
      };

      const formatted = addressService.formatAddress(address);
      expect(formatted).toBe('123 Test Street, London, SW1A 1AA (51.5074, -0.1278)');
    });
  });

  describe('Distance Calculation', () => {
    test('calculates distance between coordinates', () => {
      const coord1: Coordinates = { lat: 51.5074, lng: -0.1278 }; // London
      const coord2: Coordinates = { lat: 52.4862, lng: -1.8904 }; // Birmingham

      const distance = addressService.calculateDistance(coord1, coord2);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    test('returns 0 for same coordinates', () => {
      const coord: Coordinates = { lat: 51.5074, lng: -0.1278 };

      const distance = addressService.calculateDistance(coord, coord);
      expect(distance).toBe(0);
    });

    test('handles edge case coordinates', () => {
      const coord1: Coordinates = { lat: 0, lng: 0 };
      const coord2: Coordinates = { lat: 90, lng: 180 };

      const distance = addressService.calculateDistance(coord1, coord2);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      const results = await addressService.searchAddresses('123 Test Street');
      expect(results).toEqual([]);
    });

    test('handles malformed API responses', async () => {
      const malformedResponse = { invalid: 'response' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse,
      });

      const results = await addressService.searchAddresses('123 Test Street');
      expect(results).toEqual([]);
    });

    test('handles API rate limiting', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const results = await addressService.searchAddresses('123 Test Street');
      expect(results).toEqual([]);
    });
  });
});
