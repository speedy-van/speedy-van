// src/lib/pricing/catalog-dataset.ts
// -----------------------------------------------------------------------------
// Loads and manages the complete item catalog from CSV data.
// Provides item lookup, normalization, and autocomplete functionality.
// -----------------------------------------------------------------------------

import { buildSynonymIndex, searchSynonymIndex } from './build-synonym-index';
import { isValidCategory } from './category-registry';
import { CatalogItem, NormalizedItem, SynonymIndex } from './types';

// In-memory catalog cache
let catalogCache: CatalogItem[] | null = null;
let synonymIndexCache: SynonymIndex | null = null;

// Load catalog data from CSV
export async function loadCatalogDataset(): Promise<CatalogItem[]> {
  if (catalogCache) {
    return catalogCache;
  }

  try {
    // Load from CSV file in production, fallback to hardcoded data
    let catalogData: CatalogItem[] = [];
    
    try {
      // Try to load from CSV file
      const response = await fetch('/api/pricing/catalog');
      if (response.ok) {
        catalogData = await response.json();
      } else {
        throw new Error('Failed to load catalog from API');
      }
    } catch (error) {
      console.warn('Falling back to hardcoded catalog data:', error);
      // Fallback to hardcoded data
      catalogData = [
      // Sofas
      {
        id: "armchair-1seat",
        canonicalName: "Armchair (1-seat)",
        category: "sofas",
        synonyms: ["armchair", "1 seat sofa", "single seater", "chair"],
        volumeFactor: 0.8,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 18
      },
      {
        id: "sofa-2seat",
        canonicalName: "Sofa – 2-seat",
        category: "sofas",
        synonyms: ["2 seater", "small sofa", "couch", "settee"],
        volumeFactor: 1.2,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 32
      },
      {
        id: "sofa-3seat",
        canonicalName: "Sofa – 3-seat",
        category: "sofas",
        synonyms: ["3 seater", "medium sofa", "regular sofa"],
        volumeFactor: 1.6,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 48
      },
      {
        id: "sofa-4seat",
        canonicalName: "Sofa – 4-seat",
        category: "sofas",
        synonyms: ["4 seater", "large sofa"],
        volumeFactor: 2.0,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 62
      },
      {
        id: "sofa-corner",
        canonicalName: "Corner Sofa (L-shape)",
        category: "sofas",
        synonyms: ["corner sofa", "L shape", "sectional", "corner couch"],
        volumeFactor: 2.5,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: true,
        basePriceHint: 85
      },
      // Beds
      {
        id: "bed-single",
        canonicalName: "Single Bed Frame",
        category: "beds",
        synonyms: ["single bed", "3ft bed"],
        volumeFactor: 1.0,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: true,
        basePriceHint: 28
      },
      {
        id: "bed-double",
        canonicalName: "Double Bed Frame",
        category: "beds",
        synonyms: ["double bed", "4ft6 bed", "double"],
        volumeFactor: 1.4,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: true,
        basePriceHint: 42
      },
      {
        id: "mattress",
        canonicalName: "Mattress (any size)",
        category: "beds",
        synonyms: ["mattress", "single mattress", "double mattress", "king mattress"],
        volumeFactor: 0.8,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 22
      },
      // Storage
      {
        id: "wardrobe-2door",
        canonicalName: "Wardrobe – 2-door",
        category: "storage",
        synonyms: ["small wardrobe", "2 door wardrobe", "closet"],
        volumeFactor: 1.4,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: true,
        basePriceHint: 40
      },
      {
        id: "bookshelf-tall",
        canonicalName: "Bookshelf (tall)",
        category: "storage",
        synonyms: ["bookcase", "tall shelf", "shelf"],
        volumeFactor: 0.9,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 28
      },
      // Tables
      {
        id: "table-dining-4",
        canonicalName: "Dining Table (4 seats)",
        category: "tables",
        synonyms: ["dining table", "4 seater table", "kitchen table"],
        volumeFactor: 1.4,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: true,
        basePriceHint: 38
      },
      {
        id: "table-coffee",
        canonicalName: "Coffee Table",
        category: "tables",
        synonyms: ["coffee table", "center table"],
        volumeFactor: 0.6,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 18
      },
      // Appliances
      {
        id: "fridge-standard",
        canonicalName: "Fridge Freezer (standard)",
        category: "appliances",
        synonyms: ["fridge", "refrigerator", "freezer", "fridge freezer"],
        volumeFactor: 1.6,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 45
      },
      {
        id: "fridge-american",
        canonicalName: "American Fridge Freezer",
        category: "appliances",
        synonyms: ["american fridge", "large fridge", "american style fridge"],
        volumeFactor: 2.5,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 80
      },
      {
        id: "washing-machine",
        canonicalName: "Washing Machine",
        category: "appliances",
        synonyms: ["washing machine", "washer"],
        volumeFactor: 1.4,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 45
      },
      // Electronics
      {
        id: "tv-43-55",
        canonicalName: "TV 43-55\"",
        category: "electronics",
        synonyms: ["tv", "television", "43 inch tv", "55 inch tv", "smart tv"],
        volumeFactor: 0.5,
        requiresTwoPerson: false,
        isFragile: true,
        requiresDisassembly: false,
        basePriceHint: 22
      },
      {
        id: "tv-65",
        canonicalName: "TV 65\"",
        category: "electronics",
        synonyms: ["65 tv", "large tv", "65 inch tv"],
        volumeFactor: 0.7,
        requiresTwoPerson: true,
        isFragile: true,
        requiresDisassembly: false,
        basePriceHint: 28
      },
      // Special items
      {
        id: "piano-upright",
        canonicalName: "Upright Piano",
        category: "special",
        synonyms: ["piano", "upright piano", "keyboard piano"],
        volumeFactor: 5.0,
        requiresTwoPerson: true,
        isFragile: true,
        requiresDisassembly: false,
        basePriceHint: 140
      },
      // Boxes
      {
        id: "box-small",
        canonicalName: "Box - Small",
        category: "boxes",
        synonyms: ["small box", "box", "cardboard box"],
        volumeFactor: 0.2,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 4
      },
      {
        id: "box-medium",
        canonicalName: "Box - Medium",
        category: "boxes",
        synonyms: ["medium box", "packing box"],
        volumeFactor: 0.2,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 4
      },
      {
        id: "box-large",
        canonicalName: "Box - Large",
        category: "boxes",
        synonyms: ["large box", "suitcase", "storage box"],
        volumeFactor: 0.4,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 9
      },
      {
        id: "box-book",
        canonicalName: "Book Box (heavy)",
        category: "boxes",
        synonyms: ["book box", "heavy box", "books box"],
        volumeFactor: 0.3,
        requiresTwoPerson: true,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 9
      }
    ];
    }

    // Validate and build synonym index
    catalogData = catalogData.filter(item => {
      if (!isValidCategory(item.category)) {
        console.warn(`Invalid category "${item.category}" for item ${item.id}`);
        return false;
      }
      return true;
    });
    
    catalogCache = catalogData;
    
    // Build synonym index
    try {
      synonymIndexCache = buildSynonymIndex(catalogData);
      console.log('Synonym index built successfully:', synonymIndexCache.metadata);
    } catch (error) {
      console.error('Failed to build synonym index:', error);
    }
    
    return catalogData;
  } catch (error) {
    console.error('Failed to load catalog dataset:', error);
    throw new Error('Failed to load item catalog');
  }
}

// Get item by ID
export async function getCatalogItem(id: string): Promise<CatalogItem | null> {
  const catalog = await loadCatalogDataset();
  return catalog.find(item => item.id === id) || null;
}

// Search items by text (for autocomplete)
export async function searchCatalogItems(query: string): Promise<CatalogItem[]> {
  const catalog = await loadCatalogDataset();
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];

  return catalog.filter(item => {
    // Check canonical name
    if (item.canonicalName.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Check synonyms
    const synonyms = item.synonyms || [];
    
    return synonyms.some(synonym => 
      synonym.toLowerCase().includes(normalizedQuery)
    );
  });
}

// Get items by category
export async function getItemsByCategory(category: string): Promise<CatalogItem[]> {
  const catalog = await loadCatalogDataset();
  return catalog.filter(item => item.category === category);
}

// Get all categories
export async function getCategories(): Promise<string[]> {
  const catalog = await loadCatalogDataset();
  return [...new Set(catalog.map(item => item.category))];
}

// Load or get synonym index
export async function loadSynonymIndex(): Promise<SynonymIndex | null> {
  if (synonymIndexCache) {
    return synonymIndexCache;
  }
  
  // Try to load catalog first to build index
  try {
    await loadCatalogDataset();
    return synonymIndexCache;
  } catch (error) {
    console.error('Failed to load synonym index:', error);
    return null;
  }
}

// Get synonym index (synchronous, returns cached version)
export function getSynonymIndex(): SynonymIndex | null {
  return synonymIndexCache;
}

// Search using synonym index for better performance
export async function searchCatalogItemsWithIndex(
  query: string,
  options: {
    maxResults?: number;
    category?: string;
    fuzzy?: boolean;
  } = {}
): Promise<CatalogItem[]> {
  const index = await loadSynonymIndex();
  if (!index) {
    // Fallback to basic search
    return searchCatalogItems(query);
  }
  
  const itemIds = searchSynonymIndex(index, query);
  const catalog = await loadCatalogDataset();
  
  return itemIds
    .map(id => catalog.find(item => item.id === id))
    .filter(Boolean) as CatalogItem[];
}
