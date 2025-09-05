import { z } from 'zod';

const PricingInput = z.object({
  items: z.array(z.object({ 
    id: z.string(), 
    name: z.string(),
    category: z.enum(['furniture', 'electronics', 'boxes', 'appliances', 'other']),
    qty: z.number().int().min(1).default(1),
    weight: z.number().min(0).default(0),
    volume: z.number().min(0).default(0),
    fragile: z.boolean().default(false)
  })).default([]),
  distanceKm: z.number().min(0),
  serviceType: z.enum(['standard', 'express', 'scheduled', 'premium']).default('standard'),
  datetimeISO: z.string().optional(),
  originPostcode: z.string().optional(),
  destinationPostcode: z.string().optional(),
  additionalServices: z.array(z.enum(['packing', 'assembly', 'storage', 'insurance'])).default([])
});

export type PricingInput = z.infer<typeof PricingInput>;

interface PricingResult {
  total: number;
  breakdown: {
    base: number;
    distance: number;
    items: number;
    services: number;
    surcharges: number;
  };
  details: {
    baseRate: number;
    perKmRate: number;
    itemCharges: Array<{ item: string; charge: number }>;
    serviceCharges: Array<{ service: string; charge: number }>;
    surcharges: Array<{ type: string; charge: number }>;
  };
  currency: string;
  estimatedTime: string;
}

export async function toolPricing(input: unknown): Promise<{ ok: boolean; data: PricingResult; error?: string }> {
  try {
    const args = PricingInput.parse(input);
    
    // Base pricing logic
    let baseRate = 49;
    let perKmRate = 1.50;
    
    // Adjust for service type
    switch (args.serviceType) {
      case 'express':
        baseRate = 79;
        perKmRate = 2.00;
        break;
      case 'scheduled':
        baseRate = 59;
        perKmRate = 1.75;
        break;
      case 'premium':
        baseRate = 99;
        perKmRate = 2.50;
        break;
    }
    
    // Distance calculation
    const distanceCharge = args.distanceKm * perKmRate;
    
    // Item charges
    let itemCharges = 0;
    const itemDetails: Array<{ item: string; charge: number }> = [];
    
    for (const item of args.items) {
      let itemCharge = 0;
      
      // Base item charge
      switch (item.category) {
        case 'furniture':
          itemCharge = 15 + (item.weight * 0.5);
          break;
        case 'electronics':
          itemCharge = 25 + (item.weight * 0.3);
          break;
        case 'boxes':
          itemCharge = 5 + (item.volume * 2);
          break;
        case 'appliances':
          itemCharge = 20 + (item.weight * 0.4);
          break;
        default:
          itemCharge = 10 + (item.weight * 0.2);
      }
      
      // Fragile item surcharge
      if (item.fragile) {
        itemCharge *= 1.5;
      }
      
      itemCharge *= item.qty;
      itemCharges += itemCharge;
      itemDetails.push({ item: item.name, charge: itemCharge });
    }
    
    // Additional services
    let serviceCharges = 0;
    const serviceDetails: Array<{ service: string; charge: number }> = [];
    
    for (const service of args.additionalServices) {
      let serviceCharge = 0;
      
      switch (service) {
        case 'packing':
          serviceCharge = 25 * Math.ceil(args.items.length / 5);
          break;
        case 'assembly':
          serviceCharge = 15 * args.items.filter(i => i.category === 'furniture').length;
          break;
        case 'storage':
          serviceCharge = 25 * Math.ceil(args.distanceKm / 100);
          break;
        case 'insurance':
          serviceCharge = Math.round((baseRate + distanceCharge + itemCharges) * 0.05);
          break;
      }
      
      serviceCharges += serviceCharge;
      serviceDetails.push({ service, charge: serviceCharge });
    }
    
    // Surcharges
    let surcharges = 0;
    const surchargeDetails: Array<{ type: string; charge: number }> = [];
    
    // Weekend surcharge
    if (args.datetimeISO) {
      const date = new Date(args.datetimeISO);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        const weekendSurcharge = Math.round((baseRate + distanceCharge) * 0.2);
        surcharges += weekendSurcharge;
        surchargeDetails.push({ type: 'Weekend Service', charge: weekendSurcharge });
      }
    }
    
    // Long distance surcharge
    if (args.distanceKm > 100) {
      const longDistanceSurcharge = Math.round((baseRate + distanceCharge) * 0.1);
      surcharges += longDistanceSurcharge;
      surchargeDetails.push({ type: 'Long Distance', charge: longDistanceSurcharge });
    }
    
    // Calculate total
    const total = baseRate + distanceCharge + itemCharges + serviceCharges + surcharges;
    
    // Estimate time
    const baseTime = 2; // 2 hours base
    const distanceTime = Math.ceil(args.distanceKm / 30); // 30 km per hour average
    const itemTime = Math.ceil(args.items.length * 0.5); // 30 minutes per item
    const estimatedHours = baseTime + distanceTime + itemTime;
    
    const result: PricingResult = {
      total: Math.round(total * 100) / 100,
      breakdown: {
        base: baseRate,
        distance: Math.round(distanceCharge * 100) / 100,
        items: Math.round(itemCharges * 100) / 100,
        services: Math.round(serviceCharges * 100) / 100,
        surcharges: Math.round(surcharges * 100) / 100,
      },
      details: {
        baseRate,
        perKmRate,
        itemCharges: itemDetails,
        serviceCharges: serviceDetails,
        surcharges: surchargeDetails,
      },
      currency: 'GBP',
      estimatedTime: `${estimatedHours} hours`,
    };
    
    return { 
      ok: true, 
      data: result 
    };
    
  } catch (error) {
    return {
      ok: false,
      data: {
        total: 0,
        breakdown: { base: 0, distance: 0, items: 0, services: 0, surcharges: 0 },
        details: { baseRate: 0, perKmRate: 0, itemCharges: [], serviceCharges: [], surcharges: [] },
        currency: 'GBP',
        estimatedTime: 'Unknown',
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

