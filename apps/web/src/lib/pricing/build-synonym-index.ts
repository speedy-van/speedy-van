// src/lib/pricing/build-synonym-index.ts
// -----------------------------------------------------------------------------
// Builds synonym index for fast autocomplete and search functionality.
// Generates exact maps and synonym maps for efficient item lookup.
// -----------------------------------------------------------------------------

import { CatalogItem, SynonymIndex } from './types';
import { isValidCategory } from './category-registry';

export class SynonymIndexBuilder {
  private catalog: CatalogItem[];

  constructor(catalog: CatalogItem[]) {
    this.catalog = catalog;
  }

  public buildIndex(): SynonymIndex {
    const exactMap: Record<string, string> = {};
    const synonymsMap: Record<string, string[]> = {};

    // Build exact map for canonical names and IDs
    this.catalog.forEach(item => {
      exactMap[item.id] = item.id;
      exactMap[item.canonicalName.toLowerCase()] = item.id;
      
      // Add category-based exact matches
      exactMap[item.category] = item.id;
    });

    // Build synonyms map
    this.catalog.forEach(item => {
      const tokens = this.tokenize(item.canonicalName);
      
      // Add canonical name tokens
      tokens.forEach(token => {
        if (!synonymsMap[token]) {
          synonymsMap[token] = [];
        }
        if (!synonymsMap[token].includes(item.id)) {
          synonymsMap[token].push(item.id);
        }
      });

      // Add synonym tokens
      const synonyms = Array.isArray(item.synonyms) 
        ? item.synonyms 
        : typeof item.synonyms === 'string' 
          ? this.parseSynonyms(item.synonyms)
          : [];
      
      synonyms.forEach(synonym => {
        const synonymTokens = this.tokenize(synonym);
        synonymTokens.forEach(token => {
          if (!synonymsMap[token]) {
            synonymsMap[token] = [];
          }
          if (!synonymsMap[token].includes(item.id)) {
            synonymsMap[token].push(item.id);
          }
        });
      });

      // Add category tokens
      const categoryTokens = this.tokenize(item.category);
      categoryTokens.forEach(token => {
        if (!synonymsMap[token]) {
          synonymsMap[token] = [];
        }
        if (!synonymsMap[token].includes(item.id)) {
          synonymsMap[token].push(item.id);
        }
      });
    });

    // Add special mappings for common terms
    this.addSpecialMappings(exactMap, synonymsMap);

    return {
      exactMap,
      synonymsMap,
      tokenizationRules: {
        lowercasing: true,
        removeSymbols: true,
        unifyUKUS: true
      },
      metadata: {
        totalItems: this.catalog.length,
        totalSynonyms: Object.values(synonymsMap).reduce((total, synonyms) => total + synonyms.length, 0),
        buildTimestamp: Date.now()
      }
    };
  }

  private parseSynonyms(synonymsString: string): string[] {
    return synonymsString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove symbols
      .split(/\s+/)
      .filter(token => token.length > 0)
      .map(token => this.normalizeToken(token));
  }

  private normalizeToken(token: string): string {
    // UK/US spelling unification
    const ukUsMap: Record<string, string> = {
      'favourite': 'favorite',
      'colour': 'color',
      'centre': 'center',
      'metre': 'meter',
      'theatre': 'theater'
    };

    return ukUsMap[token] || token;
  }

  private addSpecialMappings(
    exactMap: Record<string, string>,
    synonymsMap: Record<string, string[]>
  ): void {
    // Size-based mappings for sofas
    const sofaSizeMap: Record<string, string[]> = {
      'small': ['sofa-2seat', 'loveseat'],
      'medium': ['sofa-3seat'],
      'large': ['sofa-4seat', 'sofa-5seat'],
      'corner': ['sofa-corner'],
      'l-shaped': ['sofa-corner'],
      'sectional': ['sofa-corner']
    };

    Object.entries(sofaSizeMap).forEach(([size, ids]) => {
      const key = `${size} sofa`;
      exactMap[key] = ids[0]; // Default to first option
      
      // Add to synonyms map
      if (!synonymsMap[size]) {
        synonymsMap[size] = [];
      }
      ids.forEach(id => {
        if (!synonymsMap[size].includes(id)) {
          synonymsMap[size].push(id);
        }
      });
    });

    // Box size mappings
    const boxSizeMap: Record<string, string[]> = {
      'small': ['box-small'],
      'medium': ['box-medium'],
      'large': ['box-large'],
      'book': ['box-book'],
      'plastic': ['plastic-crate'],
      'suitcase': ['suitcase-large'],
      'wardrobe': ['garment-box']
    };

    Object.entries(boxSizeMap).forEach(([size, ids]) => {
      const key = `${size} box`;
      exactMap[key] = ids[0];
      
      if (!synonymsMap[size]) {
        synonymsMap[size] = [];
      }
      ids.forEach(id => {
        if (!synonymsMap[size].includes(id)) {
          synonymsMap[size].push(id);
        }
      });
    });

    // Appliance mappings
    const applianceMap: Record<string, string[]> = {
      'fridge': ['fridge-standard', 'fridge-american'],
      'refrigerator': ['fridge-standard', 'fridge-american'],
      'freezer': ['freezer-chest', 'freezer-upright'],
      'washing machine': ['washing-machine'],
      'washer': ['washing-machine'],
      'dishwasher': ['dishwasher'],
      'oven': ['cooker', 'oven-single', 'oven-double'],
      'cooker': ['cooker', 'range-cooker']
    };

    Object.entries(applianceMap).forEach(([term, ids]) => {
      exactMap[term] = ids[0];
      
      if (!synonymsMap[term]) {
        synonymsMap[term] = [];
      }
      ids.forEach(id => {
        if (!synonymsMap[term].includes(id)) {
          synonymsMap[term].push(id);
        }
      });
    });

    // TV size mappings
    const tvSizeMap: Record<string, string[]> = {
      'small tv': ['tv-43-55'],
      'medium tv': ['tv-65'],
      'large tv': ['tv-75-plus'],
      'big tv': ['tv-75-plus'],
      'huge tv': ['tv-75-plus']
    };

    Object.entries(tvSizeMap).forEach(([term, ids]) => {
      exactMap[term] = ids[0];
    });
  }

  public validateCatalog(): string[] {
    const errors: string[] = [];

    this.catalog.forEach((item, index) => {
      // Check for duplicate IDs
      const duplicateIds = this.catalog.filter(i => i.id === item.id);
      if (duplicateIds.length > 1) {
        errors.push(`Duplicate ID found: ${item.id} at lines ${index + 1}`);
      }

      // Check for invalid categories
      if (!isValidCategory(item.category)) {
        errors.push(`Invalid category "${item.category}" for item ${item.id} at line ${index + 1}`);
      }

      // Check for empty synonyms
      const synonyms = Array.isArray(item.synonyms) 
        ? item.synonyms 
        : typeof item.synonyms === 'string' 
          ? this.parseSynonyms(item.synonyms)
          : [];
      
      if (!synonyms || synonyms.length === 0) {
        errors.push(`Empty synonyms for item ${item.id} at line ${index + 1}`);
      }

      // Check volume factor range
      if (item.volumeFactor < 0 || item.volumeFactor > 10) {
        errors.push(`Invalid volume factor ${item.volumeFactor} for item ${item.id} at line ${index + 1}`);
      }

      // Check boolean values
      if (typeof item.requiresTwoPerson !== 'boolean') {
        errors.push(`Invalid requiresTwoPerson value for item ${item.id} at line ${index + 1}`);
      }
      if (typeof item.isFragile !== 'boolean') {
        errors.push(`Invalid isFragile value for item ${item.id} at line ${index + 1}`);
      }
      if (typeof item.requiresDisassembly !== 'boolean') {
        errors.push(`Invalid requiresDisassembly value for item ${item.id} at line ${index + 1}`);
      }

      // Check base price hint
      if (typeof item.basePriceHint !== 'number' || item.basePriceHint < 0) {
        errors.push(`Invalid basePriceHint for item ${item.id} at line ${index + 1}`);
      }
    });

    return errors;
  }
}

// Convenience functions for external use
export function buildSynonymIndex(catalog: CatalogItem[]): SynonymIndex {
  const builder = new SynonymIndexBuilder(catalog);
  return builder.buildIndex();
}

export function validateSynonymIndex(catalog: CatalogItem[]): string[] {
  const builder = new SynonymIndexBuilder(catalog);
  return builder.validateCatalog();
}

export function searchSynonymIndex(index: SynonymIndex, query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check exact matches first
  if (index.exactMap[normalizedQuery]) {
    return [index.exactMap[normalizedQuery]];
  }
  
  // Check synonym matches
  const results: string[] = [];
  Object.entries(index.synonymsMap).forEach(([token, ids]) => {
    if (token.includes(normalizedQuery) || normalizedQuery.includes(token)) {
      ids.forEach(id => {
        if (!results.includes(id)) {
          results.push(id);
        }
      });
    }
  });
  
  return results;
}
