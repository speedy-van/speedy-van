// src/lib/pricing/normalizer.ts
// -----------------------------------------------------------------------------
// Converts free text input to standardized catalog items.
// Handles synonyms, size qualifiers, and provides disambiguation options.
// -----------------------------------------------------------------------------

import { CatalogItem, NormalizedItem } from './types';
import { SynonymIndex } from './types';

export interface NormalizationResult {
  success: boolean;
  items: NormalizedItem[];
  unrecognized: string[];
  suggestions: string[];
}

export class ItemNormalizer {
  private catalog: CatalogItem[];
  private synonymIndex: SynonymIndex;

  constructor(catalog: CatalogItem[], synonymIndex: SynonymIndex) {
    this.catalog = catalog;
    this.synonymIndex = synonymIndex;
  }

  public normalizeInput(input: string | string[]): NormalizationResult {
    if (typeof input === 'string') {
      return this.normalizeSingleInput(input);
    } else {
      return this.normalizeMultipleInputs(input);
    }
  }

  private normalizeSingleInput(input: string): NormalizationResult {
    const normalizedInput = input.trim().toLowerCase();
    
    // Try exact match first
    const exactMatch = this.synonymIndex.exactMap[normalizedInput];
    if (exactMatch) {
      const item = this.catalog.find(i => i.id === exactMatch);
      if (item) {
        return {
          success: true,
          items: [this.createNormalizedItem(item, 1)],
          unrecognized: [],
          suggestions: []
        };
      }
    }

    // Try synonym match
    const synonymMatches = this.findSynonymMatches(normalizedInput);
    if (synonymMatches.length > 0) {
      const items = synonymMatches.slice(0, 3).map(id => {
        const item = this.catalog.find(i => i.id === id);
        return this.createNormalizedItem(item!, 1);
      });
      
      return {
        success: true,
        items,
        unrecognized: [],
        suggestions: this.getSuggestions(synonymMatches.slice(0, 3))
      };
    }

    // Try special conversions
    const convertedItems = this.trySpecialConversions(normalizedInput);
    if (convertedItems.length > 0) {
      return {
        success: true,
        items: convertedItems,
        unrecognized: [],
        suggestions: []
      };
    }

    // If all else fails, return suggestions
    const suggestions = this.findClosestMatches(normalizedInput);
    return {
      success: false,
      items: [],
      unrecognized: [normalizedInput],
      suggestions: suggestions.slice(0, 3)
    };
  }

  private normalizeMultipleInputs(inputs: string[]): NormalizationResult {
    const results: NormalizedItem[] = [];
    const unrecognized: string[] = [];
    const allSuggestions: string[] = [];

    inputs.forEach(input => {
      const result = this.normalizeSingleInput(input);
      if (result.success) {
        results.push(...result.items);
        allSuggestions.push(...result.suggestions);
      } else {
        unrecognized.push(...result.unrecognized);
        allSuggestions.push(...result.suggestions);
      }
    });

    return {
      success: results.length > 0,
      items: results,
      unrecognized,
      suggestions: [...new Set(allSuggestions)]
    };
  }

  private findSynonymMatches(input: string): string[] {
    const tokens = input.split(/\s+/);
    const matches = new Map<string, number>();

    tokens.forEach(token => {
      if (this.synonymIndex.synonymsMap[token]) {
        this.synonymIndex.synonymsMap[token].forEach(id => {
          const currentScore = matches.get(id) || 0;
          matches.set(id, currentScore + 1);
        });
      }
    });

    // Sort by relevance score
    return Array.from(matches.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([id]) => id);
  }

  private trySpecialConversions(input: string): NormalizedItem[] {
    const items: NormalizedItem[] = [];

    // Sofa size conversions
    if (input.includes('sofa')) {
      if (input.includes('small')) {
        items.push(...this.findItemsByPattern(['sofa-2seat', 'loveseat']));
      } else if (input.includes('medium')) {
        items.push(...this.findItemsByPattern(['sofa-3seat']));
      } else if (input.includes('large')) {
        items.push(...this.findItemsByPattern(['sofa-4seat', 'sofa-5seat']));
      } else if (input.includes('corner') || input.includes('l-shaped') || input.includes('sectional')) {
        items.push(...this.findItemsByPattern(['sofa-corner']));
      }
    }

    // Box size conversions
    if (input.includes('box')) {
      if (input.includes('small')) {
        items.push(...this.findItemsByPattern(['box-small']));
      } else if (input.includes('medium')) {
        items.push(...this.findItemsByPattern(['box-medium']));
      } else if (input.includes('large')) {
        items.push(...this.findItemsByPattern(['box-large']));
      } else if (input.includes('book')) {
        items.push(...this.findItemsByPattern(['box-book']));
      } else if (input.includes('plastic')) {
        items.push(...this.findItemsByPattern(['plastic-crate']));
      }
    }

    // Appliance conversions
    if (input.includes('fridge') || input.includes('refrigerator')) {
      items.push(...this.findItemsByPattern(['fridge-standard', 'fridge-american']));
    } else if (input.includes('freezer')) {
      items.push(...this.findItemsByPattern(['freezer-chest', 'freezer-upright']));
    } else if (input.includes('washing') || input.includes('washer')) {
      items.push(...this.findItemsByPattern(['washing-machine']));
    } else if (input.includes('dishwasher')) {
      items.push(...this.findItemsByPattern(['dishwasher']));
    } else if (input.includes('oven') || input.includes('cooker')) {
      items.push(...this.findItemsByPattern(['cooker', 'oven-single', 'oven-double']));
    }

    // TV size conversions
    if (input.includes('tv') || input.includes('television')) {
      if (input.includes('small')) {
        items.push(...this.findItemsByPattern(['tv-43-55']));
      } else if (input.includes('medium')) {
        items.push(...this.findItemsByPattern(['tv-65']));
      } else if (input.includes('large') || input.includes('big') || input.includes('huge')) {
        items.push(...this.findItemsByPattern(['tv-75-plus']));
      }
    }

    return items;
  }

  private findItemsByPattern(patterns: string[]): NormalizedItem[] {
    const items: NormalizedItem[] = [];
    
    patterns.forEach(pattern => {
      const item = this.catalog.find(i => i.id === pattern);
      if (item) {
        items.push(this.createNormalizedItem(item, 1));
      }
    });

    return items;
  }

  private findClosestMatches(input: string): string[] {
    const tokens = input.split(/\s+/);
    const suggestions = new Set<string>();

    // Find items that contain any of the input tokens
    this.catalog.forEach(item => {
      const synonyms = Array.isArray(item.synonyms) 
        ? item.synonyms.join(' ')
        : typeof item.synonyms === 'string' 
          ? item.synonyms
          : '';
      
      const itemText = `${item.canonicalName} ${synonyms} ${item.category}`.toLowerCase();
      const hasToken = tokens.some(token => itemText.includes(token));
      
      if (hasToken) {
        suggestions.add(item.canonicalName);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  private getSuggestions(itemIds: string[]): string[] {
    return itemIds.map(id => {
      const item = this.catalog.find(i => i.id === id);
      return item ? item.canonicalName : id;
    });
  }

  private createNormalizedItem(item: CatalogItem, quantity: number): NormalizedItem {
    return {
      id: item.id,
      canonicalName: item.canonicalName,
      quantity,
      volumeFactor: item.volumeFactor,
      requiresTwoPerson: item.requiresTwoPerson,
      isFragile: item.isFragile,
      requiresDisassembly: item.requiresDisassembly,
      basePriceHint: item.basePriceHint
    };
  }

  public validateItems(items: NormalizedItem[]): string[] {
    const errors: string[] = [];

    items.forEach(item => {
      const catalogItem = this.catalog.find(i => i.id === item.id);
      if (!catalogItem) {
        errors.push(`Item not found in catalog: ${item.id}`);
        return;
      }

      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for item ${item.id}: ${item.quantity}`);
      }

      if (item.volumeFactor !== catalogItem.volumeFactor) {
        errors.push(`Volume factor mismatch for item ${item.id}: expected ${catalogItem.volumeFactor}, got ${item.volumeFactor}`);
      }
    });

    return errors;
  }
}

// Convenience function for external use
export async function smartNormalize(
  input: string | string[],
  catalog?: CatalogItem[],
  synonymIndex?: SynonymIndex
): Promise<NormalizedItem[]> {
  // Load catalog and synonym index if not provided
  if (!catalog || !synonymIndex) {
    const { loadCatalogDataset, loadSynonymIndex } = await import('./catalog-dataset');
    catalog = catalog || await loadCatalogDataset();
    synonymIndex = synonymIndex || await loadSynonymIndex();
  }

  const normalizer = new ItemNormalizer(catalog, synonymIndex);
  const result = normalizer.normalizeInput(input);
  
  return result.items;
}
