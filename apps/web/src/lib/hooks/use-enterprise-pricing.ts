/**
 * Enterprise pricing hook for Speedy Van
 */

import { useState, useCallback } from 'react';
import { calculateDistanceInfo } from '@/lib/utils/distance-calculator';
import { unifiedPricingFacade, type UnifiedPricingRequest, type EnterprisePricingResult } from '@/lib/pricing/unified-pricing-facade';

export interface BookingFormData {
  pickupAddress: string;
  dropoffAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    weight?: number;
    fragile?: boolean;
  }>;
  scheduledDate?: string;
  serviceType?: 'standard' | 'express' | 'luxury';
}

export interface EnterprisePricingRequest {
  pickupCoordinates: { lat: number; lng: number };
  dropoffCoordinates: { lat: number; lng: number };
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  durationMinutes: number;
  vehicleType: string;
  serviceType: string;
  items: Array<{
    name: string;
    quantity: number;
    weight?: number;
    fragile?: boolean;
  }>;
  scheduledTime: string; // ISO string
}

export function useEnterprisePricing() {
  const [pricing, setPricing] = useState<EnterprisePricingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const calculateEnterprisePricing = useCallback(async (request: EnterprisePricingRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      // Transform the request to match UnifiedPricingRequest format
      const pricingRequest: UnifiedPricingRequest = {
        pickupCoordinates: request.pickupCoordinates,
        dropoffCoordinates: request.dropoffCoordinates,
        items: request.items,
        scheduledTime: request.scheduledTime,
        serviceType: request.serviceType,
        vehicleType: request.vehicleType,
        distanceKm: request.distanceKm,
        durationMinutes: request.durationMinutes,
      };

      const result = await unifiedPricingFacade.calculateEnterprisePricing(pricingRequest);
      setPricing(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pricing calculation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPricing = useCallback(() => {
    setPricing(null);
    setError(null);
  }, []);

  const calculatePricing = useCallback(async (request: UnifiedPricingRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await unifiedPricingFacade.calculatePricing(request);
      setPricing(result as EnterprisePricingResult);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate pricing';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    pricing,
    isLoading,
    error,
    calculateEnterprisePricing,
    calculatePricing,
    clearPricing,
  };
}

export function transformBookingToEnterprisePricingRequest(
  bookingData: any // Using any for now since the actual structure varies
): EnterprisePricingRequest {
  // Calculate actual distance if coordinates are available
  let distanceKm = 15; // Default fallback
  let durationMinutes = 90; // Default fallback
  
  if (bookingData.pickupAddress?.coordinates && bookingData.dropoffAddress?.coordinates) {
    const { calculateDistance, calculateDuration } = require('@/lib/utils/distance-calculator');
    
    try {
      distanceKm = calculateDistance(
        bookingData.pickupAddress.coordinates,
        bookingData.dropoffAddress.coordinates
      );
      durationMinutes = calculateDuration(distanceKm);
      
      console.log('📏 Distance calculated:', {
        pickup: bookingData.pickupAddress.coordinates,
        dropoff: bookingData.dropoffAddress.coordinates,
        distanceKm: distanceKm.toFixed(2),
        durationMinutes,
        pickupAddress: bookingData.pickupAddress.formatted_address,
        dropoffAddress: bookingData.dropoffAddress.formatted_address
      });
    } catch (error) {
      console.error('❌ Distance calculation failed:', error);
      // Keep default values
    }
  } else {
    console.warn('⚠️ Missing coordinates for distance calculation:', {
      hasPickupCoords: !!bookingData.pickupAddress?.coordinates,
      hasDropoffCoords: !!bookingData.dropoffAddress?.coordinates,
      pickupAddress: bookingData.pickupAddress,
      dropoffAddress: bookingData.dropoffAddress
    });
  }

  return {
    pickupCoordinates: bookingData.pickupAddress?.coordinates || { lat: 0, lng: 0 },
    dropoffCoordinates: bookingData.dropoffAddress?.coordinates || { lat: 0, lng: 0 },
    pickupAddress: bookingData.pickupAddress?.formatted_address || bookingData.pickupAddress || '',
    dropoffAddress: bookingData.dropoffAddress?.formatted_address || bookingData.dropoffAddress || '',
    distanceKm: bookingData.distanceKm || distanceKm,
    durationMinutes: bookingData.durationMinutes || durationMinutes,
    vehicleType: bookingData.vehicleType || 'van',
    serviceType: bookingData.serviceType || 'standard',
    items: (bookingData.items || []).map((item: any) => ({
      name: item.name || item.id || 'Unknown Item',
      quantity: item.quantity,
      weight: item.weight,
      fragile: item.fragile || false,
    })),
    scheduledTime: bookingData.scheduledDate || bookingData.scheduledTime || new Date().toISOString(),
  };
}