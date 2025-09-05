import { CatalogItem } from '../types';

export class CSVLoader {
  private static instance: CSVLoader;
  private catalogData: CatalogItem[] | null = null;
  private compiledData: string | null = null;

  private constructor() {}

  public static getInstance(): CSVLoader {
    if (!CSVLoader.instance) {
      CSVLoader.instance = new CSVLoader();
    }
    return CSVLoader.instance;
  }

  public async loadCatalog(): Promise<CatalogItem[]> {
    if (this.catalogData) {
      return this.catalogData;
    }

    try {
      const response = await fetch('/api/pricing/catalog');
      if (!response.ok) {
        throw new Error(`Failed to load catalog: ${response.statusText}`);
      }

      this.catalogData = await response.json();
      return this.catalogData;
    } catch (error) {
      console.error('Error loading catalog:', error);
      throw error;
    }
  }

  public async getCompiledData(): Promise<string> {
    if (this.compiledData) {
      return this.compiledData;
    }

    try {
      const response = await fetch('/api/pricing/catalog/compiled');
      if (!response.ok) {
        throw new Error(
          `Failed to load compiled catalog: ${response.statusText}`
        );
      }

      this.compiledData = await response.text();
      return this.compiledData;
    } catch (error) {
      console.error('Error loading compiled catalog:', error);
      throw error;
    }
  }

  public getCatalogFromCompiled(compiledData: string): CatalogItem[] {
    try {
      return JSON.parse(compiledData);
    } catch (error) {
      console.error('Error parsing compiled catalog:', error);
      throw error;
    }
  }

  public clearCache(): void {
    this.catalogData = null;
    this.compiledData = null;
  }
}
