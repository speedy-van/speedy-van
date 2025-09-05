// src/lib/pricing/catalog.ts
// -----------------------------------------------------------------------------
// Item volume catalog in cubic feet (ft³).
// Pricing rule: item_cost = volume_ft3 * RATE_PER_FT3 (default £1.00/ft³).
// -----------------------------------------------------------------------------
// IMPORTANT: Only include concrete, priceable items (no generic buckets).

export const ITEM_VOLUMES_FT3: Record<string, number> = {
  // Furniture
  armchair: 15,
  bed: 60, // double
  bed_frame: 25,
  bookshelf: 30,
  book_shelf: 30,
  chair: 10,
  chairs: 10, // treat as single chair (multiply by qty)
  coffee_table: 20,
  desk: 30,
  dining_table: 40,
  filing_cabinet: 25,
  kitchen_cabinet: 40,
  lamp: 8,
  mattress: 50, // double
  mirror: 10,
  office_chair: 12,
  office_desk: 30,
  painting_frame: 8,
  patio_chair: 10,
  sofa: 90, // 3-seater
  table: 25, // generic

  // Appliances
  air_conditioner: 15,
  dishwasher: 35,
  dryer: 35,
  fridge_freezer: 60,
  kettle: 2,
  microwave: 8,
  mini_fridge: 20,
  oven: 40,
  washing_machine: 45,

  // Electronics
  computer: 10,
  computer_monitor: 6,
  printer_scanner: 12,

  // Outdoor & Garden
  bbq_grill: 40,
  garden_table: 35,
  lawn_mower: 30,
  plant_pot: 12,

  // Sports & Music
  bicycle: 25,
  gym_equipment: 60,
  piano: 150, // upright

  // Boxes & Containers
  box: 3, // small
  boxes: 3, // alias small
  'medium-box': 6,
  'large-box': 10,
  plastic_bin: 8,

  // Misc (price via explicit volume input at runtime for "custom"/"other")
  fan: 5,
};
