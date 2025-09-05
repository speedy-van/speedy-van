export type ItemKey =
  // Furniture
  | 'armchair'
  | 'bed'
  | 'bed_frame'
  | 'bookshelf'
  | 'book_shelf'
  | 'chair'
  | 'chairs'
  | 'coffee_table'
  | 'desk'
  | 'dining_table'
  | 'filing_cabinet'
  | 'furniture'
  | 'kitchen_cabinet'
  | 'lamp'
  | 'living_room'
  | 'mattress'
  | 'mirror'
  | 'office_chair'
  | 'office_desk'
  | 'painting_frame'
  | 'patio_chair'
  | 'sofa'
  | 'table'
  // Appliances
  | 'air_conditioner'
  | 'dishwasher'
  | 'dryer'
  | 'fridge_freezer'
  | 'kettle'
  | 'microwave'
  | 'mini_fridge'
  | 'oven'
  | 'washing_machine'
  // Electronics
  | 'computer'
  | 'computer_monitor'
  | 'electronics'
  | 'printer_scanner'
  // Outdoor & Garden
  | 'bbq_grill'
  | 'garden_table'
  | 'lawn_mower'
  | 'outdoor'
  | 'plant_pot'
  // Sports & Music
  | 'bicycle'
  | 'gym_equipment'
  | 'piano'
  // Boxes & Containers
  | 'box'
  | 'boxes'
  | 'large-box'
  | 'medium-box'
  | 'plastic_bin'
  // Misc
  | 'custom'
  | 'other'
  | 'fan';

export type CategoryKey =
  | 'furniture'
  | 'appliances'
  | 'electronics'
  | 'outdoor'
  | 'sports'
  | 'boxes'
  | 'misc';

export type CatalogItem = {
  key: ItemKey;
  label: string;
  category: CategoryKey;
  image: string; // public path
  tooltip?: string;
  weightClass?: 'light' | 'medium' | 'heavy';
};

export const CATEGORY_META: Record<
  CategoryKey,
  { label: string; icon: string; color: string }
> = {
  furniture: { label: 'Furniture', icon: '🛋️', color: '#DCC7A1' },
  appliances: { label: 'Appliances', icon: '⚙️', color: '#A7C7E7' },
  electronics: { label: 'Electronics', icon: '💻', color: '#00E5FF' },
  outdoor: { label: 'Outdoor & Garden', icon: '🌿', color: '#9FE3A9' },
  sports: { label: 'Sports & Music', icon: '🎵', color: '#F5A3A3' },
  boxes: { label: 'Boxes', icon: '📦', color: '#F4C07A' },
  misc: { label: 'Misc', icon: '🧩', color: '#C7A7F5' },
};

function png(fileBase: string) {
  return `/items/${fileBase}.png`;
}

export const CATALOG: CatalogItem[] = [
  // Furniture
  {
    key: 'armchair',
    label: 'Armchair',
    category: 'furniture',
    image: png('armchair'),
  },
  { key: 'bed', label: 'Bed', category: 'furniture', image: png('bed') },
  {
    key: 'bed_frame',
    label: 'Bed Frame',
    category: 'furniture',
    image: png('bed_frame'),
  },
  {
    key: 'bookshelf',
    label: 'Bookshelf',
    category: 'furniture',
    image: png('bookshelf'),
  },
  {
    key: 'book_shelf',
    label: 'Book Shelf',
    category: 'furniture',
    image: png('book_shelf'),
  },
  { key: 'chair', label: 'Chair', category: 'furniture', image: png('chair') },
  {
    key: 'chairs',
    label: 'Chairs',
    category: 'furniture',
    image: png('chairs'),
  },
  {
    key: 'coffee_table',
    label: 'Coffee Table',
    category: 'furniture',
    image: png('coffee_table'),
  },
  { key: 'desk', label: 'Desk', category: 'furniture', image: png('desk') },
  {
    key: 'dining_table',
    label: 'Dining Table',
    category: 'furniture',
    image: png('dining_table'),
  },
  {
    key: 'filing_cabinet',
    label: 'Filing Cabinet',
    category: 'furniture',
    image: png('filing_cabinet'),
    tooltip: 'May require 2 people depending on size',
  },
  {
    key: 'furniture',
    label: 'Furniture (Other)',
    category: 'furniture',
    image: png('furniture'),
  },
  {
    key: 'kitchen_cabinet',
    label: 'Kitchen Cabinet',
    category: 'furniture',
    image: png('kitchen_cabinet'),
  },
  { key: 'lamp', label: 'Lamp', category: 'furniture', image: png('lamp') },
  {
    key: 'living_room',
    label: 'Living Room Unit',
    category: 'furniture',
    image: png('living_room'),
  },
  {
    key: 'mattress',
    label: 'Mattress',
    category: 'furniture',
    image: png('mattress'),
  },
  {
    key: 'mirror',
    label: 'Mirror',
    category: 'furniture',
    image: png('mirror'),
  },
  {
    key: 'office_chair',
    label: 'Office Chair',
    category: 'furniture',
    image: png('office_chair'),
  },
  {
    key: 'office_desk',
    label: 'Office Desk',
    category: 'furniture',
    image: png('office_desk'),
  },
  {
    key: 'painting_frame',
    label: 'Painting & Frame',
    category: 'furniture',
    image: png('painting_frame'),
  },
  {
    key: 'patio_chair',
    label: 'Patio Chair',
    category: 'furniture',
    image: png('patio_chair'),
  },
  { key: 'sofa', label: 'Sofa', category: 'furniture', image: png('sofa') },
  { key: 'table', label: 'Table', category: 'furniture', image: png('table') },

  // Appliances
  {
    key: 'air_conditioner',
    label: 'Air Conditioner',
    category: 'appliances',
    image: png('air_conditioner'),
  },
  {
    key: 'dishwasher',
    label: 'Dishwasher',
    category: 'appliances',
    image: png('dishwasher'),
  },
  { key: 'dryer', label: 'Dryer', category: 'appliances', image: png('dryer') },
  {
    key: 'fridge_freezer',
    label: 'Fridge Freezer',
    category: 'appliances',
    image: png('fridge_freezer'),
  },
  {
    key: 'kettle',
    label: 'Kettle',
    category: 'appliances',
    image: png('kettle'),
  },
  {
    key: 'microwave',
    label: 'Microwave',
    category: 'appliances',
    image: png('microwave'),
  },
  {
    key: 'mini_fridge',
    label: 'Mini Fridge',
    category: 'appliances',
    image: png('mini_fridge'),
  },
  { key: 'oven', label: 'Oven', category: 'appliances', image: png('oven') },
  {
    key: 'washing_machine',
    label: 'Washing Machine',
    category: 'appliances',
    image: png('washer'),
  },

  // Electronics
  {
    key: 'computer',
    label: 'Computer',
    category: 'electronics',
    image: png('computer'),
  },
  {
    key: 'computer_monitor',
    label: 'Computer Monitor',
    category: 'electronics',
    image: png('computer_monitor'),
  },
  {
    key: 'electronics',
    label: 'Electronics (Other)',
    category: 'electronics',
    image: png('electronics'),
  },
  {
    key: 'printer_scanner',
    label: 'Printer / Scanner',
    category: 'electronics',
    image: png('printer_scanner'),
  },

  // Outdoor & Garden
  {
    key: 'bbq_grill',
    label: 'BBQ Grill',
    category: 'outdoor',
    image: png('bbq_grill'),
  },
  {
    key: 'garden_table',
    label: 'Garden Table',
    category: 'outdoor',
    image: png('garden_table'),
  },
  {
    key: 'lawn_mower',
    label: 'Lawn Mower',
    category: 'outdoor',
    image: png('lawn_mower'),
  },
  {
    key: 'outdoor',
    label: 'Outdoor (Other)',
    category: 'outdoor',
    image: png('outdoor'),
  },
  {
    key: 'plant_pot',
    label: 'Plant Pot',
    category: 'outdoor',
    image: png('plant_pot'),
  },

  // Sports & Music
  {
    key: 'bicycle',
    label: 'Bicycle',
    category: 'sports',
    image: png('bicycle'),
  },
  {
    key: 'gym_equipment',
    label: 'Gym Equipment',
    category: 'sports',
    image: png('gym_equipment'),
  },
  {
    key: 'piano',
    label: 'Piano',
    category: 'sports',
    image: png('piano'),
    tooltip: 'Heavy item; may require special handling',
  },

  // Boxes
  { key: 'box', label: 'Box', category: 'boxes', image: png('box') },
  { key: 'boxes', label: 'Boxes', category: 'boxes', image: png('boxes') },
  {
    key: 'large-box',
    label: 'Large Box',
    category: 'boxes',
    image: png('large-box'),
  },
  {
    key: 'medium-box',
    label: 'Medium Box',
    category: 'boxes',
    image: png('medium-box'),
  },
  {
    key: 'plastic_bin',
    label: 'Plastic Bin',
    category: 'boxes',
    image: png('plastic_bin'),
  },

  // Misc
  { key: 'fan', label: 'Fan', category: 'misc', image: png('fan') },
  { key: 'other', label: 'Other', category: 'misc', image: png('other') },
  {
    key: 'custom',
    label: 'Custom Item',
    category: 'misc',
    image: png('custom'),
  },
];

export const CATEGORIES: CategoryKey[] = [
  'furniture',
  'appliances',
  'electronics',
  'outdoor',
  'sports',
  'boxes',
  'misc',
];

export function itemsByCategory(category: CategoryKey) {
  return CATALOG.filter(i => i.category === category);
}
