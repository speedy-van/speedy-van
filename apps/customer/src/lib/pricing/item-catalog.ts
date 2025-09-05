// Speedy Van - Item Catalog with UK Pricing
// This file contains all items with their images, prices, and categories

export interface CatalogItem {
  key: string;
  name: string;
  price: number; // Price in GBP
  category: string;
  image: string;
  description?: string;
  size: 'small' | 'medium' | 'large';
}

export const ITEM_CATEGORIES = [
  {
    id: 'furniture',
    name: 'Furniture',
    icon: '🪑',
    description: 'Sofas, beds, tables, chairs, and other furniture items',
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: '🔌',
    description: 'Kitchen and home appliances',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '💻',
    description: 'Computers, TVs, and electronic devices',
  },
  {
    id: 'boxes',
    name: 'Boxes & Containers',
    icon: '📦',
    description: 'Moving boxes and storage containers',
  },
];

export const ITEM_CATALOG: CatalogItem[] = [
  // ===== FURNITURE =====
  {
    key: 'armchair',
    name: 'Armchair',
    price: 15,
    category: 'furniture',
    image: '/items/furniture/armchair.png',
    description: 'Comfortable armchair',
    size: 'medium',
  },
  {
    key: 'bed',
    name: 'Bed (Double)',
    price: 30,
    category: 'furniture',
    image: '/items/furniture/bed.png',
    description: 'Double bed with frame',
    size: 'large',
  },
  {
    key: 'bed_frame',
    name: 'Bed Frame',
    price: 20,
    category: 'furniture',
    image: '/items/furniture/bed_frame.png',
    description: 'Bed frame only',
    size: 'medium',
  },
  {
    key: 'bookshelf',
    name: 'Bookshelf',
    price: 15,
    category: 'furniture',
    image: '/items/furniture/bookshelf.png',
    description: 'Standard bookshelf',
    size: 'medium',
  },
  {
    key: 'book_shelf',
    name: 'Book Shelf',
    price: 15,
    category: 'furniture',
    image: '/items/furniture/book_shelf.png',
    description: 'Book shelf unit',
    size: 'medium',
  },
  {
    key: 'chair',
    name: 'Chair',
    price: 8,
    category: 'furniture',
    image: '/items/furniture/chair.png',
    description: 'Single chair',
    size: 'small',
  },
  {
    key: 'chairs',
    name: 'Chairs (Set of 4)',
    price: 25,
    category: 'furniture',
    image: '/items/furniture/chairs.png',
    description: 'Set of 4 dining chairs',
    size: 'medium',
  },
  {
    key: 'coffee_table',
    name: 'Coffee Table',
    price: 12,
    category: 'furniture',
    image: '/items/furniture/coffee_table.png',
    description: 'Living room coffee table',
    size: 'medium',
  },
  {
    key: 'desk',
    name: 'Desk',
    price: 20,
    category: 'furniture',
    image: '/items/furniture/desk.png',
    description: 'Office or study desk',
    size: 'medium',
  },
  {
    key: 'dining_table',
    name: 'Dining Table',
    price: 30,
    category: 'furniture',
    image: '/items/furniture/dining_table.png',
    description: 'Dining table',
    size: 'large',
  },
  {
    key: 'filing_cabinet',
    name: 'Filing Cabinet',
    price: 18,
    category: 'furniture',
    image: '/items/furniture/filing_cabinet.png',
    description: 'Office filing cabinet',
    size: 'medium',
  },
  {
    key: 'garden_table',
    name: 'Garden Table',
    price: 22,
    category: 'furniture',
    image: '/items/furniture/garden_table.png',
    description: 'Outdoor garden table',
    size: 'medium',
  },
  {
    key: 'kitchen_cabinet',
    name: 'Kitchen Cabinet',
    price: 25,
    category: 'furniture',
    image: '/items/furniture/kitchen_cabinet.png',
    description: 'Kitchen cabinet unit',
    size: 'medium',
  },
  {
    key: 'lamp',
    name: 'Lamp',
    price: 8,
    category: 'furniture',
    image: '/items/furniture/lamp.png',
    description: 'Table or floor lamp',
    size: 'small',
  },
  {
    key: 'mattress',
    name: 'Mattress',
    price: 20,
    category: 'furniture',
    image: '/items/furniture/mattress.png',
    description: 'Bed mattress',
    size: 'medium',
  },
  {
    key: 'office_chair',
    name: 'Office Chair',
    price: 15,
    category: 'furniture',
    image: '/items/furniture/office_chair.png',
    description: 'Office chair',
    size: 'medium',
  },
  {
    key: 'office_desk',
    name: 'Office Desk',
    price: 25,
    category: 'furniture',
    image: '/items/furniture/office_desk.png',
    description: 'Office desk',
    size: 'medium',
  },
  {
    key: 'patio_chair',
    name: 'Patio Chair',
    price: 12,
    category: 'furniture',
    image: '/items/furniture/patio_chair.png',
    description: 'Outdoor patio chair',
    size: 'medium',
  },
  {
    key: 'sofa',
    name: 'Sofa',
    price: 35,
    category: 'furniture',
    image: '/items/furniture/sofa.png',
    description: '3-seater sofa',
    size: 'large',
  },
  {
    key: 'small_table',
    name: 'Small Table',
    price: 10,
    category: 'furniture',
    image: '/items/small_table.png',
    description: 'Small table',
    size: 'small',
  },
  {
    key: 'table',
    name: 'Table',
    price: 18,
    category: 'furniture',
    image: '/items/furniture/table.png',
    description: 'General purpose table',
    size: 'medium',
  },
  {
    key: 'wardrobe',
    name: 'Wardrobe',
    price: 40,
    category: 'furniture',
    image: '/items/furniture/wardrobe.png',
    description: 'Large wardrobe',
    size: 'large',
  },

  // ===== APPLIANCES =====
  {
    key: 'air_conditioner',
    name: 'Air Conditioner',
    price: 45,
    category: 'appliances',
    image: '/items/appliances/air_conditioner.png',
    description: 'Air conditioning unit',
    size: 'large',
  },
  {
    key: 'dishwasher',
    name: 'Dishwasher',
    price: 35,
    category: 'appliances',
    image: '/items/appliances/dishwasher.png',
    description: 'Dishwasher',
    size: 'large',
  },
  {
    key: 'dryer',
    name: 'Dryer',
    price: 30,
    category: 'appliances',
    image: '/items/appliances/dryer.png',
    description: 'Clothes dryer',
    size: 'large',
  },
  {
    key: 'fan',
    name: 'Fan',
    price: 8,
    category: 'appliances',
    image: '/items/appliances/fan.png',
    description: 'Electric fan',
    size: 'small',
  },
  {
    key: 'fridge_freezer',
    name: 'Fridge Freezer',
    price: 50,
    category: 'appliances',
    image: '/items/appliances/fridge_freezer.png',
    description: 'Refrigerator with freezer',
    size: 'large',
  },
  {
    key: 'kettle',
    name: 'Kettle',
    price: 5,
    category: 'appliances',
    image: '/items/appliances/kettle.png',
    description: 'Electric kettle',
    size: 'small',
  },
  {
    key: 'microwave',
    name: 'Microwave',
    price: 12,
    category: 'appliances',
    image: '/items/appliances/microwave.png',
    description: 'Microwave oven',
    size: 'small',
  },
  {
    key: 'mini_fridge',
    name: 'Mini Fridge',
    price: 25,
    category: 'appliances',
    image: '/items/appliances/mini_fridge.png',
    description: 'Small refrigerator',
    size: 'medium',
  },
  {
    key: 'oven',
    name: 'Oven',
    price: 40,
    category: 'appliances',
    image: '/items/appliances/oven.png',
    description: 'Kitchen oven',
    size: 'large',
  },
  {
    key: 'refrigerator',
    name: 'Refrigerator',
    price: 45,
    category: 'appliances',
    image: '/items/appliances/refrigerator.png',
    description: 'Standard refrigerator',
    size: 'large',
  },
  {
    key: 'stove',
    name: 'Stove',
    price: 35,
    category: 'appliances',
    image: '/items/appliances/stove.png',
    description: 'Kitchen stove',
    size: 'large',
  },
  {
    key: 'toaster',
    name: 'Toaster',
    price: 6,
    category: 'appliances',
    image: '/items/appliances/toaster.png',
    description: 'Toaster',
    size: 'small',
  },
  {
    key: 'vacuum_cleaner',
    name: 'Vacuum Cleaner',
    price: 15,
    category: 'appliances',
    image: '/items/appliances/vacuum_cleaner.png',
    description: 'Vacuum cleaner',
    size: 'medium',
  },
  {
    key: 'washer',
    name: 'Washing Machine',
    price: 40,
    category: 'appliances',
    image: '/items/appliances/washer.png',
    description: 'Washing machine',
    size: 'large',
  },

  // ===== ELECTRONICS =====
  {
    key: 'computer',
    name: 'Computer',
    price: 25,
    category: 'electronics',
    image: '/items/electronics/computer.png',
    description: 'Desktop computer',
    size: 'medium',
  },
  {
    key: 'computer_monitor',
    name: 'Computer Monitor',
    price: 15,
    category: 'electronics',
    image: '/items/electronics/computer_monitor.png',
    description: 'Computer monitor',
    size: 'medium',
  },
  {
    key: 'electronics',
    name: 'Electronics (General)',
    price: 20,
    category: 'electronics',
    image: '/items/electronics/electronics.png',
    description: 'General electronics item',
    size: 'medium',
  },
  {
    key: 'printer_scanner',
    name: 'Printer/Scanner',
    price: 18,
    category: 'electronics',
    image: '/items/electronics/printer_scanner.png',
    description: 'Printer and scanner combo',
    size: 'medium',
  },
  {
    key: 'television',
    name: 'Television',
    price: 30,
    category: 'electronics',
    image: '/items/electronics/television.png',
    description: 'TV set',
    size: 'large',
  },
  {
    key: 'tv',
    name: 'TV',
    price: 30,
    category: 'electronics',
    image: '/items/electronics/tv.png',
    description: 'Television',
    size: 'large',
  },

  // ===== BOXES & CONTAINERS =====
  {
    key: 'box',
    name: 'Box (Standard)',
    price: 5,
    category: 'boxes',
    image: '/items/boxes/box.png',
    description: 'Standard moving box',
    size: 'small',
  },
  {
    key: 'boxes',
    name: 'Boxes (Set of 5)',
    price: 20,
    category: 'boxes',
    image: '/items/boxes/boxes.png',
    description: 'Set of 5 medium boxes',
    size: 'medium',
  },
  {
    key: 'large_box',
    name: 'Large Box',
    price: 8,
    category: 'boxes',
    image: '/items/boxes/large-box.png',
    description: 'Large moving box',
    size: 'medium',
  },
  {
    key: 'medium_box',
    name: 'Medium Box',
    price: 6,
    category: 'boxes',
    image: '/items/boxes/medium-box.png',
    description: 'Medium moving box',
    size: 'small',
  },
  {
    key: 'plastic_bin',
    name: 'Plastic Bin',
    price: 6,
    category: 'boxes',
    image: '/items/boxes/plastic_bin.png',
    description: 'Plastic storage bin',
    size: 'small',
  },
  {
    key: 'small_box',
    name: 'Small Box',
    price: 4,
    category: 'boxes',
    image: '/items/boxes/small-box.png',
    description: 'Small moving box',
    size: 'small',
  },
  {
    key: 'wardrobe_box',
    name: 'Wardrobe Box',
    price: 10,
    category: 'boxes',
    image: '/items/boxes/wardrobe-box.png',
    description: 'Wardrobe moving box',
    size: 'medium',
  },
];

// Helper functions
export const getItemByKey = (key: string): CatalogItem | undefined => {
  return ITEM_CATALOG.find(item => item.key === key);
};

export const getItemsByCategory = (category: string): CatalogItem[] => {
  return ITEM_CATALOG.filter(item => item.category === category);
};

export const getCategoryById = (id: string) => {
  return ITEM_CATEGORIES.find(category => category.id === id);
};

export const getAllCategories = () => {
  return ITEM_CATEGORIES;
};

export const getItemPrice = (key: string): number => {
  console.log('Item catalog - looking up price for key:', key);
  const item = getItemByKey(key);
  console.log('Item catalog - found item:', item);
  const price = item ? item.price : 20; // Default fallback price
  console.log('Item catalog - returning price:', price);
  return price;
};

export const getItemSize = (key: string): 'small' | 'medium' | 'large' => {
  const item = getItemByKey(key);
  return item ? item.size : 'medium'; // Default fallback size
};
