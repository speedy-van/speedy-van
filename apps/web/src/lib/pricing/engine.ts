// src/lib/pricing/engine.ts
// -----------------------------------------------------------------------------
// Simplified pricing engine for Speedy Van (UK market).
// Currency: GBP (£). Distance unit: miles.
// Implements: flat base fares, item-based pricing, simplified worker pricing,
// simplified stairs pricing, VAT, plus clear breakdown.
// -----------------------------------------------------------------------------

import { getItemPrice } from './item-catalog';
import { getCurrentPricingSettings } from './settings';

// ===== Types =================================================================

export type ItemSize = "small" | "medium" | "large";

export interface QuoteItem {
  key: string;              // item key from catalog
  quantity: number;         // >= 1
}

export interface AddressMeta {
  floors?: number;          // number of floors (0 = ground floor)
  hasLift?: boolean;        // true if lift is available
}

export interface PricingInputs {
  miles: number;                       // total trip distance in miles
  items: QuoteItem[];                  // list of items by size
  workersTotal: number;                // total people on-site (driver + helpers)
  pickup?: AddressMeta;
  dropoff?: AddressMeta;
  extras?: {
    ulezApplicable?: boolean;          // +£12.50
  };
  vatRegistered?: boolean;             // if true => +20%
}

export interface PricingBreakdown {
  baseRate: number;
  distanceCost: number;
  itemsCost: number;
  workersCost: number;
  stairsCost: number;
  extrasCost: number;
  subtotal: number;
  vat: number;
  total: number;
  priceAdjustment: number; // Percentage adjustment applied (0 if none)
}

export interface PricingResult {
  totalGBP: number;
  breakdown: PricingBreakdown;
}

// ===== Constants =============================================================

// Flat base fares
const BASE_FARE_CITY = 40;        // ≤10 miles
const BASE_FARE_REGIONAL = 60;    // ≤50 miles
const RATE_PER_EXTRA_MILE = 1.20; // beyond 50 miles

// Item pricing will be calculated from catalog

// Worker pricing
const WORKER_INCLUDED = 1;         // 1 worker included in base rate
const EXTRA_WORKER_COST = 20;      // £20 per additional worker

// Stairs pricing
const STAIRS_PER_FLOOR = 10;       // £10 per floor after first (no lift)

// Extras
const ULEZ_GBP = 12.50;

// Hard guardrails
const MINIMUM_PRICE_GBP = 50;
const MAXIMUM_PRICE_GBP = 5000;
const VAT_RATE = 0.2;

// ===== Helpers ===============================================================

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const roundGBP = (v: number) => Math.round(v); // nearest pound

function calculateBaseFare(miles: number): { base: number; extraMiles: number } {
  if (miles <= 10) {
    return { base: BASE_FARE_CITY, extraMiles: 0 };
  } else if (miles <= 50) {
    return { base: BASE_FARE_REGIONAL, extraMiles: 0 };
  } else {
    const extraMiles = miles - 50;
    return { base: BASE_FARE_REGIONAL, extraMiles };
  }
}

function calculateItemsCost(items: QuoteItem[]): number {
  console.log('Pricing engine - calculating items cost for:', items);
  const total = items.reduce((total, item) => {
    const itemPrice = getItemPrice(item.key);
    console.log(`Pricing engine - item ${item.key} x${item.quantity}: £${itemPrice} = £${itemPrice * item.quantity}`);
    return total + (itemPrice * item.quantity);
  }, 0);
  console.log('Pricing engine - total items cost:', total);
  return total;
}

function calculateWorkersCost(workersTotal: number): number {
  const extraWorkers = Math.max(0, workersTotal - WORKER_INCLUDED);
  return extraWorkers * EXTRA_WORKER_COST;
}

function calculateStairsCost(pickup?: AddressMeta, dropoff?: AddressMeta): number {
  let totalCost = 0;
  
  // Pickup stairs
  if (pickup?.floors && pickup.floors > 1 && !pickup.hasLift) {
    totalCost += (pickup.floors - 1) * STAIRS_PER_FLOOR;
  }
  
  // Dropoff stairs
  if (dropoff?.floors && dropoff.floors > 1 && !dropoff.hasLift) {
    totalCost += (dropoff.floors - 1) * STAIRS_PER_FLOOR;
  }
  
  return totalCost;
}

// ===== Engine ================================================================

export async function computeQuote(input: PricingInputs): Promise<PricingResult> {
  console.log('Pricing engine - computeQuote called with inputs:', input);
  
  // Get current pricing settings
  const pricingSettings = await getCurrentPricingSettings();
  console.log('Pricing engine - pricing settings:', pricingSettings);
  
  const miles = Math.max(0, input.miles);
  console.log('Pricing engine - miles:', miles);
  
  // Base fare calculation
  const { base: baseRate, extraMiles } = calculateBaseFare(miles);
  const distanceCost = extraMiles * RATE_PER_EXTRA_MILE;
  console.log('Pricing engine - baseRate:', baseRate, 'extraMiles:', extraMiles, 'distanceCost:', distanceCost);
  
  // Items cost
  const itemsCost = calculateItemsCost(input.items || []);
  console.log('Pricing engine - itemsCost:', itemsCost);
  
  // Workers cost
  const workersCost = calculateWorkersCost(input.workersTotal || 1);
  console.log('Pricing engine - workersCost:', workersCost);
  
  // Stairs cost
  const stairsCost = calculateStairsCost(input.pickup, input.dropoff);
  console.log('Pricing engine - stairsCost:', stairsCost);
  
  // Extras cost
  const extrasCost = input.extras?.ulezApplicable ? ULEZ_GBP : 0;
  console.log('Pricing engine - extrasCost:', extrasCost);
  
  // Subtotal
  const subtotal = baseRate + distanceCost + itemsCost + workersCost + stairsCost + extrasCost;
  console.log('Pricing engine - subtotal before adjustment:', subtotal);
  
  // Apply pricing adjustment if settings are active
  let adjustedSubtotal = subtotal;
  if (pricingSettings.isActive && pricingSettings.customerPriceAdjustment !== 0) {
    const adjustmentMultiplier = 1 + pricingSettings.customerPriceAdjustment;
    adjustedSubtotal = subtotal * adjustmentMultiplier;
    console.log('Pricing engine - applied adjustment:', pricingSettings.customerPriceAdjustment * 100 + '%', 'new subtotal:', adjustedSubtotal);
  }
  
  // Apply minimum/maximum boundaries
  const clampedSubtotal = clamp(adjustedSubtotal, MINIMUM_PRICE_GBP, MAXIMUM_PRICE_GBP);
  console.log('Pricing engine - clampedSubtotal:', clampedSubtotal);
  
  // VAT
  const vat = input.vatRegistered ? roundGBP(clampedSubtotal * VAT_RATE) : 0;
  console.log('Pricing engine - vat:', vat);
  
  // Total
  const total = clampedSubtotal + vat;
  console.log('Pricing engine - final total:', total);
  
  const result = {
    totalGBP: Math.round(total * 100) / 100, // Round to 2 decimal places
    breakdown: {
      baseRate: Math.round(baseRate * 100) / 100,
      distanceCost: Math.round(distanceCost * 100) / 100,
      itemsCost: Math.round(itemsCost * 100) / 100,
      workersCost: Math.round(workersCost * 100) / 100,
      stairsCost: Math.round(stairsCost * 100) / 100,
      extrasCost: Math.round(extrasCost * 100) / 100,
      subtotal: Math.round(clampedSubtotal * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      total: Math.round(total * 100) / 100,
      priceAdjustment: pricingSettings.isActive && pricingSettings.customerPriceAdjustment !== 0 
        ? Math.round(pricingSettings.customerPriceAdjustment * 100) / 100 
        : 0,
    },
  };
  
  console.log('Pricing engine - returning result:', result);
  return result;
}
