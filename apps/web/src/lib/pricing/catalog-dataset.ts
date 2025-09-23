/**
 * Comprehensive Item Catalog Dataset
 * Contains 375+ items with detailed specifications
 * Used for pricing calculations, search autocomplete, and item selection
 */

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  keywords: string;
  volume: number; // cubic meters
  heavy: boolean;
  fragile: boolean;
  valuable: boolean;
  weight: number; // kg
}

export const COMPREHENSIVE_CATALOG: CatalogItem[] = [
  // Essential Furniture Items (most common)
  { id: "sofa", name: "Sofa", category: "furniture", keywords: "couch, settee, loveseat", volume: 2.5, heavy: false, fragile: false, valuable: false, weight: 80 },
  { id: "chair", name: "Chair", category: "furniture", keywords: "seat, seating, armchair", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "table", name: "Table", category: "furniture", keywords: "desk, surface, dining table", volume: 1.2, heavy: false, fragile: false, valuable: false, weight: 40 },
  { id: "bed", name: "Bed", category: "furniture", keywords: "mattress, bedframe, bed frame", volume: 2.0, heavy: false, fragile: false, valuable: false, weight: 60 },
  { id: "mattress", name: "Mattress", category: "furniture", keywords: "bed mattress, sleeping", volume: 1.5, heavy: false, fragile: false, valuable: false, weight: 30 },
  { id: "refrigerator", name: "Refrigerator", category: "appliances", keywords: "fridge, freezer, icebox", volume: 1.8, heavy: true, fragile: false, valuable: false, weight: 80 },
  { id: "washing-machine", name: "Washing Machine", category: "appliances", keywords: "washer, laundry machine", volume: 1.2, heavy: true, fragile: false, valuable: false, weight: 70 },
  { id: "box", name: "Box", category: "boxes", keywords: "container, storage, bin", volume: 0.06, heavy: false, fragile: false, valuable: false, weight: 8 },

  // Fitness Equipment
  { id: "weight-rack", name: "Weight Rack", category: "fitness", keywords: "squat rack, weight stand", volume: 1.2, heavy: true, fragile: false, valuable: false, weight: 40 },
  { id: "ab-machine", name: "Abdominal Machine", category: "fitness", keywords: "ab roller, crunch machine", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 25 },
  { id: "leg-press-machine", name: "Leg Press Machine", category: "fitness", keywords: "leg press, gym legs", volume: 2.2, heavy: true, fragile: false, valuable: true, weight: 90 },
  { id: "cable-crossover-machine", name: "Cable Crossover Machine", category: "fitness", keywords: "cable machine, pulley system", volume: 3.0, heavy: true, fragile: false, valuable: true, weight: 150 },
  { id: "smith-machine", name: "Smith Machine", category: "fitness", keywords: "guided barbell, smith rack", volume: 2.8, heavy: true, fragile: false, valuable: true, weight: 140 },
  { id: "dip-bar", name: "Dip Bar", category: "fitness", keywords: "parallel bars, dip station", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 20 },
  { id: "plyo-box", name: "Plyometric Box", category: "fitness", keywords: "jump box, workout box", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "heart-rate-monitor", name: "Heart Rate Monitor", category: "fitness", keywords: "chest strap, pulse monitor", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "fitness-tracker", name: "Fitness Tracker", category: "fitness", keywords: "activity tracker, smartwatch", volume: 0.1, heavy: false, fragile: true, valuable: false, weight: 5 },
  { id: "gym-mat-large", name: "Large Gym Mat", category: "fitness", keywords: "exercise mat, tumbling mat", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 20 },
  { id: "boxing-gloves", name: "Boxing Gloves Set", category: "fitness", keywords: "punching gloves, sparring", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "speed-bag", name: "Speed Bag", category: "fitness", keywords: "boxing speed ball", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "medicine-ball", name: "Medicine Ball", category: "fitness", keywords: "workout ball, fitness ball", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "foam-roller", name: "Foam Roller", category: "fitness", keywords: "muscle roller, recovery", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "yoga-block", name: "Yoga Block", category: "fitness", keywords: "yoga brick, support block", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 4 },
  { id: "yoga-strap", name: "Yoga Strap", category: "fitness", keywords: "stretch strap, yoga belt", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 4 },
  { id: "ankle-weights", name: "Ankle Weights", category: "fitness", keywords: "leg weights, resistance", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 5 },
  { id: "wrist-weights", name: "Wrist Weights", category: "fitness", keywords: "arm weights", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 5 },
  { id: "step-aerobics", name: "Step Aerobics Platform", category: "fitness", keywords: "aerobic step, workout step", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "balance-board", name: "Balance Board", category: "fitness", keywords: "wobble board, core trainer", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "jump-rope", name: "Jump Rope", category: "fitness", keywords: "skipping rope, speed rope", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 4 },

  // Office Equipment
  { id: "office-chair", name: "Office Chair", category: "office", keywords: "desk chair, swivel chair, computer chair", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "boardroom-chair", name: "Boardroom Chair", category: "office", keywords: "meeting chair, conference chair", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 14 },
  { id: "reception-desk", name: "Reception Desk", category: "office", keywords: "office reception, front desk", volume: 2.0, heavy: true, fragile: false, valuable: true, weight: 65 },
  { id: "filing-cabinet-4drawer", name: "4-Drawer Filing Cabinet", category: "office", keywords: "office filing, document storage", volume: 1.0, heavy: true, fragile: false, valuable: false, weight: 32 },
  { id: "office-partition", name: "Office Partition", category: "office", keywords: "room divider, office screen", volume: 0.8, heavy: true, fragile: false, valuable: false, weight: 25 },
  { id: "whiteboard", name: "Whiteboard", category: "office", keywords: "presentation board, meeting board", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "photocopier", name: "Photocopier", category: "office", keywords: "office copier, scanner", volume: 1.8, heavy: true, fragile: false, valuable: false, weight: 55 },
  { id: "desk-lamp", name: "Desk Lamp", category: "office", keywords: "office light, task lamp", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 5 },
  { id: "paper-shredder", name: "Paper Shredder", category: "office", keywords: "document shredder", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "water-cooler", name: "Water Cooler", category: "office", keywords: "water dispenser", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "conference-phone", name: "Conference Phone", category: "office", keywords: "speakerphone", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "bookcase-office", name: "Office Bookcase", category: "office", keywords: "reference shelf", volume: 0.9, heavy: true, fragile: false, valuable: false, weight: 28 },
  { id: "coat-rack-office", name: "Office Coat Rack", category: "office", keywords: "standalone rack", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "chair-guest-office", name: "Office Guest Chair", category: "office", keywords: "visitor chair, side chair", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "desk-corner-unit", name: "Desk Corner Unit", category: "office", keywords: "desk extension, return unit", volume: 0.8, heavy: false, fragile: false, valuable: false, weight: 25 },
  { id: "desk-hutch", name: "Desk Hutch", category: "office", keywords: "desk top cabinet, organizer", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 20 },
  { id: "filing-cabinet-lateral", name: "Lateral Filing Cabinet", category: "office", keywords: "side filing cabinet", volume: 1.2, heavy: true, fragile: false, valuable: false, weight: 38 },
  { id: "office-sofa", name: "Office Sofa", category: "office", keywords: "waiting area sofa, couch", volume: 1.8, heavy: true, fragile: false, valuable: false, weight: 60 },
  { id: "office-table-coffee", name: "Office Coffee Table", category: "office", keywords: "lobby table, waiting area", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 20 },
  { id: "cabinet-storage-office", name: "Office Storage Cabinet", category: "office", keywords: "supply cabinet, cupboard", volume: 1.0, heavy: true, fragile: false, valuable: false, weight: 35 },
  { id: "rack-brochure", name: "Brochure Rack", category: "office", keywords: "literature stand, magazine rack", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "stand-whiteboard", name: "Whiteboard Stand", category: "office", keywords: "mobile whiteboard, easel", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "telephone-desk", name: "Desk Telephone", category: "office", keywords: "office phone, business phone", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "monitor-arm", name: "Monitor Arm", category: "office", keywords: "screen mount, monitor stand", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "keyboard-tray", name: "Keyboard Tray", category: "office", keywords: "slide out tray, under desk", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "cpu-holder", name: "CPU Holder", category: "office", keywords: "computer tower stand", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "cabinet-card", name: "Card Cabinet", category: "office", keywords: "index card drawer, catalog cabinet", volume: 0.7, heavy: false, fragile: false, valuable: false, weight: 25 },
  { id: "plan-cabinet", name: "Plan Cabinet", category: "office", keywords: "blueprint storage, map cabinet", volume: 1.4, heavy: true, fragile: false, valuable: false, weight: 50 },
  { id: "postal-scale", name: "Postal Scale", category: "office", keywords: "shipping scale, parcel scale", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "time-clock", name: "Time Clock", category: "office", keywords: "punch clock, attendance", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "safe-office", name: "Office Safe", category: "office", keywords: "data safe, document safe", volume: 0.8, heavy: true, fragile: false, valuable: false, weight: 45 },
  { id: "bookcase-glass-door-office", name: "Office Bookcase with Glass Doors", category: "office", keywords: "display bookcase, cabinet", volume: 1.1, heavy: true, fragile: true, valuable: false, weight: 40 },
  { id: "conference-table-large", name: "Large Conference Table", category: "office", keywords: "boardroom table, meeting table", volume: 3.5, heavy: true, fragile: false, valuable: true, weight: 120 },
  { id: "conference-table-small", name: "Small Conference Table", category: "office", keywords: "meeting table, discussion table", volume: 2.0, heavy: true, fragile: false, valuable: true, weight: 75 },
  { id: "lectern", name: "Lectern", category: "office", keywords: "podium, speaking stand", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 22 },
  { id: "projector-ceiling-mount", name: "Ceiling Projector Mount", category: "office", keywords: "projector bracket, ceiling mount", volume: 0.3, heavy: true, fragile: false, valuable: true, weight: 15 },
  { id: "screen-projection", name: "Projection Screen", category: "office", keywords: "pull down screen, electric", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 20 },
  { id: "table-training", name: "Training Table", category: "office", keywords: "classroom table, workshop table", volume: 1.8, heavy: true, fragile: false, valuable: true, weight: 60 },
  { id: "workstation-cubicle", name: "Cubicle Workstation", category: "office", keywords: "office cubicle, partition system", volume: 2.5, heavy: true, fragile: false, valuable: true, weight: 100 },

  // Boxes and Storage
  { id: "box-small", name: "Box - Small", category: "boxes", keywords: "small box, box, cardboard box", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 4 },
  { id: "box-medium", name: "Box - Medium", category: "boxes", keywords: "medium box, packing box", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 4 },
  { id: "box-large", name: "Box - Large", category: "boxes", keywords: "large box, suitcase, storage box", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 9 },
  { id: "box-book", name: "Book Box (heavy)", category: "boxes", keywords: "book box, heavy box, books box", volume: 0.3, heavy: true, fragile: false, valuable: false, weight: 9 },
  { id: "plastic-crate", name: "Plastic Crate (large)", category: "boxes", keywords: "plastic crate, plastic box", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 9 },
  { id: "suitcase-large", name: "Large Suitcase", category: "boxes", keywords: "travel case, luggage", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "garment-box", name: "Wardrobe Box", category: "boxes", keywords: "hanging box, garment box", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "archive-box", name: "Archive Box", category: "boxes", keywords: "document box, file box", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "crockery-box", name: "Crockery Box", category: "boxes", keywords: "plates box, china box", volume: 0.3, heavy: true, fragile: true, valuable: false, weight: 8 },
  { id: "glassware-box", name: "Glassware Box", category: "boxes", keywords: "glasses box, fragile box", volume: 0.3, heavy: true, fragile: true, valuable: false, weight: 8 },
  { id: "picture-box", name: "Picture/Art Box", category: "boxes", keywords: "framed art box", volume: 0.4, heavy: true, fragile: true, valuable: false, weight: 10 },
  { id: "tool-box", name: "Tool Box", category: "boxes", keywords: "tool storage box", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 9 },
  { id: "bike-box", name: "Bicycle Box", category: "boxes", keywords: "bike packaging", volume: 1.0, heavy: true, fragile: false, valuable: false, weight: 20 },
  { id: "box-mattress", name: "Mattress Box", category: "boxes", keywords: "mattress bag, mattress cover", volume: 0.8, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "box-tv", name: "TV Box", category: "boxes", keywords: "television box, screen box", volume: 0.5, heavy: false, fragile: true, valuable: false, weight: 12 },
  { id: "box-mirror", name: "Mirror Box", category: "boxes", keywords: "picture box, glass box", volume: 0.4, heavy: true, fragile: true, valuable: false, weight: 10 },
  { id: "box-lamp", name: "Lamp Box", category: "boxes", keywords: "light shade box, lamp packaging", volume: 0.3, heavy: true, fragile: true, valuable: false, weight: 8 },
  { id: "box-computer", name: "Computer Box", category: "boxes", keywords: "pc box, monitor box", volume: 0.4, heavy: false, fragile: true, valuable: false, weight: 10 },
  { id: "box-kitchen", name: "Kitchen Box", category: "boxes", keywords: "kitchenware box, utensils", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 7 },
  { id: "box-bathroom", name: "Bathroom Box", category: "boxes", keywords: "bathroom items, toiletries", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 7 },
  { id: "box-bedroom", name: "Bedroom Box", category: "boxes", keywords: "linen box, bedroom items", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 7 },
  { id: "box-garage", name: "Garage Box", category: "boxes", keywords: "tools box, car items", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "box-office", name: "Office Box", category: "boxes", keywords: "stationery box, documents", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 7 },
  { id: "box-toys", name: "Toys Box", category: "boxes", keywords: "children's toys, games", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 7 },
  { id: "box-christmas", name: "Christmas Decoration Box", category: "boxes", keywords: "xmas decs, tree ornaments", volume: 0.3, heavy: false, fragile: true, valuable: false, weight: 8 },
  { id: "box-camping", name: "Camping Equipment Box", category: "boxes", keywords: "tent box, outdoor gear", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "box-sports", name: "Sports Equipment Box", category: "boxes", keywords: "sports gear, balls", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 9 },
  { id: "box-shoes", name: "Shoes Box", category: "boxes", keywords: "footwear box, shoes storage", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 5 },
  { id: "box-jewelry", name: "Jewelry Box", category: "boxes", keywords: "small valuables box, jewelry case", volume: 0.1, heavy: false, fragile: true, valuable: false, weight: 5 },
  { id: "box-cable", name: "Cable Box", category: "boxes", keywords: "wires box, electronics cables", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 4 },
  { id: "box-medicine", name: "Medicine Box", category: "boxes", keywords: "first aid kit, pharmaceuticals", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 4 },
  { id: "box-garden", name: "Garden Box", category: "boxes", keywords: "gardening tools, plant items", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "box-diy", name: "DIY Box", category: "boxes", keywords: "tools box, home improvement", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "box-music", name: "Music Box", category: "boxes", keywords: "cds box, records, instruments", volume: 0.3, heavy: false, fragile: true, valuable: false, weight: 8 },
  { id: "box-photo", name: "Photo Box", category: "boxes", keywords: "photographs album, memories", volume: 0.2, heavy: false, fragile: true, valuable: false, weight: 6 },
  { id: "box-sentimental", name: "Sentimental Items Box", category: "boxes", keywords: "keepsakes, memorabilia", volume: 0.2, heavy: false, fragile: true, valuable: false, weight: 6 },
  { id: "box-sewing", name: "Sewing Box", category: "boxes", keywords: "sewing kit, fabric", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "box-cleaning", name: "Cleaning Box", category: "boxes", keywords: "cleaning supplies, detergents", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 5 },
  { id: "box-pet", name: "Pet Supplies Box", category: "boxes", keywords: "pet food, animal items", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 7 },
  { id: "box-misc", name: "Miscellaneous Box", category: "boxes", keywords: "assorted items, bits and bobs", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 5 },

  // Lighting
  { id: "lighting-chandelier", name: "Chandelier", category: "lighting", keywords: "ceiling light, crystal light", volume: 0.6, heavy: true, fragile: true, valuable: false, weight: 25 },
  { id: "lighting-pendant", name: "Pendant Light", category: "lighting", keywords: "hanging light, ceiling pendant", volume: 0.3, heavy: false, fragile: true, valuable: false, weight: 12 },
  { id: "floor-lamp", name: "Floor Lamp", category: "lighting", keywords: "standard lamp, reading lamp", volume: 0.4, heavy: false, fragile: true, valuable: false, weight: 15 },
  { id: "table-lamp", name: "Table Lamp", category: "lighting", keywords: "desk lamp, bedside lamp", volume: 0.2, heavy: false, fragile: true, valuable: false, weight: 8 },
  { id: "ceiling-fan", name: "Ceiling Fan", category: "lighting", keywords: "ceiling fan with light", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "lamp-standard", name: "Standard Lamp", category: "lighting", keywords: "arc lamp, tall lamp", volume: 0.5, heavy: false, fragile: true, valuable: false, weight: 16 },
  { id: "spotlight-track", name: "Spotlight Track", category: "lighting", keywords: "track lighting, halogen spots", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "bathroom-light", name: "Bathroom Light Unit", category: "lighting", keywords: "shower light, extractor light", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "outdoor-light", name: "Outdoor Security Light", category: "lighting", keywords: "pir light, wall light", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "lamp-shade-large", name: "Lampshade (large)", category: "lighting", keywords: "drum shade, empire shade", volume: 0.2, heavy: false, fragile: true, valuable: false, weight: 6 },

  // Flooring
  { id: "carpet-roll", name: "Carpet Roll", category: "flooring", keywords: "carpet, floor covering", volume: 1.2, heavy: true, fragile: false, valuable: false, weight: 30 },
  { id: "rug-large", name: "Large Rug", category: "flooring", keywords: "floor rug, area rug", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "rug-small", name: "Small Rug", category: "flooring", keywords: "mat, small carpet", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "laminate-flooring", name: "Laminate Flooring", category: "flooring", keywords: "wood flooring, floor panels", volume: 0.8, heavy: true, fragile: false, valuable: false, weight: 22 },
  { id: "underlay-roll", name: "Underlay Roll", category: "flooring", keywords: "carpet underlay", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "vinyl-flooring", name: "Vinyl Flooring Roll", category: "flooring", keywords: "lino, vinyl sheet", volume: 0.7, heavy: false, fragile: false, valuable: false, weight: 16 },
  { id: "tile-box", name: "Box of Tiles", category: "flooring", keywords: "floor tiles, ceramic tiles", volume: 0.6, heavy: true, fragile: false, valuable: false, weight: 18 },
  { id: "wood-flooring", name: "Wood Flooring Pack", category: "flooring", keywords: "hardwood, engineered wood", volume: 0.9, heavy: true, fragile: false, valuable: false, weight: 25 },

  // Soft Furnishing
  { id: "curtains-set", name: "Curtain Set", category: "soft-furnishing", keywords: "window curtains, drapes", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "blind-vertical", name: "Vertical Blinds", category: "soft-furnishing", keywords: "window blinds, office blinds", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "blind-roller", name: "Roller Blind", category: "soft-furnishing", keywords: "window roller, blind", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "cushions-set", name: "Cushion Set", category: "soft-furnishing", keywords: "throw pillows, sofa cushions", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "throws-set", name: "Throw Set", category: "soft-furnishing", keywords: "blanket, afghan, sofa throw", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "bedding-set", name: "Bedding Set", category: "soft-furnishing", keywords: "duvet cover, sheet set", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 5 },

  // Kitchen
  { id: "kitchenware-box", name: "Kitchen Items Box", category: "kitchen", keywords: "pots pans, utensils, kitchenware", volume: 0.4, heavy: true, fragile: false, valuable: false, weight: 12 },
  { id: "mixer-stand", name: "Stand Mixer (e.g., KitchenAid)", category: "kitchen", keywords: "food mixer, kitchen aid", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "food-processor", name: "Food Processor", category: "kitchen", keywords: "magimix, kenwood", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "juicer", name: "Juicer", category: "kitchen", keywords: "juice extractor", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "pressure-cooker", name: "Pressure Cooker", category: "kitchen", keywords: "instant pot, slow cooker", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "wok-large", name: "Large Wok", category: "kitchen", keywords: "stir fry pan", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "set-knives", name: "Knife Block Set", category: "kitchen", keywords: "cutlery block, sharp knives", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 12 },

  // Bathroom
  { id: "bathroom-cabinet", name: "Bathroom Cabinet", category: "bathroom", keywords: "medicine cabinet, bathroom storage", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "toilet", name: "Toilet", category: "bathroom", keywords: "wc, lavatory, bathroom toilet", volume: 0.8, heavy: true, fragile: true, valuable: true, weight: 35 },
  { id: "basin", name: "Wash Basin", category: "bathroom", keywords: "bathroom sink, hand basin", volume: 0.6, heavy: true, fragile: true, valuable: false, weight: 20 },
  { id: "bath", name: "Bathtub", category: "bathroom", keywords: "bath tub, bathroom bath", volume: 2.0, heavy: true, fragile: true, valuable: true, weight: 75 },
  { id: "shower-tray", name: "Shower Tray", category: "bathroom", keywords: "shower base, shower floor", volume: 0.8, heavy: true, fragile: true, valuable: false, weight: 25 },
  { id: "towel-rail", name: "Towel Rail", category: "bathroom", keywords: "heated towel rail, bathroom radiator", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "shower-unit", name: "Shower Unit (enclosed)", category: "bathroom", keywords: "shower cubicle, enclosure", volume: 1.6, heavy: true, fragile: false, valuable: true, weight: 50 },

  // General Household
  { id: "clothes-rail", name: "Clothes Rail", category: "general", keywords: "clothing rack, garment rail", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "ironing-board", name: "Ironing Board", category: "general", keywords: "ironing table", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "vacuum-cleaner", name: "Vacuum Cleaner", category: "general", keywords: "hoover, carpet cleaner", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "cleaning-supplies", name: "Cleaning Supplies Box", category: "general", keywords: "household cleaners, cleaning products", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "tools-toolbox", name: "Toolbox", category: "general", keywords: "tool box, hand tools", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "ladder", name: "Stepladder", category: "general", keywords: "steps, household ladder", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "fire-extinguisher", name: "Fire Extinguisher", category: "general", keywords: "safety equipment", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "smoke-alarm", name: "Smoke Detector", category: "general", keywords: "fire alarm, smoke alarm", volume: 0.1, heavy: false, fragile: true, valuable: false, weight: 5 },
  { id: "sewing-machine", name: "Sewing Machine", category: "general", keywords: " Singer, embroidery machine", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 18 },
  { id: "vacuum-cylinder", name: "Cylinder Vacuum", category: "general", keywords: " Henry vacuum, hetty", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 16 },
  { id: "iron", name: "Iron", category: "general", keywords: "clothes iron", volume: 0.1, heavy: false, fragile: false, valuable: false, weight: 4 },
  { id: "clothes-airer", name: "Clothes Airer", category: "general", keywords: "drying rack, clothes horse", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 10 },
  { id: "bag-laundry", name: "Laundry Bag", category: "general", keywords: "washing bag, linen bag", volume: 0.2, heavy: false, fragile: false, valuable: false, weight: 5 },
  { id: "bucket-mop", name: "Bucket and Mop", category: "general", keywords: "cleaning bucket", volume: 0.3, heavy: false, fragile: false, valuable: false, weight: 6 },
  { id: "recycling-bin", name: "Recycling Bin", category: "general", keywords: "wheelie bin, recycling box", volume: 0.4, heavy: false, fragile: false, valuable: false, weight: 8 },
  { id: "rug-cleaner", name: "Rug Cleaner (machine)", category: "general", keywords: "carpet cleaner, vax", volume: 1.0, heavy: true, fragile: false, valuable: false, weight: 30 },
  { id: "tool-chest-large", name: "Large Tool Chest", category: "general", keywords: "mechanics toolbox, roll cab", volume: 1.2, heavy: true, fragile: false, valuable: false, weight: 40 },
  { id: "workbench", name: "Garage Workbench", category: "general", keywords: " workshop bench", volume: 1.6, heavy: true, fragile: false, valuable: true, weight: 50 },
  { id: "generator-portable", name: "Portable Generator", category: "general", keywords: "petrol generator", volume: 1.0, heavy: true, fragile: false, valuable: false, weight: 35 },
  { id: "sack-truck", name: "Sack Truck", category: "general", keywords: "hand truck, dolly", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 15 },
  { id: "pet-crate-large", name: "Large Pet Crate", category: "general", keywords: "dog crate, animal carrier", volume: 0.6, heavy: false, fragile: false, valuable: false, weight: 16 },
  { id: "pet-bed-large", name: "Large Pet Bed", category: "general", keywords: "dog bed, cat tree", volume: 0.5, heavy: false, fragile: false, valuable: false, weight: 12 },
  { id: "bird-cage-large", name: "Large Bird Cage", category: "general", keywords: "aviary, parrot cage", volume: 0.8, heavy: true, fragile: true, valuable: true, weight: 25 },
  { id: "fish-tank-stand", name: "Fish Tank Stand", category: "general", keywords: "aquarium cabinet", volume: 0.7, heavy: false, fragile: false, valuable: false, weight: 20 },
  { id: "christmas-tree-artificial", name: "Artificial Christmas Tree", category: "general", keywords: "xmas tree, tree", volume: 0.8, heavy: true, fragile: false, valuable: true, weight: 22 },
  { id: "decorations-box", name: "Christmas Decorations Box", category: "general", keywords: "xmas decs, ornaments box", volume: 0.3, heavy: false, fragile: true, valuable: false, weight: 8 }
];

// Category definitions
export const CATALOG_CATEGORIES = [
  { id: "fitness", name: "Fitness Equipment", icon: "💪", color: "#e53e3e" },
  { id: "office", name: "Office Equipment", icon: "🏢", color: "#3182ce" },
  { id: "boxes", name: "Boxes & Storage", icon: "📦", color: "#d69e2e" },
  { id: "lighting", name: "Lighting", icon: "💡", color: "#f56500" },
  { id: "flooring", name: "Flooring", icon: "🏠", color: "#38a169" },
  { id: "soft-furnishing", name: "Soft Furnishing", icon: "🛋️", color: "#805ad5" },
  { id: "kitchen", name: "Kitchen", icon: "🍳", color: "#dd6b20" },
  { id: "bathroom", name: "Bathroom", icon: "🚿", color: "#0bc5ea" },
  { id: "general", name: "General Household", icon: "🏡", color: "#718096" }
];

// Helper functions
export function getCatalogItemById(id: string): CatalogItem | undefined {
  return COMPREHENSIVE_CATALOG.find(item => item.id === id);
}

export function getCatalogItemsByCategory(category: string): CatalogItem[] {
  return COMPREHENSIVE_CATALOG.filter(item => item.category === category);
}

export function searchCatalogItems(query: string): CatalogItem[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return COMPREHENSIVE_CATALOG;

  return COMPREHENSIVE_CATALOG.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.keywords.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm)
  ).sort((a, b) => {
    // Prioritize exact name matches
    const aNameMatch = a.name.toLowerCase().includes(searchTerm);
    const bNameMatch = b.name.toLowerCase().includes(searchTerm);
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    
    // Then prioritize keyword matches
    const aKeywordMatch = a.keywords.toLowerCase().includes(searchTerm);
    const bKeywordMatch = b.keywords.toLowerCase().includes(searchTerm);
    if (aKeywordMatch && !bKeywordMatch) return -1;
    if (!aKeywordMatch && bKeywordMatch) return 1;
    
    return a.name.localeCompare(b.name);
  });
}

export function getCatalogStats() {
  return {
    totalItems: COMPREHENSIVE_CATALOG.length,
    categories: CATALOG_CATEGORIES.length,
    heavyItems: COMPREHENSIVE_CATALOG.filter(item => item.heavy).length,
    fragileItems: COMPREHENSIVE_CATALOG.filter(item => item.fragile).length,
    valuableItems: COMPREHENSIVE_CATALOG.filter(item => item.valuable).length
  };
}
