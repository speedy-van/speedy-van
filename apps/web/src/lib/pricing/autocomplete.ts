// src/lib/pricing/autocomplete.ts
// -----------------------------------------------------------------------------
// Provides real-time autocomplete suggestions for item input.
// Handles fuzzy matching, ranking, and context-aware suggestions.
// -----------------------------------------------------------------------------

import { CatalogItem, SynonymIndex } from './types';
import { getCategoryInfo } from './category-registry';
import { loadCatalogDataset, loadSynonymIndex } from './catalog-dataset';
import { getItemImage } from './image-mapping';

export interface AutocompleteSuggestion {
  id: string;
  canonicalName: string;
  category: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  volumeFactor: number;
  requiresTwoPerson: boolean;
  isFragile: boolean;
  requiresDisassembly: boolean;
  basePriceHint: number;
  relevance: number;
  matchType: 'exact' | 'synonym' | 'category' | 'fuzzy';
  image?: string;
}

export interface AutocompleteOptions {
  maxResults?: number;
  category?: string;
  includeBasePrice?: boolean;
  showCategoryInfo?: boolean;
  recentItems?: string[];
}

export class AutocompleteEngine {
  private catalog: CatalogItem[];
  private synonymIndex: SynonymIndex;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(catalog: CatalogItem[], synonymIndex: SynonymIndex) {
    this.catalog = catalog;
    this.synonymIndex = synonymIndex;
  }

  public async search(
    query: string,
    options: AutocompleteOptions = {}
  ): Promise<AutocompleteSuggestion[]> {
    const {
      maxResults = 10,
      category,
      includeBasePrice = false,
      showCategoryInfo = true,
    } = options;

    if (!query || query.trim().length < 2) {
      return this.getPopularSuggestions(maxResults, category);
    }

    const normalizedQuery = query.trim().toLowerCase();
    const suggestions = new Map<string, AutocompleteSuggestion>();

    // 1. Exact matches (highest priority)
    const exactMatches = this.findExactMatches(normalizedQuery);
    exactMatches.forEach(item => {
      suggestions.set(item.id, this.createSuggestion(item, 1.0, 'exact'));
    });

    // 2. Synonym matches (high priority)
    const synonymMatches = this.findSynonymMatches(normalizedQuery);
    synonymMatches.forEach(item => {
      if (!suggestions.has(item.id)) {
        suggestions.set(item.id, this.createSuggestion(item, 0.9, 'synonym'));
      }
    });

    // 3. Category matches (medium priority)
    const categoryMatches = this.findCategoryMatches(normalizedQuery);
    categoryMatches.forEach(item => {
      if (!suggestions.has(item.id)) {
        suggestions.set(item.id, this.createSuggestion(item, 0.7, 'category'));
      }
    });

    // 4. Fuzzy matches (lower priority)
    const fuzzyMatches = this.findFuzzyMatches(normalizedQuery);
    fuzzyMatches.forEach(item => {
      if (!suggestions.has(item.id)) {
        suggestions.set(item.id, this.createSuggestion(item, 0.5, 'fuzzy'));
      }
    });

    // Filter by category if specified
    let filteredSuggestions = Array.from(suggestions.values());
    if (category) {
      filteredSuggestions = filteredSuggestions.filter(
        s => s.category === category
      );
    }

    // Sort by relevance and return top results
    return filteredSuggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults)
      .map(suggestion => {
        // Always include basePriceHint for pricing display
        if (!showCategoryInfo) {
          delete suggestion.categoryName;
          delete suggestion.categoryIcon;
          delete suggestion.categoryColor;
        }
        return suggestion;
      });
  }

  public debouncedSearch(
    query: string,
    options: AutocompleteOptions = {},
    delay: number = 300
  ): Promise<AutocompleteSuggestion[]> {
    return new Promise(resolve => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        const results = await this.search(query, options);
        resolve(results);
      }, delay);
    });
  }

  private findExactMatches(query: string): CatalogItem[] {
    const matches: CatalogItem[] = [];

    // Check exact map
    if (this.synonymIndex.exactMap[query]) {
      const item = this.catalog.find(
        i => i.id === this.synonymIndex.exactMap[query]
      );
      if (item) matches.push(item);
    }

    // Check canonical names
    this.catalog.forEach(item => {
      if (item.canonicalName.toLowerCase() === query) {
        matches.push(item);
      }
    });

    return matches;
  }

  private findSynonymMatches(query: string): CatalogItem[] {
    const matches: CatalogItem[] = [];
    const tokens = query.split(/\s+/);

    tokens.forEach(token => {
      if (this.synonymIndex.synonymsMap[token]) {
        this.synonymIndex.synonymsMap[token].forEach(id => {
          const item = this.catalog.find(i => i.id === id);
          if (item && !matches.find(m => m.id === item.id)) {
            matches.push(item);
          }
        });
      }
    });

    return matches;
  }

  private findCategoryMatches(query: string): CatalogItem[] {
    const matches: CatalogItem[] = [];

    this.catalog.forEach(item => {
      if (item.category.toLowerCase().includes(query)) {
        matches.push(item);
      }
    });

    return matches;
  }

  private findFuzzyMatches(query: string): CatalogItem[] {
    const matches: CatalogItem[] = [];
    const queryTokens = query.split(/\s+/);

    this.catalog.forEach(item => {
      const synonyms = Array.isArray(item.synonyms)
        ? item.synonyms.join(' ')
        : typeof item.synonyms === 'string'
          ? item.synonyms
          : '';

      const itemText = `${item.canonicalName} ${synonyms}`.toLowerCase();
      const itemTokens = itemText.split(/\s+/);

      // Calculate token overlap
      const overlap = queryTokens.filter(token =>
        itemTokens.some(
          itemToken => itemToken.includes(token) || token.includes(itemToken)
        )
      ).length;

      if (overlap > 0) {
        matches.push(item);
      }
    });

    return matches;
  }

  private getPopularSuggestions(
    maxResults: number,
    category?: string
  ): AutocompleteSuggestion[] {
    let items = this.catalog;

    if (category) {
      items = items.filter(item => item.category === category);
    }

    // Return popular items (you can implement popularity logic here)
    return items
      .slice(0, maxResults)
      .map(item => this.createSuggestion(item, 0.3, 'fuzzy'));
  }

  private createSuggestion(
    item: CatalogItem,
    relevance: number,
    matchType: AutocompleteSuggestion['matchType']
  ): AutocompleteSuggestion {
    const categoryInfo = getCategoryInfo(item.category);

    return {
      id: item.id,
      canonicalName: item.canonicalName,
      category: item.category,
      categoryName: categoryInfo?.name || item.category,
      categoryIcon: categoryInfo?.icon || '🏠',
      categoryColor: categoryInfo?.color || '#808080',
      volumeFactor: item.volumeFactor,
      requiresTwoPerson: item.requiresTwoPerson,
      isFragile: item.isFragile,
      requiresDisassembly: item.requiresDisassembly,
      basePriceHint: item.basePriceHint,
      relevance,
      matchType,
      image: getItemImage(item.id, item.canonicalName, item.category),
    };
  }

  public getQuickSuggestions(category?: string): AutocompleteSuggestion[] {
    const items = category
      ? this.catalog.filter(item => item.category === category)
      : this.catalog;

    // Return a curated list of popular items that exist in the catalog
    const popularItemIds = [
      'sofa-3seat',
      'bed-double',
      'wardrobe-2door',
      'table-dining-4',
      'fridge-standard',
    ];
    const popularItems = items.filter(item => popularItemIds.includes(item.id));

    // If no popular items found, return first few items from catalog
    if (popularItems.length === 0) {
      return items
        .slice(0, 5)
        .map(item => this.createSuggestion(item, 0.8, 'category'));
    }

    return popularItems.map(item =>
      this.createSuggestion(item, 0.8, 'category')
    );
  }

  public getCategorySuggestions(category: string): AutocompleteSuggestion[] {
    const items = this.catalog.filter(item => item.category === category);

    return items
      .slice(0, 8) // Show top 8 items from category
      .map(item => this.createSuggestion(item, 0.6, 'category'));
  }

  public clearDebounceTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

// Convenience functions for external use
export async function getAutocompleteSuggestions(
  query: string,
  options: AutocompleteOptions = {}
): Promise<AutocompleteSuggestion[]> {
  try {
    // Load catalog data
    const catalog = await loadCatalogDataset();
    const synonymIndex = await loadSynonymIndex();

    if (!catalog || !synonymIndex) {
      console.warn('Catalog or synonym index not available');
      return [];
    }

    // Create autocomplete instance
    const autocomplete = new AutocompleteEngine(catalog, synonymIndex);

    // Get suggestions
    const suggestions = await autocomplete.search(query, options);

    return suggestions;
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    return [];
  }
}

export async function getPopularSuggestions(
  maxResults: number = 10
): Promise<AutocompleteSuggestion[]> {
  try {
    // Load catalog data
    const catalog = await loadCatalogDataset();
    const synonymIndex = await loadSynonymIndex();

    if (!catalog || !synonymIndex) {
      console.warn('Catalog or synonym index not available');
      return [];
    }

    // Create autocomplete instance
    const autocomplete = new AutocompleteEngine(catalog, synonymIndex);

    // Get popular suggestions
    const suggestions = autocomplete.getQuickSuggestions();

    return suggestions.slice(0, maxResults);
  } catch (error) {
    console.error('Error getting popular suggestions:', error);
    return [];
  }
}

import {
  getCategoryImage,
  getCategoryDisplayName,
  CATEGORY_GROUPS,
} from './category-images';

export async function getQuickCategories(): Promise<
  Array<{
    name: string;
    icon: string;
    count: number;
    image: string;
    displayName: string;
    group: string;
  }>
> {
  try {
    // Load catalog data to get actual counts
    const catalog = await loadCatalogDataset();

    if (!catalog) {
      // Fallback to static data with more categories
      return [
        {
          name: 'sofas',
          icon: '🛋️',
          count: 5,
          image: getCategoryImage('sofas'),
          displayName: getCategoryDisplayName('sofas'),
          group: 'furniture',
        },
        {
          name: 'beds',
          icon: '🛏️',
          count: 3,
          image: getCategoryImage('beds'),
          displayName: getCategoryDisplayName('beds'),
          group: 'furniture',
        },
        {
          name: 'tables',
          icon: '🪑',
          count: 2,
          image: getCategoryImage('tables'),
          displayName: getCategoryDisplayName('tables'),
          group: 'furniture',
        },
        {
          name: 'wardrobe',
          icon: '🗄️',
          count: 2,
          image: getCategoryImage('wardrobe'),
          displayName: getCategoryDisplayName('wardrobe'),
          group: 'storage',
        },
        {
          name: 'appliances',
          icon: '🔌',
          count: 5,
          image: getCategoryImage('appliances'),
          displayName: getCategoryDisplayName('appliances'),
          group: 'appliances',
        },
        {
          name: 'electronics',
          icon: '📺',
          count: 2,
          image: getCategoryImage('electronics'),
          displayName: getCategoryDisplayName('electronics'),
          group: 'electronics',
        },
        {
          name: 'boxes',
          icon: '📦',
          count: 4,
          image: getCategoryImage('boxes'),
          displayName: getCategoryDisplayName('boxes'),
          group: 'boxes',
        },
        {
          name: 'outdoor',
          icon: '🌳',
          count: 3,
          image: getCategoryImage('outdoor'),
          displayName: getCategoryDisplayName('outdoor'),
          group: 'outdoor',
        },
      ];
    }

    // Calculate actual counts from catalog
    const categoryCounts = new Map<string, number>();
    catalog.forEach(item => {
      const count = categoryCounts.get(item.category) || 0;
      categoryCounts.set(item.category, count + 1);
    });

    // Create comprehensive category list
    const allCategories = [
      // Furniture
      {
        name: 'sofas',
        icon: '🛋️',
        count: categoryCounts.get('sofas') || 5,
        image: getCategoryImage('sofas'),
        displayName: getCategoryDisplayName('sofas'),
        group: 'furniture',
      },
      {
        name: 'chairs',
        icon: '🪑',
        count: categoryCounts.get('chairs') || 3,
        image: getCategoryImage('chairs'),
        displayName: getCategoryDisplayName('chairs'),
        group: 'furniture',
      },
      {
        name: 'beds',
        icon: '🛏️',
        count: categoryCounts.get('beds') || 3,
        image: getCategoryImage('beds'),
        displayName: getCategoryDisplayName('beds'),
        group: 'furniture',
      },
      {
        name: 'tables',
        icon: '🪑',
        count: categoryCounts.get('tables') || 2,
        image: getCategoryImage('tables'),
        displayName: getCategoryDisplayName('tables'),
        group: 'furniture',
      },

      // Storage
      {
        name: 'wardrobe',
        icon: '🗄️',
        count: categoryCounts.get('storage') || 2,
        image: getCategoryImage('wardrobe'),
        displayName: getCategoryDisplayName('wardrobe'),
        group: 'storage',
      },
      {
        name: 'bookshelf',
        icon: '📚',
        count: categoryCounts.get('bookshelf') || 1,
        image: getCategoryImage('bookshelf'),
        displayName: getCategoryDisplayName('bookshelf'),
        group: 'storage',
      },

      // Appliances
      {
        name: 'appliances',
        icon: '🔌',
        count: categoryCounts.get('appliances') || 5,
        image: getCategoryImage('appliances'),
        displayName: getCategoryDisplayName('appliances'),
        group: 'appliances',
      },
      {
        name: 'fridge_freezer',
        icon: '❄️',
        count: categoryCounts.get('fridge_freezer') || 2,
        image: getCategoryImage('fridge_freezer'),
        displayName: getCategoryDisplayName('fridge_freezer'),
        group: 'appliances',
      },
      {
        name: 'washing_machine',
        icon: '🧺',
        count: categoryCounts.get('washing_machine') || 1,
        image: getCategoryImage('washing_machine'),
        displayName: getCategoryDisplayName('washing_machine'),
        group: 'appliances',
      },

      // Electronics
      {
        name: 'electronics',
        icon: '📺',
        count: categoryCounts.get('electronics') || 2,
        image: getCategoryImage('electronics'),
        displayName: getCategoryDisplayName('electronics'),
        group: 'electronics',
      },
      {
        name: 'tv',
        icon: '📺',
        count: categoryCounts.get('tv') || 1,
        image: getCategoryImage('tv'),
        displayName: getCategoryDisplayName('tv'),
        group: 'electronics',
      },
      {
        name: 'computer',
        icon: '💻',
        count: categoryCounts.get('computer') || 1,
        image: getCategoryImage('computer'),
        displayName: getCategoryDisplayName('computer'),
        group: 'electronics',
      },

      // Boxes
      {
        name: 'boxes',
        icon: '📦',
        count: categoryCounts.get('boxes') || 4,
        image: getCategoryImage('boxes'),
        displayName: getCategoryDisplayName('boxes'),
        group: 'boxes',
      },

      // Outdoor
      {
        name: 'outdoor',
        icon: '🌳',
        count: categoryCounts.get('outdoor') || 3,
        image: getCategoryImage('outdoor'),
        displayName: getCategoryDisplayName('outdoor'),
        group: 'outdoor',
      },

      // Sports
      {
        name: 'sports',
        icon: '⚽',
        count: categoryCounts.get('sports') || 2,
        image: getCategoryImage('sports'),
        displayName: getCategoryDisplayName('sports'),
        group: 'sports',
      },

      // Decorative
      {
        name: 'lamp',
        icon: '💡',
        count: categoryCounts.get('lamp') || 1,
        image: getCategoryImage('lamp'),
        displayName: getCategoryDisplayName('lamp'),
        group: 'decorative',
      },
    ];

    return allCategories;
  } catch (error) {
    console.error('Error getting quick categories:', error);
    // Fallback to static data
    return [
      {
        name: 'sofas',
        icon: '🛋️',
        count: 5,
        image: getCategoryImage('sofas'),
        displayName: getCategoryDisplayName('sofas'),
        group: 'furniture',
      },
      {
        name: 'beds',
        icon: '🛏️',
        count: 3,
        image: getCategoryImage('beds'),
        displayName: getCategoryDisplayName('beds'),
        group: 'furniture',
      },
      {
        name: 'tables',
        icon: '🪑',
        count: 2,
        image: getCategoryImage('tables'),
        displayName: getCategoryDisplayName('tables'),
        group: 'furniture',
      },
      {
        name: 'wardrobe',
        icon: '🗄️',
        count: 2,
        image: getCategoryImage('wardrobe'),
        displayName: getCategoryDisplayName('wardrobe'),
        group: 'storage',
      },
      {
        name: 'appliances',
        icon: '🔌',
        count: 5,
        image: getCategoryImage('appliances'),
        displayName: getCategoryDisplayName('appliances'),
        group: 'appliances',
      },
      {
        name: 'electronics',
        icon: '📺',
        count: 2,
        image: getCategoryImage('electronics'),
        displayName: getCategoryDisplayName('electronics'),
        group: 'electronics',
      },
      {
        name: 'boxes',
        icon: '📦',
        count: 4,
        image: getCategoryImage('boxes'),
        displayName: getCategoryDisplayName('boxes'),
        group: 'boxes',
      },
      {
        name: 'outdoor',
        icon: '🌳',
        count: 3,
        image: getCategoryImage('outdoor'),
        displayName: getCategoryDisplayName('outdoor'),
        group: 'outdoor',
      },
    ];
  }
}
