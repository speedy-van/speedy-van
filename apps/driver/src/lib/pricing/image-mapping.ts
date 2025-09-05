// src/lib/pricing/image-mapping.ts
// -----------------------------------------------------------------------------
// Maps item IDs and names to their corresponding image paths
// -----------------------------------------------------------------------------

// Mapping from item IDs to image paths
const ITEM_IMAGE_MAP: Record<string, string> = {
  // Sofas
  'armchair-1seat': '/items/armchair.png',
  'sofa-2seat': '/items/sofa.png',
  'sofa-3seat': '/items/sofa.png',
  'sofa-4seat': '/items/sofa.png',
  'sofa-corner': '/items/sofa.png',

  // Beds
  'bed-single': '/items/bed.png',
  'bed-double': '/items/bed.png',
  'bed-king': '/items/bed.png',
  'bed-frame': '/items/bed_frame.png',
  mattress: '/items/mattress.png',

  // Storage
  'wardrobe-2door': '/items/wardrobe.png',
  'wardrobe-3door': '/items/wardrobe.png',
  bookshelf: '/items/bookshelf.png',
  'book-shelf': '/items/book_shelf.png',
  'filing-cabinet': '/items/filing_cabinet.png',

  // Tables
  'table-dining-4': '/items/dining_table.png',
  'table-dining-6': '/items/dining_table.png',
  'table-coffee': '/items/coffee_table.png',
  'table-desk': '/items/desk.png',
  'table-office': '/items/office_desk.png',

  // Chairs
  'chair-dining': '/items/chair.png',
  'chair-office': '/items/office_chair.png',
  'chair-patio': '/items/patio_chair.png',
  'chairs-set': '/items/chairs.png',

  // Appliances
  'fridge-standard': '/items/fridge_freezer.png',
  'fridge-mini': '/items/mini_fridge.png',
  'washing-machine': '/items/washer.png',
  dryer: '/items/dryer.png',
  dishwasher: '/items/dishwasher.png',
  oven: '/items/oven.png',
  microwave: '/items/microwave.png',
  kettle: '/items/kettle.png',
  'air-conditioner': '/items/air_conditioner.png',

  // Electronics
  'tv-32': '/items/tv.png',
  'tv-55': '/items/tv.png',
  'computer-desktop': '/items/computer.png',
  'computer-laptop': '/items/computer.png',
  monitor: '/items/computer_monitor.png',
  printer: '/items/printer_scanner.png',

  // Outdoor
  'bbq-grill': '/items/bbq_grill.png',
  'garden-table': '/items/garden_table.png',
  'lawn-mower': '/items/lawn_mower.png',
  'plant-pot': '/items/plant_pot.png',

  // Sports & Music
  bicycle: '/items/bicycle.png',
  'gym-equipment': '/items/gym_equipment.png',
  piano: '/items/piano.png',

  // Boxes
  'box-small': '/items/small-box.png',
  'box-medium': '/items/medium-box.png',
  'box-large': '/items/large-box.png',
  'plastic-bin': '/items/plastic_bin.png',

  // Misc
  lamp: '/items/lamp.png',
  mirror: '/items/mirror.png',
  'painting-frame': '/items/painting_frame.png',
  fan: '/items/fan.png',
  custom: '/items/custom.png',
  other: '/items/other.png',
};

// Mapping from canonical names to image paths (fallback)
const NAME_IMAGE_MAP: Record<string, string> = {
  armchair: '/items/armchair.png',
  sofa: '/items/sofa.png',
  bed: '/items/bed.png',
  wardrobe: '/items/wardrobe.png',
  bookshelf: '/items/bookshelf.png',
  table: '/items/table.png',
  chair: '/items/chair.png',
  fridge: '/items/fridge_freezer.png',
  'washing machine': '/items/washer.png',
  tv: '/items/tv.png',
  computer: '/items/computer.png',
  bicycle: '/items/bicycle.png',
  piano: '/items/piano.png',
  box: '/items/box.png',
  lamp: '/items/lamp.png',
  mirror: '/items/mirror.png',
};

// Category fallback images
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  sofas: '/items/sofa.png',
  beds: '/items/bed.png',
  storage: '/items/wardrobe.png',
  tables: '/items/table.png',
  appliances: '/items/fridge_freezer.png',
  electronics: '/items/electronics.png',
  outdoor: '/items/outdoor.png',
  sports: '/items/gym_equipment.png',
  boxes: '/items/boxes.png',
  misc: '/items/other.png',
};

/**
 * Get the image path for an item based on its ID, canonical name, or category
 */
export function getItemImage(
  itemId: string,
  canonicalName?: string,
  category?: string
): string {
  // First try to find by exact item ID
  if (ITEM_IMAGE_MAP[itemId]) {
    return ITEM_IMAGE_MAP[itemId];
  }

  // Then try to find by canonical name
  if (canonicalName && NAME_IMAGE_MAP[canonicalName.toLowerCase()]) {
    return NAME_IMAGE_MAP[canonicalName.toLowerCase()];
  }

  // Finally fall back to category image
  if (category && CATEGORY_IMAGE_MAP[category]) {
    return CATEGORY_IMAGE_MAP[category];
  }

  // Ultimate fallback
  return '/items/placeholder.svg';
}

/**
 * Get a list of all available image paths
 */
export function getAllItemImages(): string[] {
  return Object.values(ITEM_IMAGE_MAP);
}
