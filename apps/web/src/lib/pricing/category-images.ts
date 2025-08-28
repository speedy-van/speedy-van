// Category image mapping for popular categories
// Using actual images from public/items directory
export const CATEGORY_IMAGES = {
  // Furniture Categories
  sofas: '/items/sofa.png',
  chairs: '/items/chairs.png',
  armchair: '/items/armchair.png',
  beds: '/items/bed.png',
  bed_frame: '/items/bed_frame.png',
  mattress: '/items/mattress.png',
  tables: '/items/table.png',
  dining_table: '/items/dining_table.png',
  coffee_table: '/items/coffee_table.png',
  desk: '/items/desk.png',
  office_desk: '/items/office_desk.png',
  office_chair: '/items/office_chair.png',
  
  // Storage Categories
  storage: '/items/wardrobe.png',
  wardrobe: '/items/wardrobe.png',
  bookshelf: '/items/bookshelf.png',
  book_shelf: '/items/book_shelf.png',
  filing_cabinet: '/items/filing_cabinet.png',
  
  // Appliances Categories
  appliances: '/items/refrigerator.png',
  fridge_freezer: '/items/fridge_freezer.png',
  refrigerator: '/items/refrigerator.png',
  mini_fridge: '/items/mini_fridge.png',
  washing_machine: '/items/washer.png',
  dryer: '/items/dryer.png',
  dishwasher: '/items/dishwasher.png',
  microwave: '/items/microwave.png',
  oven: '/items/oven.png',
  stove: '/items/stove.png',
  toaster: '/items/toaster.png',
  kettle: '/items/kettle.png',
  vacuum_cleaner: '/items/vacuum_cleaner.png',
  air_conditioner: '/items/air_conditioner.png',
  fan: '/items/fan.png',
  
  // Electronics Categories
  electronics: '/items/electronics.png',
  tv: '/items/tv.png',
  television: '/items/television.png',
  computer: '/items/computer.png',
  computer_monitor: '/items/computer_monitor.png',
  printer_scanner: '/items/printer_scanner.png',
  
  // Boxes & Containers
  boxes: '/items/boxes.png',
  box: '/items/box.png',
  small_box: '/items/small-box.png',
  medium_box: '/items/medium-box.png',
  large_box: '/items/large-box.png',
  plastic_bin: '/items/plastic_bin.png',
  suitcase: '/items/suitcase.png',
  
  // Outdoor & Garden
  outdoor: '/items/outdoor.png',
  garden_table: '/items/garden_table.png',
  patio_chair: '/items/patio_chair.png',
  bbq_grill: '/items/bbq_grill.png',
  lawn_mower: '/items/lawn_mower.png',
  bicycle: '/items/bicycle.png',
  
  // Sports & Fitness
  sports: '/items/sports.png',
  gym_equipment: '/items/gym_equipment.png',
  treadmill: '/items/treadmill.png',
  
  // Kitchen & Living
  kitchen: '/items/kitchen.png',
  kitchen_cabinet: '/items/kitchen_cabinet.png',
  living_room: '/items/living_room.png',
  
  // Decorative & Art
  lamp: '/items/lamp.png',
  mirror: '/items/mirror.png',
  painting_frame: '/items/painting_frame.png',
  plant_pot: '/items/plant_pot.png',
  
  // Special Items
  piano: '/items/piano.png',
  whiteboard: '/items/whiteboard.png',
  
  // Misc
  misc: '/items/other.png',
  custom: '/items/custom.png'
} as const;

export type CategoryKey = keyof typeof CATEGORY_IMAGES;

export function getCategoryImage(categoryName: string): string {
  const normalizedName = categoryName.toLowerCase().trim();
  return CATEGORY_IMAGES[normalizedName as CategoryKey] || '/items/placeholder.svg';
}

export function getCategoryDisplayName(categoryName: string): string {
  const displayNames: Record<string, string> = {
    // Furniture
    sofas: 'Sofas & Couches',
    chairs: 'Chairs',
    armchair: 'Armchairs',
    beds: 'Beds',
    bed_frame: 'Bed Frames',
    mattress: 'Mattresses',
    tables: 'Tables',
    dining_table: 'Dining Tables',
    coffee_table: 'Coffee Tables',
    desk: 'Desks',
    office_desk: 'Office Desks',
    office_chair: 'Office Chairs',
    
    // Storage
    storage: 'Storage',
    wardrobe: 'Wardrobes',
    bookshelf: 'Bookshelves',
    book_shelf: 'Book Shelves',
    filing_cabinet: 'Filing Cabinets',
    
    // Appliances
    appliances: 'Appliances',
    fridge_freezer: 'Fridge Freezers',
    refrigerator: 'Refrigerators',
    mini_fridge: 'Mini Fridges',
    washing_machine: 'Washing Machines',
    dryer: 'Dryers',
    dishwasher: 'Dishwashers',
    microwave: 'Microwaves',
    oven: 'Ovens',
    stove: 'Stoves',
    toaster: 'Toasters',
    kettle: 'Kettles',
    vacuum_cleaner: 'Vacuum Cleaners',
    air_conditioner: 'Air Conditioners',
    fan: 'Fans',
    
    // Electronics
    electronics: 'Electronics',
    tv: 'TVs',
    television: 'Televisions',
    computer: 'Computers',
    computer_monitor: 'Computer Monitors',
    printer_scanner: 'Printers & Scanners',
    
    // Boxes
    boxes: 'Boxes & Containers',
    box: 'Boxes',
    small_box: 'Small Boxes',
    medium_box: 'Medium Boxes',
    large_box: 'Large Boxes',
    plastic_bin: 'Plastic Bins',
    suitcase: 'Suitcases',
    
    // Outdoor
    outdoor: 'Outdoor Furniture',
    garden_table: 'Garden Tables',
    patio_chair: 'Patio Chairs',
    bbq_grill: 'BBQ Grills',
    lawn_mower: 'Lawn Mowers',
    bicycle: 'Bicycles',
    
    // Sports
    sports: 'Sports Equipment',
    gym_equipment: 'Gym Equipment',
    treadmill: 'Treadmills',
    
    // Kitchen & Living
    kitchen: 'Kitchen Items',
    kitchen_cabinet: 'Kitchen Cabinets',
    living_room: 'Living Room',
    
    // Decorative
    lamp: 'Lamps',
    mirror: 'Mirrors',
    painting_frame: 'Picture Frames',
    plant_pot: 'Plant Pots',
    
    // Special
    piano: 'Pianos',
    whiteboard: 'Whiteboards',
    
    // Misc
    misc: 'Other Items',
    custom: 'Custom Items'
  };
  
  const normalizedName = categoryName.toLowerCase().trim();
  return displayNames[normalizedName] || categoryName;
}

// Category groups for organized display
export const CATEGORY_GROUPS = {
  furniture: {
    title: 'Furniture',
    categories: ['sofas', 'chairs', 'armchair', 'beds', 'bed_frame', 'mattress', 'tables', 'dining_table', 'coffee_table', 'desk', 'office_desk', 'office_chair']
  },
  storage: {
    title: 'Storage',
    categories: ['storage', 'wardrobe', 'bookshelf', 'book_shelf', 'filing_cabinet']
  },
  appliances: {
    title: 'Appliances',
    categories: ['appliances', 'fridge_freezer', 'refrigerator', 'mini_fridge', 'washing_machine', 'dryer', 'dishwasher', 'microwave', 'oven', 'stove', 'toaster', 'kettle', 'vacuum_cleaner', 'air_conditioner', 'fan']
  },
  electronics: {
    title: 'Electronics',
    categories: ['electronics', 'tv', 'television', 'computer', 'computer_monitor', 'printer_scanner']
  },
  boxes: {
    title: 'Boxes & Containers',
    categories: ['boxes', 'box', 'small_box', 'medium_box', 'large_box', 'plastic_bin', 'suitcase']
  },
  outdoor: {
    title: 'Outdoor & Garden',
    categories: ['outdoor', 'garden_table', 'patio_chair', 'bbq_grill', 'lawn_mower', 'bicycle']
  },
  sports: {
    title: 'Sports & Fitness',
    categories: ['sports', 'gym_equipment', 'treadmill']
  },
  decorative: {
    title: 'Decorative & Lighting',
    categories: ['lamp', 'mirror', 'painting_frame', 'plant_pot']
  },
  special: {
    title: 'Special Items',
    categories: ['piano', 'whiteboard']
  }
} as const;
