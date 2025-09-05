import { VehicleType, ItemCategory } from '@speedy-van/shared';

export interface PricingRequest {
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
  };
  items: PricingItem[];
  scheduledAt: Date;
  vehicleType?: VehicleType;
  urgency?: 'standard' | 'express' | 'same-day';
}

export interface PricingItem {
  category: ItemCategory;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface PricingResult {
  basePrice: number;
  distancePrice: number;
  itemsPrice: number;
  timePrice: number;
  urgencyPrice: number;
  totalPrice: number;
  estimatedDuration: number;
  recommendedVehicle: VehicleType;
  breakdown: PricingBreakdown[];
}

export interface PricingBreakdown {
  component: string;
  description: string;
  amount: number;
  unit?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: PricingCondition[];
  actions: PricingAction[];
  isActive: boolean;
}

export interface PricingCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
  value: any;
}

export interface PricingAction {
  type: 'multiply' | 'add' | 'subtract' | 'set' | 'percentage';
  target: 'basePrice' | 'distancePrice' | 'itemsPrice' | 'timePrice' | 'totalPrice';
  value: number;
}

export interface DistanceMatrix {
  distance: number; // in kilometers
  duration: number; // in minutes
  route?: {
    coordinates: [number, number][];
    instructions?: string[];
  };
}

export interface VehicleCapacity {
  maxWeight: number; // kg
  maxVolume: number; // cubic meters
  maxItems: number;
  basePrice: number;
  pricePerKm: number;
  pricePerMinute: number;
}

export const VEHICLE_CAPACITIES: Record<VehicleType, VehicleCapacity> = {
  [VehicleType.VAN]: {
    maxWeight: 1000,
    maxVolume: 10,
    maxItems: 50,
    basePrice: 50,
    pricePerKm: 2.5,
    pricePerMinute: 1.0,
  },
  [VehicleType.TRUCK]: {
    maxWeight: 3000,
    maxVolume: 25,
    maxItems: 100,
    basePrice: 100,
    pricePerKm: 4.0,
    pricePerMinute: 1.5,
  },
  [VehicleType.PICKUP]: {
    maxWeight: 500,
    maxVolume: 5,
    maxItems: 25,
    basePrice: 30,
    pricePerKm: 2.0,
    pricePerMinute: 0.8,
  },
};

export const ITEM_CATEGORY_MULTIPLIERS: Record<ItemCategory, number> = {
  [ItemCategory.FURNITURE]: 1.5,
  [ItemCategory.APPLIANCES]: 1.8,
  [ItemCategory.BOXES]: 1.0,
  [ItemCategory.FRAGILE]: 2.0,
  [ItemCategory.OTHER]: 1.2,
};

export const URGENCY_MULTIPLIERS = {
  standard: 1.0,
  express: 1.5,
  'same-day': 2.0,
} as const;

