/**
 * Item Autocomplete System
 * Provides intelligent item search and suggestions for booking
 */

import { COMPREHENSIVE_CATALOG, searchCatalogItems, type CatalogItem } from '../pricing/catalog-dataset';

interface ItemSuggestion {
  id: string;
  name: string;
  category: string;
  description: string;
  volume: number;
  weight: number;
  unitPrice: number;
  image?: string;
  keywords: string[];
  popularity: number;
}

interface ItemSearchOptions {
  category?: string;
  limit?: number;
  includePopular?: boolean;
  fuzzyMatch?: boolean;
}

export class ItemAutocomplete {
  private items: ItemSuggestion[] = [];
  private searchIndex = new Map<string, Set<string>>();
  private popularItems: string[] = [];
  private synonyms = new Map<string, string[]>();

  constructor() {
    this.initializeItems();
    this.buildSearchIndex();
    this.initializeSynonyms();
  }

  // Search for item suggestions
  searchItems(
    query: string,
    options: ItemSearchOptions = {}
  ): ItemSuggestion[] {
    if (!query || query.length < 1) {
      return this.getPopularItems(options.limit || 10);
    }

    const searchTerms = this.normalizeQuery(query);
    let results: ItemSuggestion[] = [];

    // Exact matches first
    const exactMatches = this.findExactMatches(searchTerms, options);
    results.push(...exactMatches);

    // Partial matches
    if (results.length < (options.limit || 10)) {
      const partialMatches = this.findPartialMatches(searchTerms, options);
      results.push(...partialMatches.filter(item => 
        !results.some(existing => existing.id === item.id)
      ));
    }

    // Fuzzy matches if enabled
    if (options.fuzzyMatch && results.length < (options.limit || 10)) {
      const fuzzyMatches = this.findFuzzyMatches(searchTerms, options);
      results.push(...fuzzyMatches.filter(item => 
        !results.some(existing => existing.id === item.id)
      ));
    }

    // Sort by relevance
    results = this.sortByRelevance(results, query);

    return results.slice(0, options.limit || 10);
  }

  // Get popular items
  getPopularItems(limit: number = 10): ItemSuggestion[] {
    return this.items
      .filter(item => this.popularItems.includes(item.id))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // Get items by category
  getItemsByCategory(category: string, limit: number = 20): ItemSuggestion[] {
    return this.items
      .filter(item => item.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // Get item suggestions based on selected items
  getRelatedItems(selectedItemIds: string[], limit: number = 5): ItemSuggestion[] {
    const selectedCategories = this.items
      .filter(item => selectedItemIds.includes(item.id))
      .map(item => item.category);

    const uniqueCategories = [...new Set(selectedCategories)];
    
    return this.items
      .filter(item => 
        uniqueCategories.includes(item.category) && 
        !selectedItemIds.includes(item.id)
      )
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // Calculate popularity based on item characteristics
  private calculatePopularity(catalogItem: CatalogItem): number {
    let popularity = 50; // Base popularity
    
    // Common categories get higher popularity
    if (catalogItem.category === 'furniture') popularity += 30;
    if (catalogItem.category === 'appliances') popularity += 25;
    if (catalogItem.category === 'boxes') popularity += 40; // Boxes are very common
    if (catalogItem.category === 'kitchen') popularity += 20;
    
    // Common items get higher popularity
    const commonItems = ['sofa', 'bed', 'table', 'chair', 'box', 'tv', 'fridge', 'washing'];
    if (commonItems.some(item => catalogItem.name.toLowerCase().includes(item))) {
      popularity += 20;
    }
    
    // Smaller, easier items get higher popularity
    if (catalogItem.volume < 0.5) popularity += 15;
    if (catalogItem.weight < 20) popularity += 10;
    
    return Math.min(popularity, 100);
  }

  // Initialize items from comprehensive catalog
  private initializeItems(): void {
    // Convert comprehensive catalog to ItemSuggestion format
    this.items = COMPREHENSIVE_CATALOG.map(catalogItem => ({
      id: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      description: `${catalogItem.name} - ${catalogItem.keywords.split(',')[0].trim()}`,
      volume: catalogItem.volume,
      weight: catalogItem.weight,
      unitPrice: Math.round(catalogItem.volume * 20 + catalogItem.weight * 0.5), // Dynamic pricing
      keywords: catalogItem.keywords.split(',').map(k => k.trim()),
      popularity: this.calculatePopularity(catalogItem),
      image: `/items/${catalogItem.category}/${catalogItem.id}.png`
    }));

    // Legacy items for fallback (keeping some original popular items)
    const legacyItems = [
      { id: 'sofa', name: 'Sofa', category: 'furniture', description: '2-3 seater sofa', volume: 2.5, weight: 40, unitPrice: 45, keywords: ['couch', 'settee'], popularity: 95 },
      { id: 'dining-table', name: 'Dining Table', category: 'furniture', description: 'Standard dining table', volume: 1.8, weight: 30, unitPrice: 35, keywords: ['table', 'dining'], popularity: 80 },
      { id: 'bed-double', name: 'Double Bed', category: 'furniture', description: 'Double bed frame and mattress', volume: 3.0, weight: 50, unitPrice: 55, keywords: ['bed', 'mattress'], popularity: 90 },
      { id: 'wardrobe', name: 'Wardrobe', category: 'furniture', description: 'Large wardrobe', volume: 4.0, weight: 60, unitPrice: 65, keywords: ['closet', 'cupboard'], popularity: 75 },
      { id: 'chest-drawers', name: 'Chest of Drawers', category: 'furniture', description: 'Chest of drawers', volume: 1.5, weight: 25, unitPrice: 30, keywords: ['drawers', 'dresser'], popularity: 70 },
      { id: 'bookshelf', name: 'Bookshelf', category: 'furniture', description: 'Tall bookshelf', volume: 2.0, weight: 35, unitPrice: 40, keywords: ['shelf', 'bookcase'], popularity: 60 },
      { id: 'coffee-table', name: 'Coffee Table', category: 'furniture', description: 'Living room coffee table', volume: 0.8, weight: 15, unitPrice: 25, keywords: ['table', 'coffee'], popularity: 65 },
      { id: 'armchair', name: 'Armchair', category: 'furniture', description: 'Single armchair', volume: 1.5, weight: 25, unitPrice: 35, keywords: ['chair', 'armchair'], popularity: 70 },

      // Appliances
      { id: 'washing-machine', name: 'Washing Machine', category: 'appliances', description: 'Standard washing machine', volume: 1.2, weight: 70, unitPrice: 50, keywords: ['washer', 'laundry'], popularity: 85 },
      { id: 'fridge', name: 'Fridge', category: 'appliances', description: 'Standard refrigerator', volume: 2.0, weight: 80, unitPrice: 60, keywords: ['refrigerator', 'freezer'], popularity: 80 },
      { id: 'dishwasher', name: 'Dishwasher', category: 'appliances', description: 'Built-in dishwasher', volume: 1.0, weight: 50, unitPrice: 45, keywords: ['dish', 'washer'], popularity: 60 },
      { id: 'oven', name: 'Oven', category: 'appliances', description: 'Electric or gas oven', volume: 1.5, weight: 60, unitPrice: 55, keywords: ['cooker', 'stove'], popularity: 65 },
      { id: 'microwave', name: 'Microwave', category: 'appliances', description: 'Countertop microwave', volume: 0.3, weight: 15, unitPrice: 20, keywords: ['micro', 'wave'], popularity: 75 },

      // Electronics
      { id: 'tv-large', name: 'Large TV (50"+)', category: 'electronics', description: 'Large flat screen TV', volume: 0.8, weight: 25, unitPrice: 40, keywords: ['television', 'screen'], popularity: 85 },
      { id: 'tv-small', name: 'Small TV (32"-42")', category: 'electronics', description: 'Medium flat screen TV', volume: 0.4, weight: 15, unitPrice: 25, keywords: ['television', 'screen'], popularity: 70 },
      { id: 'computer', name: 'Desktop Computer', category: 'electronics', description: 'Desktop PC setup', volume: 0.5, weight: 20, unitPrice: 30, keywords: ['pc', 'desktop'], popularity: 60 },
      { id: 'printer', name: 'Printer', category: 'electronics', description: 'Office printer', volume: 0.3, weight: 10, unitPrice: 20, keywords: ['print'], popularity: 50 },

      // Boxes and Storage
      { id: 'box-small', name: 'Small Box', category: 'boxes', description: 'Small moving box', volume: 0.1, weight: 2, unitPrice: 5, keywords: ['box', 'small'], popularity: 90 },
      { id: 'box-medium', name: 'Medium Box', category: 'boxes', description: 'Medium moving box', volume: 0.2, weight: 3, unitPrice: 8, keywords: ['box', 'medium'], popularity: 95 },
      { id: 'box-large', name: 'Large Box', category: 'boxes', description: 'Large moving box', volume: 0.3, weight: 4, unitPrice: 12, keywords: ['box', 'large'], popularity: 85 },
      { id: 'wardrobe-box', name: 'Wardrobe Box', category: 'boxes', description: 'Hanging wardrobe box', volume: 0.8, weight: 5, unitPrice: 25, keywords: ['wardrobe', 'hanging'], popularity: 40 },

      // Miscellaneous
      { id: 'mattress', name: 'Mattress', category: 'furniture', description: 'Single/double mattress', volume: 1.5, weight: 20, unitPrice: 30, keywords: ['bed', 'mattress'], popularity: 80 },
      { id: 'mirror', name: 'Large Mirror', category: 'furniture', description: 'Wall mirror', volume: 0.2, weight: 10, unitPrice: 25, keywords: ['mirror', 'glass'], popularity: 45 },
      { id: 'bike', name: 'Bicycle', category: 'sports', description: 'Standard bicycle', volume: 1.0, weight: 15, unitPrice: 25, keywords: ['bike', 'cycle'], popularity: 55 },
    ];

    this.popularItems = this.items
      .filter(item => item.popularity > 70)
      .map(item => item.id);
  }

  // Build search index for faster searching
  private buildSearchIndex(): void {
    this.items.forEach(item => {
      const searchableTerms = [
        item.name.toLowerCase(),
        item.category.toLowerCase(),
        item.description.toLowerCase(),
        ...item.keywords.map(k => k.toLowerCase()),
      ];

      searchableTerms.forEach(term => {
        const words = term.split(/\s+/);
        words.forEach(word => {
          if (word.length > 2) {
            if (!this.searchIndex.has(word)) {
              this.searchIndex.set(word, new Set());
            }
            this.searchIndex.get(word)!.add(item.id);
          }
        });
      });
    });
  }

  // Initialize synonyms for better matching
  private initializeSynonyms(): void {
    this.synonyms.set('couch', ['sofa', 'settee']);
    this.synonyms.set('settee', ['sofa', 'couch']);
    this.synonyms.set('fridge', ['refrigerator', 'freezer']);
    this.synonyms.set('refrigerator', ['fridge', 'freezer']);
    this.synonyms.set('tv', ['television', 'screen']);
    this.synonyms.set('television', ['tv', 'screen']);
    this.synonyms.set('pc', ['computer', 'desktop']);
    this.synonyms.set('computer', ['pc', 'desktop']);
    this.synonyms.set('washer', ['washing machine', 'laundry']);
    this.synonyms.set('bed', ['mattress', 'bedroom']);
    this.synonyms.set('table', ['desk', 'surface']);
  }

  // Normalize search query
  private normalizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 1);
  }

  // Find exact matches
  private findExactMatches(
    searchTerms: string[],
    options: ItemSearchOptions
  ): ItemSuggestion[] {
    const matches = new Set<string>();

    searchTerms.forEach(term => {
      const itemIds = this.searchIndex.get(term);
      if (itemIds) {
        itemIds.forEach(id => matches.add(id));
      }

      // Check synonyms
      const synonymList = this.synonyms.get(term);
      if (synonymList) {
        synonymList.forEach(synonym => {
          const synonymIds = this.searchIndex.get(synonym);
          if (synonymIds) {
            synonymIds.forEach(id => matches.add(id));
          }
        });
      }
    });

    return this.items.filter(item => {
      if (!matches.has(item.id)) return false;
      if (options.category && item.category !== options.category) return false;
      return true;
    });
  }

  // Find partial matches
  private findPartialMatches(
    searchTerms: string[],
    options: ItemSearchOptions
  ): ItemSuggestion[] {
    const matches = new Set<string>();

    searchTerms.forEach(term => {
      this.searchIndex.forEach((itemIds, indexTerm) => {
        if (indexTerm.includes(term) || term.includes(indexTerm)) {
          itemIds.forEach(id => matches.add(id));
        }
      });
    });

    return this.items.filter(item => {
      if (!matches.has(item.id)) return false;
      if (options.category && item.category !== options.category) return false;
      return true;
    });
  }

  // Find fuzzy matches (Levenshtein distance)
  private findFuzzyMatches(
    searchTerms: string[],
    options: ItemSearchOptions
  ): ItemSuggestion[] {
    const matches = new Set<string>();

    searchTerms.forEach(term => {
      this.searchIndex.forEach((itemIds, indexTerm) => {
        if (this.levenshteinDistance(term, indexTerm) <= 2) {
          itemIds.forEach(id => matches.add(id));
        }
      });
    });

    return this.items.filter(item => {
      if (!matches.has(item.id)) return false;
      if (options.category && item.category !== options.category) return false;
      return true;
    });
  }

  // Sort results by relevance
  private sortByRelevance(items: ItemSuggestion[], query: string): ItemSuggestion[] {
    const queryLower = query.toLowerCase();

    return items.sort((a, b) => {
      // Exact name match gets highest priority
      const aExactMatch = a.name.toLowerCase() === queryLower ? 100 : 0;
      const bExactMatch = b.name.toLowerCase() === queryLower ? 100 : 0;

      // Name starts with query gets high priority
      const aStartsMatch = a.name.toLowerCase().startsWith(queryLower) ? 50 : 0;
      const bStartsMatch = b.name.toLowerCase().startsWith(queryLower) ? 50 : 0;

      // Popularity bonus
      const aPopularity = a.popularity / 100 * 10;
      const bPopularity = b.popularity / 100 * 10;

      // Calculate total score
      const aScore = aExactMatch + aStartsMatch + aPopularity;
      const bScore = bExactMatch + bStartsMatch + bPopularity;

      return bScore - aScore;
    });
  }

  // Levenshtein distance for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Get all categories
  getCategories(): string[] {
    const categories = new Set(this.items.map(item => item.category));
    return Array.from(categories).sort();
  }

  // Get item by ID
  getItemById(id: string): ItemSuggestion | undefined {
    return this.items.find(item => item.id === id);
  }

  // Add custom item
  addCustomItem(item: Omit<ItemSuggestion, 'id' | 'popularity'>): ItemSuggestion {
    const newItem: ItemSuggestion = {
      ...item,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      popularity: 1, // Low popularity for custom items
    };

    this.items.push(newItem);
    this.buildSearchIndex(); // Rebuild index
    
    return newItem;
  }

  // Get search suggestions (autocomplete)
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Add exact matches
    this.items.forEach(item => {
      if (item.name.toLowerCase().startsWith(queryLower)) {
        suggestions.add(item.name);
      }
      
      // Add keyword matches
      item.keywords.forEach(keyword => {
        if (keyword.toLowerCase().startsWith(queryLower)) {
          suggestions.add(keyword);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }
}

// Singleton instance
let itemAutocompleteInstance: ItemAutocomplete | null = null;

export function getItemAutocomplete(): ItemAutocomplete {
  if (!itemAutocompleteInstance) {
    itemAutocompleteInstance = new ItemAutocomplete();
  }
  return itemAutocompleteInstance;
}

// React hook for item autocomplete
export function useItemAutocomplete() {
  const autocomplete = getItemAutocomplete();

  return {
    searchItems: (query: string, options?: ItemSearchOptions) => 
      autocomplete.searchItems(query, options),
    getPopularItems: (limit?: number) => 
      autocomplete.getPopularItems(limit),
    getItemsByCategory: (category: string, limit?: number) => 
      autocomplete.getItemsByCategory(category, limit),
    getRelatedItems: (selectedIds: string[], limit?: number) => 
      autocomplete.getRelatedItems(selectedIds, limit),
    getSearchSuggestions: (query: string, limit?: number) => 
      autocomplete.getSearchSuggestions(query, limit),
    getCategories: () => 
      autocomplete.getCategories(),
    getItemById: (id: string) => 
      autocomplete.getItemById(id),
    addCustomItem: (item: Omit<ItemSuggestion, 'id' | 'popularity'>) => 
      autocomplete.addCustomItem(item),
  };
}

// Export types
export type { ItemSuggestion, ItemSearchOptions };
