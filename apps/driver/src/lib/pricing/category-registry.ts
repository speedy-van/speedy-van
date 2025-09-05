// src/lib/pricing/category-registry.ts
// -----------------------------------------------------------------------------
// Category registry for all item categories in the pricing system.
// Defines allowed categories with descriptions for filtering and UI display.
// -----------------------------------------------------------------------------

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export const CATEGORY_REGISTRY: Record<string, CategoryInfo> = {
  sofas: {
    id: 'sofas',
    name: 'Sofas & Seating',
    description: 'Living room sofas, armchairs, and seating furniture',
    icon: '🛋️',
    color: '#8B4513',
  },
  beds: {
    id: 'beds',
    name: 'Beds & Mattresses',
    description: 'Bed frames, mattresses, and bedroom furniture',
    icon: '🛏️',
    color: '#4B0082',
  },
  storage: {
    id: 'storage',
    name: 'Storage & Wardrobes',
    description: 'Wardrobes, drawers, shelves, and storage solutions',
    icon: '🗄️',
    color: '#2F4F4F',
  },
  tables: {
    id: 'tables',
    name: 'Tables & Desks',
    description: 'Dining tables, coffee tables, office desks, and chairs',
    icon: '🪑',
    color: '#8B7355',
  },
  appliances: {
    id: 'appliances',
    name: 'Kitchen & Home Appliances',
    description:
      'Refrigerators, washing machines, ovens, and household appliances',
    icon: '🔌',
    color: '#DC143C',
  },
  electronics: {
    id: 'electronics',
    name: 'Electronics & Technology',
    description: 'TVs, computers, audio equipment, and electronic devices',
    icon: '📱',
    color: '#1E90FF',
  },
  outdoor: {
    id: 'outdoor',
    name: 'Garden & Outdoor',
    description: 'Garden furniture, sheds, trampolines, and outdoor equipment',
    icon: '🌳',
    color: '#228B22',
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness & Exercise',
    description: 'Gym equipment, exercise machines, and fitness accessories',
    icon: '💪',
    color: '#FF4500',
  },
  office: {
    id: 'office',
    name: 'Office & Business',
    description: 'Office furniture, filing cabinets, and business equipment',
    icon: '💼',
    color: '#4169E1',
  },
  boxes: {
    id: 'boxes',
    name: 'Packing & Storage Boxes',
    description: 'Moving boxes, storage containers, and packing materials',
    icon: '📦',
    color: '#D2691E',
  },
  lighting: {
    id: 'lighting',
    name: 'Lighting & Lamps',
    description: 'Ceiling lights, table lamps, and lighting fixtures',
    icon: '💡',
    color: '#FFD700',
  },
  flooring: {
    id: 'flooring',
    name: 'Flooring & Carpets',
    description: 'Carpets, laminate flooring, tiles, and floor coverings',
    icon: '🏠',
    color: '#8B4513',
  },
  'soft-furnishing': {
    id: 'soft-furnishing',
    name: 'Soft Furnishings',
    description: 'Curtains, cushions, bedding, and fabric accessories',
    icon: '🪟',
    color: '#FF69B4',
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen & Dining',
    description: 'Kitchenware, utensils, and dining accessories',
    icon: '🍳',
    color: '#FF6347',
  },
  bathroom: {
    id: 'bathroom',
    name: 'Bathroom & Sanitary',
    description: 'Bathroom fixtures, cabinets, and sanitary ware',
    icon: '🚿',
    color: '#00CED1',
  },
  general: {
    id: 'general',
    name: 'General & Miscellaneous',
    description: 'Household items, tools, and miscellaneous goods',
    icon: '🏠',
    color: '#808080',
  },
};

export function isValidCategory(category: string): boolean {
  return category in CATEGORY_REGISTRY;
}

export function getCategoryInfo(category: string): CategoryInfo | undefined {
  return CATEGORY_REGISTRY[category];
}

export function getAllCategories(): CategoryInfo[] {
  return Object.values(CATEGORY_REGISTRY);
}

export function getCategoryNames(): string[] {
  return Object.keys(CATEGORY_REGISTRY);
}

// Category grouping for UI
export const CATEGORY_GROUPS = {
  Furniture: ['sofas', 'beds', 'storage', 'tables'],
  Appliances: ['appliances', 'electronics'],
  'Special Items': ['special', 'outdoor'],
  Packing: ['boxes'],
  'Home & Garden': [
    'lighting',
    'flooring',
    'soft-furnishing',
    'kitchen',
    'bathroom',
  ],
  Lifestyle: ['fitness', 'office', 'general'],
};

export function getCategoryGroup(categoryId: string): string | null {
  for (const [groupName, categories] of Object.entries(CATEGORY_GROUPS)) {
    if (categories.includes(categoryId)) {
      return groupName;
    }
  }
  return null;
}
