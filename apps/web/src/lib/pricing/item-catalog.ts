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
    description: 'Sofas, beds, tables, chairs, and other furniture items'
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: '🔌',
    description: 'Kitchen and home appliances'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '💻',
    description: 'Computers, TVs, and electronic devices'
  },
  {
    id: 'outdoor',
    name: 'Outdoor & Garden',
    icon: '🌿',
    description: 'Garden furniture and outdoor items'
  },
  {
    id: 'sports',
    name: 'Sports & Music',
    icon: '🎵',
    description: 'Sports equipment and musical instruments'
  },
  {
    id: 'boxes',
    name: 'Boxes & Containers',
    icon: '📦',
    description: 'Moving boxes and storage containers'
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: '📋',
    description: 'Other items and custom objects'
  }
];

export const ITEM_CATALOG: CatalogItem[] = [
  // ===== FURNITURE =====
  {
    key: 'armchair',
    name: 'Armchair',
    price: 15,
    category: 'furniture',
    image: '/items/armchair.png',
    description: 'Comfortable armchair',
    size: 'medium'
  },
  {
    key: 'bed',
    name: 'Bed (Double)',
    price: 30,
    category: 'furniture',
    image: '/items/bed.png',
    description: 'Double bed with frame',
    size: 'large'
  },
  {
    key: 'bed_frame',
    name: 'Bed Frame',
    price: 20,
    category: 'furniture',
    image: '/items/bed_frame.png',
    description: 'Bed frame only',
    size: 'medium'
  },
  {
    key: 'bookshelf',
    name: 'Bookshelf',
    price: 15,
    category: 'furniture',
    image: '/items/bookshelf.png',
    description: 'Standard bookshelf',
    size: 'medium'
  },
  {
    key: 'book_shelf',
    name: 'Book Shelf',
    price: 15,
    category: 'furniture',
    image: '/items/book_shelf.png',
    description: 'Book shelf unit',
    size: 'medium'
  },
  {
    key: 'chair',
    name: 'Chair',
    price: 8,
    category: 'furniture',
    image: '/items/chair.png',
    description: 'Single chair',
    size: 'small'
  },
  {
    key: 'chairs',
    name: 'Chairs (Set of 4)',
    price: 25,
    category: 'furniture',
    image: '/items/chairs.png',
    description: 'Set of 4 dining chairs',
    size: 'medium'
  },
  {
    key: 'coffee_table',
    name: 'Coffee Table',
    price: 12,
    category: 'furniture',
    image: '/items/coffee_table.png',
    description: 'Living room coffee table',
    size: 'medium'
  },
  {
    key: 'desk',
    name: 'Desk',
    price: 20,
    category: 'furniture',
    image: '/items/desk.png',
    description: 'Office or study desk',
    size: 'medium'
  },
  {
    key: 'dining_table',
    name: 'Dining Table',
    price: 30,
    category: 'furniture',
    image: '/items/dining_table.png',
    description: 'Dining table',
    size: 'large'
  },
  {
    key: 'filing_cabinet',
    name: 'Filing Cabinet',
    price: 18,
    category: 'furniture',
    image: '/items/filing_cabinet.png',
    description: 'Office filing cabinet',
    size: 'medium'
  },
  {
    key: 'furniture',
    name: 'Furniture (Medium)',
    price: 20,
    category: 'furniture',
    image: '/items/furniture.png',
    description: 'Medium furniture item',
    size: 'medium'
  },
  {
    key: 'kitchen_cabinet',
    name: 'Kitchen Cabinet',
    price: 25,
    category: 'furniture',
    image: '/items/kitchen_cabinet.png',
    description: 'Kitchen cabinet unit',
    size: 'medium'
  },
  {
    key: 'lamp',
    name: 'Lamp',
    price: 8,
    category: 'furniture',
    image: '/items/lamp.png',
    description: 'Table or floor lamp',
    size: 'small'
  },
  {
    key: 'living_room_set',
    name: 'Living Room Set',
    price: 60,
    category: 'furniture',
    image: '/items/living_room_set.png',
    description: 'Sofa + chairs set',
    size: 'large'
  },
  {
    key: 'mattress',
    name: 'Mattress',
    price: 20,
    category: 'furniture',
    image: '/items/mattress.png',
    description: 'Bed mattress',
    size: 'medium'
  },
  {
    key: 'mirror',
    name: 'Mirror',
    price: 10,
    category: 'furniture',
    image: '/items/mirror.png',
    description: 'Wall or floor mirror',
    size: 'small'
  },
  {
    key: 'office_chair',
    name: 'Office Chair',
    price: 12,
    category: 'furniture',
    image: '/items/office_chair.png',
    description: 'Office chair',
    size: 'small'
  },
  {
    key: 'office_desk',
    name: 'Office Desk',
    price: 25,
    category: 'furniture',
    image: '/items/office_desk.png',
    description: 'Office desk',
    size: 'medium'
  },
  {
    key: 'painting_frame',
    name: 'Painting Frame',
    price: 8,
    category: 'furniture',
    image: '/items/painting_frame.png',
    description: 'Framed painting or artwork',
    size: 'small'
  },
  {
    key: 'patio_chair',
    name: 'Patio Chair',
    price: 10,
    category: 'furniture',
    image: '/items/patio_chair.png',
    description: 'Outdoor patio chair',
    size: 'small'
  },
  {
    key: 'sofa',
    name: 'Sofa',
    price: 35,
    category: 'furniture',
    image: '/items/sofa.png',
    description: 'Living room sofa',
    size: 'large'
  },
  {
    key: 'table',
    name: 'Table (Medium)',
    price: 20,
    category: 'furniture',
    image: '/items/table.png',
    description: 'Medium table',
    size: 'medium'
  },

  // ===== APPLIANCES =====
  {
    key: 'air_conditioner',
    name: 'Air Conditioner',
    price: 20,
    category: 'appliances',
    image: '/items/air_conditioner.png',
    description: 'Air conditioning unit',
    size: 'medium'
  },
  {
    key: 'dishwasher',
    name: 'Dishwasher',
    price: 25,
    category: 'appliances',
    image: '/items/dishwasher.png',
    description: 'Kitchen dishwasher',
    size: 'medium'
  },
  {
    key: 'dryer',
    name: 'Dryer',
    price: 25,
    category: 'appliances',
    image: '/items/dryer.png',
    description: 'Clothes dryer',
    size: 'medium'
  },
  {
    key: 'fridge_freezer',
    name: 'Fridge Freezer',
    price: 40,
    category: 'appliances',
    image: '/items/fridge_freezer.png',
    description: 'Refrigerator with freezer',
    size: 'large'
  },
  {
    key: 'kettle',
    name: 'Kettle',
    price: 5,
    category: 'appliances',
    image: '/items/kettle.png',
    description: 'Electric kettle',
    size: 'small'
  },
  {
    key: 'microwave',
    name: 'Microwave',
    price: 10,
    category: 'appliances',
    image: '/items/microwave.png',
    description: 'Microwave oven',
    size: 'small'
  },
  {
    key: 'mini_fridge',
    name: 'Mini Fridge',
    price: 15,
    category: 'appliances',
    image: '/items/mini_fridge.png',
    description: 'Small refrigerator',
    size: 'medium'
  },
  {
    key: 'oven',
    name: 'Oven',
    price: 30,
    category: 'appliances',
    image: '/items/oven.png',
    description: 'Kitchen oven',
    size: 'medium'
  },
  {
    key: 'washing_machine',
    name: 'Washing Machine',
    price: 35,
    category: 'appliances',
    image: '/items/washing_machine.png',
    description: 'Washing machine',
    size: 'medium'
  },

  // ===== ELECTRONICS =====
  {
    key: 'computer',
    name: 'Computer',
    price: 15,
    category: 'electronics',
    image: '/items/computer.png',
    description: 'Desktop computer',
    size: 'small'
  },
  {
    key: 'computer_monitor',
    name: 'Computer Monitor',
    price: 8,
    category: 'electronics',
    image: '/items/computer_monitor.png',
    description: 'Computer monitor',
    size: 'small'
  },
  {
    key: 'electronics',
    name: 'Electronics Bundle',
    price: 20,
    category: 'electronics',
    image: '/items/electronics.png',
    description: 'Small electronics bundle',
    size: 'small'
  },
  {
    key: 'printer_scanner',
    name: 'Printer Scanner',
    price: 15,
    category: 'electronics',
    image: '/items/printer_scanner.png',
    description: 'Printer and scanner',
    size: 'small'
  },

  // ===== OUTDOOR & GARDEN =====
  {
    key: 'bbq_grill',
    name: 'BBQ Grill',
    price: 25,
    category: 'outdoor',
    image: '/items/bbq_grill.png',
    description: 'Barbecue grill',
    size: 'medium'
  },
  {
    key: 'garden_table',
    name: 'Garden Table',
    price: 20,
    category: 'outdoor',
    image: '/items/garden_table.png',
    description: 'Garden table',
    size: 'medium'
  },
  {
    key: 'lawn_mower',
    name: 'Lawn Mower',
    price: 20,
    category: 'outdoor',
    image: '/items/lawn_mower.png',
    description: 'Lawn mower',
    size: 'medium'
  },
  {
    key: 'outdoor',
    name: 'Outdoor Item',
    price: 20,
    category: 'outdoor',
    image: '/items/outdoor.png',
    description: 'Miscellaneous outdoor item',
    size: 'medium'
  },
  {
    key: 'plant_pot',
    name: 'Plant Pot',
    price: 5,
    category: 'outdoor',
    image: '/items/plant_pot.png',
    description: 'Large plant pot',
    size: 'small'
  },

  // ===== SPORTS & MUSIC =====
  {
    key: 'bicycle',
    name: 'Bicycle',
    price: 20,
    category: 'sports',
    image: '/items/bicycle.png',
    description: 'Bicycle',
    size: 'medium'
  },
  {
    key: 'gym_equipment',
    name: 'Gym Equipment',
    price: 25,
    category: 'sports',
    image: '/items/gym_equipment.png',
    description: 'Gym equipment piece',
    size: 'medium'
  },
  {
    key: 'piano',
    name: 'Piano',
    price: 120,
    category: 'sports',
    image: '/items/piano.png',
    description: 'Piano (special handling)',
    size: 'large'
  },

  // ===== BOXES & CONTAINERS =====
  {
    key: 'box',
    name: 'Box (Small)',
    price: 4,
    category: 'boxes',
    image: '/items/box.png',
    description: 'Small moving box',
    size: 'small'
  },
  {
    key: 'boxes',
    name: 'Boxes (Set of 5)',
    price: 20,
    category: 'boxes',
    image: '/items/boxes.png',
    description: 'Set of 5 medium boxes',
    size: 'medium'
  },
  {
    key: 'large_box',
    name: 'Large Box',
    price: 8,
    category: 'boxes',
    image: '/items/large_box.png',
    description: 'Large moving box',
    size: 'medium'
  },
  {
    key: 'medium_box',
    name: 'Medium Box',
    price: 6,
    category: 'boxes',
    image: '/items/medium_box.png',
    description: 'Medium moving box',
    size: 'small'
  },
  {
    key: 'plastic_bin',
    name: 'Plastic Bin',
    price: 6,
    category: 'boxes',
    image: '/items/plastic_bin.png',
    description: 'Plastic storage bin',
    size: 'small'
  },

  // ===== MISCELLANEOUS =====
  {
    key: 'custom',
    name: 'Custom Item',
    price: 20,
    category: 'misc',
    image: '/items/misc/add_custom.svg',
    description: 'Custom or special item',
    size: 'medium'
  },
  {
    key: 'other',
    name: 'Other Item',
    price: 15,
    category: 'misc',
    image: '/items/misc/add_custom.svg',
    description: 'Other miscellaneous item',
    size: 'small'
  },
  {
    key: 'fan',
    name: 'Fan',
    price: 8,
    category: 'misc',
    image: '/items/fan.png',
    description: 'Electric fan',
    size: 'small'
  }
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
