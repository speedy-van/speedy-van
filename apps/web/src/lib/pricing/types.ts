export interface CatalogItem {
  id: string;
  canonicalName: string;
  category: string;
  synonyms: string[];
  volumeFactor: number;
  requiresTwoPerson: boolean;
  isFragile: boolean;
  requiresDisassembly: boolean;
  basePriceHint: number;
}

export interface NormalizedItem {
  id: string;
  canonicalName: string;
  quantity: number;
  volumeFactor: number;
  requiresTwoPerson: boolean;
  isFragile: boolean;
  requiresDisassembly: boolean;
  basePriceHint: number;
}

export interface QuoteBreakdown {
  distanceBase: number;
  totalVolumeFactor: number;
  floorsCost: number;
  helpersCost: number;
  extrasCost: number;
  vat: number;
  total: number;
}

export interface PricingState {
  pickupPostcode: string;
  dropoffPostcode: string;
  distanceMiles: number;
  calculatedBasePrice: number;
  isGroundFloorToGroundFloor: boolean;
  pickupFloors: number;
  pickupHasLift: boolean;
  dropoffFloors: number;
  dropoffHasLift: boolean;
  normalizedItems: NormalizedItem[];
  helpersCount: number;
  extras: {
    ulez: boolean;
  };
  quoteBreakdown: QuoteBreakdown | null;
}

export interface SynonymIndex {
  exactMap: Record<string, string>;
  synonymsMap: Record<string, string[]>;
  tokenizationRules: {
    lowercasing: boolean;
    removeSymbols: boolean;
    unifyUKUS: boolean;
  };
  metadata?: {
    totalItems: number;
    totalSynonyms: number;
    buildTimestamp: number;
  };
}
