import {
  PricingRequest,
  PricingResult,
  PricingBreakdown,
  DistanceMatrix,
  VEHICLE_CAPACITIES,
  ITEM_CATEGORY_MULTIPLIERS,
  URGENCY_MULTIPLIERS,
  VehicleCapacity,
} from '../models';
import { VehicleType, ItemCategory } from '@speedy-van/shared';

export class PricingCalculator {
  /**
   * Calculate pricing for a delivery request
   */
  async calculatePrice(request: PricingRequest): Promise<PricingResult> {
    // Get distance and duration
    const distanceMatrix = await this.calculateDistance(
      request.pickupLocation,
      request.deliveryLocation
    );

    // Determine optimal vehicle type
    const recommendedVehicle = this.determineVehicleType(request.items, request.vehicleType);
    const vehicleCapacity = VEHICLE_CAPACITIES[recommendedVehicle];

    // Calculate individual price components
    const basePrice = this.calculateBasePrice(vehicleCapacity);
    const distancePrice = this.calculateDistancePrice(distanceMatrix.distance, vehicleCapacity);
    const itemsPrice = this.calculateItemsPrice(request.items);
    const timePrice = this.calculateTimePrice(distanceMatrix.duration, vehicleCapacity);
    const urgencyPrice = this.calculateUrgencyPrice(
      basePrice + distancePrice + itemsPrice + timePrice,
      request.urgency || 'standard'
    );

    const totalPrice = basePrice + distancePrice + itemsPrice + timePrice + urgencyPrice;

    // Create breakdown
    const breakdown = this.createPricingBreakdown({
      basePrice,
      distancePrice,
      itemsPrice,
      timePrice,
      urgencyPrice,
      distance: distanceMatrix.distance,
      duration: distanceMatrix.duration,
      urgency: request.urgency || 'standard',
    });

    return {
      basePrice,
      distancePrice,
      itemsPrice,
      timePrice,
      urgencyPrice,
      totalPrice,
      estimatedDuration: distanceMatrix.duration,
      recommendedVehicle,
      breakdown,
    };
  }

  /**
   * Calculate base price for vehicle type
   */
  private calculateBasePrice(vehicleCapacity: VehicleCapacity): number {
    return vehicleCapacity.basePrice;
  }

  /**
   * Calculate distance-based pricing
   */
  private calculateDistancePrice(distance: number, vehicleCapacity: VehicleCapacity): number {
    return distance * vehicleCapacity.pricePerKm;
  }

  /**
   * Calculate items-based pricing
   */
  private calculateItemsPrice(items: PricingRequest['items']): number {
    let totalPrice = 0;

    for (const item of items) {
      const categoryMultiplier = ITEM_CATEGORY_MULTIPLIERS[item.category];
      const baseItemPrice = 5; // Base price per item
      
      let itemPrice = baseItemPrice * item.quantity * categoryMultiplier;

      // Add weight-based pricing
      if (item.weight) {
        itemPrice += item.weight * 0.5; // $0.50 per kg
      }

      // Add volume-based pricing
      if (item.dimensions) {
        const volume = (item.dimensions.length * item.dimensions.width * item.dimensions.height) / 1000000; // Convert to cubic meters
        itemPrice += volume * 10; // $10 per cubic meter
      }

      totalPrice += itemPrice;
    }

    return totalPrice;
  }

  /**
   * Calculate time-based pricing
   */
  private calculateTimePrice(duration: number, vehicleCapacity: VehicleCapacity): number {
    return duration * vehicleCapacity.pricePerMinute;
  }

  /**
   * Calculate urgency-based pricing
   */
  private calculateUrgencyPrice(baseTotal: number, urgency: keyof typeof URGENCY_MULTIPLIERS): number {
    const multiplier = URGENCY_MULTIPLIERS[urgency];
    return baseTotal * (multiplier - 1); // Only the additional amount
  }

  /**
   * Determine optimal vehicle type based on items
   */
  private determineVehicleType(
    items: PricingRequest['items'],
    preferredType?: VehicleType
  ): VehicleType {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalVolume = items.reduce((sum, item) => {
      if (!item.dimensions) return sum;
      const volume = (item.dimensions.length * item.dimensions.width * item.dimensions.height) / 1000000;
      return sum + volume * item.quantity;
    }, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Check if preferred type can handle the load
    if (preferredType) {
      const capacity = VEHICLE_CAPACITIES[preferredType];
      if (
        totalWeight <= capacity.maxWeight &&
        totalVolume <= capacity.maxVolume &&
        totalItems <= capacity.maxItems
      ) {
        return preferredType;
      }
    }

    // Find the smallest vehicle that can handle the load
    const vehicleTypes = [VehicleType.PICKUP, VehicleType.VAN, VehicleType.TRUCK];
    
    for (const vehicleType of vehicleTypes) {
      const capacity = VEHICLE_CAPACITIES[vehicleType];
      if (
        totalWeight <= capacity.maxWeight &&
        totalVolume <= capacity.maxVolume &&
        totalItems <= capacity.maxItems
      ) {
        return vehicleType;
      }
    }

    // Default to truck if nothing else fits
    return VehicleType.TRUCK;
  }

  /**
   * Calculate distance and duration between two points
   */
  private async calculateDistance(
    pickup: { latitude: number; longitude: number },
    delivery: { latitude: number; longitude: number }
  ): Promise<DistanceMatrix> {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(delivery.latitude - pickup.latitude);
    const dLon = this.toRadians(delivery.longitude - pickup.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(pickup.latitude)) *
        Math.cos(this.toRadians(delivery.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Estimate duration (assuming average speed of 40 km/h in city)
    const duration = (distance / 40) * 60; // Convert to minutes

    return {
      distance,
      duration,
    };
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Create detailed pricing breakdown
   */
  private createPricingBreakdown(params: {
    basePrice: number;
    distancePrice: number;
    itemsPrice: number;
    timePrice: number;
    urgencyPrice: number;
    distance: number;
    duration: number;
    urgency: string;
  }): PricingBreakdown[] {
    const breakdown: PricingBreakdown[] = [
      {
        component: 'base',
        description: 'Base service fee',
        amount: params.basePrice,
      },
      {
        component: 'distance',
        description: `Distance charge (${params.distance.toFixed(1)} km)`,
        amount: params.distancePrice,
        unit: 'km',
      },
      {
        component: 'items',
        description: 'Items handling fee',
        amount: params.itemsPrice,
      },
      {
        component: 'time',
        description: `Time charge (${Math.round(params.duration)} min)`,
        amount: params.timePrice,
        unit: 'min',
      },
    ];

    if (params.urgencyPrice > 0) {
      breakdown.push({
        component: 'urgency',
        description: `${params.urgency} delivery surcharge`,
        amount: params.urgencyPrice,
      });
    }

    return breakdown;
  }

  /**
   * Validate pricing request
   */
  validateRequest(request: PricingRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate coordinates
    if (!this.isValidCoordinate(request.pickupLocation.latitude, request.pickupLocation.longitude)) {
      errors.push('Invalid pickup location coordinates');
    }

    if (!this.isValidCoordinate(request.deliveryLocation.latitude, request.deliveryLocation.longitude)) {
      errors.push('Invalid delivery location coordinates');
    }

    // Validate items
    if (!request.items || request.items.length === 0) {
      errors.push('At least one item is required');
    }

    // Validate scheduled date
    if (request.scheduledAt < new Date()) {
      errors.push('Scheduled time must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if coordinates are valid
   */
  private isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}

