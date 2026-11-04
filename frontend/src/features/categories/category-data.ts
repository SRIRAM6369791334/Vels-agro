// Vels Agro — Enterprise Machinery Categories, Sub-categories & Model Compatibility Seed Data

export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  icon: string;
  accentColor: string;
  order: number;
  subCategoryCount: number;
  productCount: number;
  featured: boolean;
  active: boolean;
  bannerUrl?: string;
}

export interface SubCategory {
  id: string;
  parentId: string;
  parentName: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  implementType: string;
  productCount: number;
  order: number;
  active: boolean;
  minHPRange?: string;
}

export interface MachineryBrand {
  id: string;
  name: string;
  origin: string;
  modelsCount: number;
  tier: 'oem' | 'partner' | 'compatible';
}

export interface MachineryModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  modelCode: string;
  horsePower: number;
  driveType: '2WD' | '4WD';
  ptoRPM: number;
  hitchCategory: 'Cat-1' | 'Cat-2' | 'Cat-3';
  price: number;
  imageUrl?: string;
}

export interface ImplementAttachment {
  id: string;
  name: string;
  category: string;
  minHP: number;
  requiredPTO: number;
  hitchType: string;
}

export interface CompatibilityRule {
  modelId: string;
  implementId: string;
  status: 'compatible' | 'not_recommended' | 'incompatible';
  notes?: string;
}

export const INITIAL_CATEGORIES: MainCategory[] = [
  {
    id: 'cat-tractors',
    name: 'Agro Tractors & Prime Movers',
    slug: 'agro-tractors',
    code: 'CAT-TRAC',
    description: 'Heavy duty, compact utility, and 4WD field tractors from 25HP to 90HP for multi-crop farming.',
    icon: 'truck',
    accentColor: '#009140',
    order: 1,
    subCategoryCount: 4,
    productCount: 38,
    featured: true,
    active: true,
    bannerUrl: '/brand/cat_tractor.jpg',
  },
  {
    id: 'cat-harvesters',
    name: 'Combine Harvesters & Reapers',
    slug: 'harvesters-reapers',
    code: 'CAT-HARV',
    description: 'Self-propelled paddy, wheat, and multi-crop combine harvesters with grain loss sensors.',
    icon: 'box',
    accentColor: '#8f1f78',
    order: 2,
    subCategoryCount: 3,
    productCount: 22,
    featured: true,
    active: true,
    bannerUrl: '/brand/cat_harvester.jpg',
  },
  {
    id: 'cat-tillers',
    name: 'Power Tillers & Rotavators',
    slug: 'power-tillers-rotavators',
    code: 'CAT-TILL',
    description: 'Soil preparation gear, hydraulic multi-speed rotavators, reversible ploughs and disc harrows.',
    icon: 'layers',
    accentColor: '#d97706',
    order: 3,
    subCategoryCount: 5,
    productCount: 46,
    featured: true,
    active: true,
    bannerUrl: '/brand/cat_tiller.jpg',
  },
  {
    id: 'cat-sprayers',
    name: 'Crop Protection & Sprayers',
    slug: 'crop-protection-sprayers',
    code: 'CAT-SPRY',
    description: 'Automated 16L battery boom sprayers, tractor-mounted HTP sprayers, and orchard mist blowers.',
    icon: 'drop',
    accentColor: '#0284c7',
    order: 4,
    subCategoryCount: 3,
    productCount: 28,
    featured: true,
    active: true,
    bannerUrl: '/brand/cat_sprayer.jpg',
  },
  {
    id: 'cat-spares',
    name: 'OEM Spare Parts & Consumables',
    slug: 'oem-spare-parts',
    code: 'CAT-SPAR',
    description: 'High-wear carbon steel blades, hydraulic seal kits, filters, PTO shafts, and cultivator tynes.',
    icon: 'gear',
    accentColor: '#475569',
    order: 5,
    subCategoryCount: 6,
    productCount: 64,
    featured: false,
    active: true,
    bannerUrl: '/brand/cat_spares.jpg',
  },
];

export const INITIAL_SUBCATEGORIES: SubCategory[] = [
  // Under Tractors
  {
    id: 'sub-trac-4wd',
    parentId: 'cat-tractors',
    parentName: 'Agro Tractors & Prime Movers',
    name: 'Heavy 4WD Field Tractors (55HP–90HP)',
    slug: 'heavy-4wd-tractors',
    code: 'SUB-TRAC-01',
    description: 'Dual clutch, planetary drive 4x4 tractors engineered for wet paddy puddling and deep plowing.',
    implementType: 'Cat-2 Three Point Hitch',
    productCount: 16,
    order: 1,
    active: true,
    minHPRange: '55-90 HP',
  },
  {
    id: 'sub-trac-compact',
    parentId: 'cat-tractors',
    parentName: 'Agro Tractors & Prime Movers',
    name: 'Compact Utility Tractors (25HP–45HP)',
    slug: 'compact-utility-tractors',
    code: 'SUB-TRAC-02',
    description: 'Nimble orchard and sugarcane inter-cultivation tractors with narrow wheel track.',
    implementType: 'Cat-1 Three Point Hitch',
    productCount: 14,
    order: 2,
    active: true,
    minHPRange: '25-45 HP',
  },
  {
    id: 'sub-trac-electric',
    parentId: 'cat-tractors',
    parentName: 'Agro Tractors & Prime Movers',
    name: 'Next-Gen Eco-Drive EV Tractors',
    slug: 'eco-drive-ev-tractors',
    code: 'SUB-TRAC-03',
    description: 'High-torque lithium phosphate electric tractors for indoor greenhouses and zero-emission farms.',
    implementType: 'Cat-1 Hitch & PTO',
    productCount: 8,
    order: 3,
    active: true,
    minHPRange: '30-50 HP Equivalent',
  },

  // Under Harvesters
  {
    id: 'sub-harv-track',
    parentId: 'cat-harvesters',
    parentName: 'Combine Harvesters & Reapers',
    name: 'Track-Type Rubber Crawler Harvesters',
    slug: 'crawler-harvesters',
    code: 'SUB-HARV-01',
    description: 'High-flotation rubber track combine harvesters for marshy deep wetland paddy fields.',
    implementType: 'Standard 7ft Cutter Bar',
    productCount: 12,
    order: 1,
    active: true,
    minHPRange: '70-105 HP',
  },
  {
    id: 'sub-harv-wheel',
    parentId: 'cat-harvesters',
    parentName: 'Combine Harvesters & Reapers',
    name: 'Wheel-Type Multi-Crop Combines',
    slug: 'wheel-combines',
    code: 'SUB-HARV-02',
    description: 'Self-propelled 4-wheel harvesters with grain tank unloaders for wheat, corn, and soy.',
    implementType: '10ft Grain Header',
    productCount: 10,
    order: 2,
    active: true,
    minHPRange: '75-120 HP',
  },

  // Under Tillers & Rotavators
  {
    id: 'sub-till-rotary',
    parentId: 'cat-tillers',
    parentName: 'Power Tillers & Rotavators',
    name: 'Multi-Speed Gear Drive Rotavators',
    slug: 'gear-drive-rotavators',
    code: 'SUB-TILL-01',
    description: 'Heavy duty Boron steel C & L blade rotavators with waterproof side gear drive.',
    implementType: 'Tractor PTO Driven (540 RPM)',
    productCount: 20,
    order: 1,
    active: true,
    minHPRange: '35-75 HP',
  },
  {
    id: 'sub-till-plough',
    parentId: 'cat-tillers',
    parentName: 'Power Tillers & Rotavators',
    name: 'Hydraulic Reversible MB Ploughs',
    slug: 'reversible-mb-ploughs',
    code: 'SUB-TILL-02',
    description: '2-bottom & 3-bottom laser cut mouldboard ploughs for trash inversion and weed burial.',
    implementType: 'Cat-2 Hydraulic 3-Point',
    productCount: 14,
    order: 2,
    active: true,
    minHPRange: '45-90 HP',
  },
  {
    id: 'sub-till-walking',
    parentId: 'cat-tillers',
    parentName: 'Power Tillers & Rotavators',
    name: 'Walking Power Tillers (12HP–16HP)',
    slug: 'walking-power-tillers',
    code: 'SUB-TILL-03',
    description: 'Self-propelled diesel tillers with rotary seat and deep trenching attachments for smallholders.',
    implementType: 'Direct Drive Tiller Bed',
    productCount: 12,
    order: 3,
    active: true,
    minHPRange: '12-16 HP',
  },

  // Under Sprayers
  {
    id: 'sub-spry-boom',
    parentId: 'cat-sprayers',
    parentName: 'Crop Protection & Sprayers',
    name: 'Tractor Mounted Boom Sprayers (400L–600L)',
    slug: 'tractor-boom-sprayers',
    code: 'SUB-SPRY-01',
    description: '12-meter hydraulic folding boom with anti-drip triplex nozzles and chemical induction hopper.',
    implementType: 'Rear 3-Point Mount + PTO Pump',
    productCount: 14,
    order: 1,
    active: true,
    minHPRange: '35-65 HP',
  },
  {
    id: 'sub-spry-portable',
    parentId: 'cat-sprayers',
    parentName: 'Crop Protection & Sprayers',
    name: 'Knapsack 16L Electric Battery Sprayers',
    slug: 'knapsack-battery-sprayers',
    code: 'SUB-SPRY-02',
    description: 'Dual-motor 12V 14Ah lithium battery sprayers with telescopic brass lance and pressure regulator.',
    implementType: 'Portable Backpack',
    productCount: 14,
    order: 2,
    active: true,
    minHPRange: 'Manual / Battery',
  },

  // Under Spares
  {
    id: 'sub-spar-blades',
    parentId: 'cat-spares',
    parentName: 'OEM Spare Parts & Consumables',
    name: 'Rotavator Blades & Cultivator Tynes',
    slug: 'blades-and-tynes',
    code: 'SUB-SPAR-01',
    description: 'High manganese Boron steel heat-treated blades certified for 500+ hours wear life.',
    implementType: 'Wear Part Fasteners',
    productCount: 32,
    order: 1,
    active: true,
  },
  {
    id: 'sub-spar-pto',
    parentId: 'cat-spares',
    parentName: 'OEM Spare Parts & Consumables',
    name: 'Splined PTO Drive Shafts & Clutches',
    slug: 'pto-drive-shafts',
    code: 'SUB-SPAR-02',
    description: 'Standard 6-spline Series 4, Series 6, and Series 8 PTO shafts with shear bolt overload safety.',
    implementType: '1-3/8" 6-Spline Quick Release',
    productCount: 18,
    order: 2,
    active: true,
  },
];

export const INITIAL_BRANDS: MachineryBrand[] = [
  { id: 'br-vels', name: 'Vels Agro Machinery', origin: 'Coimbatore, India', modelsCount: 8, tier: 'oem' },
  { id: 'br-captain', name: 'Captain Agro Power', origin: 'Rajkot, India', modelsCount: 4, tier: 'partner' },
  { id: 'br-fieldstar', name: 'Fieldstar Heavy Harvesters', origin: 'Ludhiana, India', modelsCount: 3, tier: 'partner' },
  { id: 'br-shakti', name: 'Shaktiman Compatible Matrix', origin: 'India', modelsCount: 12, tier: 'compatible' },
];

export const INITIAL_MACHINERY_MODELS: MachineryModel[] = [
  {
    id: 'mod-v45',
    brandId: 'br-vels',
    brandName: 'Vels Agro',
    name: 'Vels 45HP Compact Utility',
    modelCode: 'VELS-45-DI',
    horsePower: 45,
    driveType: '2WD',
    ptoRPM: 540,
    hitchCategory: 'Cat-1',
    price: 640000,
    imageUrl: '/brand/cat_tractor.jpg',
  },
  {
    id: 'mod-v55',
    brandId: 'br-vels',
    brandName: 'Vels Agro',
    name: 'Vels 55HP 4WD Heavy Agro',
    modelCode: 'VELS-55-4WD',
    horsePower: 55,
    driveType: '4WD',
    ptoRPM: 540,
    hitchCategory: 'Cat-2',
    price: 780000,
    imageUrl: '/brand/tractor_bg.jpg',
  },
  {
    id: 'mod-v75',
    brandId: 'br-vels',
    brandName: 'Vels Agro',
    name: 'Vels 75HP Turbo Multi-Crop',
    modelCode: 'VELS-75-TURBO',
    horsePower: 75,
    driveType: '4WD',
    ptoRPM: 1000,
    hitchCategory: 'Cat-2',
    price: 1120000,
    imageUrl: '/brand/cat_tractor.jpg',
  },
  {
    id: 'mod-capt28',
    brandId: 'br-captain',
    brandName: 'Captain Agro',
    name: 'Captain 28HP Orchard Special',
    modelCode: 'CAPT-28-MINI',
    horsePower: 28,
    driveType: '4WD',
    ptoRPM: 540,
    hitchCategory: 'Cat-1',
    price: 385000,
    imageUrl: '/brand/cat_tiller.jpg',
  },
  {
    id: 'mod-field90',
    brandId: 'br-fieldstar',
    brandName: 'Fieldstar',
    name: 'Fieldstar Multi-Crop Paddy Combine',
    modelCode: 'FSTAR-90-CRAWL',
    horsePower: 90,
    driveType: '4WD',
    ptoRPM: 1000,
    hitchCategory: 'Cat-3',
    price: 1850000,
    imageUrl: '/brand/cat_harvester.jpg',
  },
  {
    id: 'mod-shakti50',
    brandId: 'br-shakti',
    brandName: 'Shaktiman',
    name: 'Shaktiman 50HP Power Max',
    modelCode: 'SHAKTI-50-PRO',
    horsePower: 50,
    driveType: '2WD',
    ptoRPM: 540,
    hitchCategory: 'Cat-2',
    price: 695000,
    imageUrl: '/brand/cat_tractor.jpg',
  },
  {
    id: 'mod-v35',
    brandId: 'br-vels',
    brandName: 'Vels Agro',
    name: 'Vels 35HP Orchard Special',
    modelCode: 'VELS-35-ORC',
    horsePower: 35,
    driveType: '4WD',
    ptoRPM: 540,
    hitchCategory: 'Cat-1',
    price: 490000,
    imageUrl: '/brand/cat_tiller.jpg',
  },
  {
    id: 'mod-field105',
    brandId: 'br-fieldstar',
    brandName: 'Fieldstar',
    name: 'Fieldstar 105HP Track Combine',
    modelCode: 'FSTAR-105-PRO',
    horsePower: 105,
    driveType: '4WD',
    ptoRPM: 1000,
    hitchCategory: 'Cat-3',
    price: 2240000,
    imageUrl: '/brand/cat_harvester.jpg',
  },
];

export const INITIAL_IMPLEMENTS: ImplementAttachment[] = [
  { id: 'imp-rot7', name: 'Rotavator 7ft (Multi-Speed)', category: 'Soil Prep', minHP: 45, requiredPTO: 540, hitchType: 'Cat-2' },
  { id: 'imp-rot5', name: 'Rotavator 5ft (Compact)', category: 'Soil Prep', minHP: 28, requiredPTO: 540, hitchType: 'Cat-1' },
  { id: 'imp-mb2', name: '2-Bottom Reversible MB Plough', category: 'Deep Tillage', minHP: 40, requiredPTO: 0, hitchType: 'Cat-1 / Cat-2' },
  { id: 'imp-mb3', name: '3-Bottom Heavy Hydraulic Plough', category: 'Deep Tillage', minHP: 60, requiredPTO: 0, hitchType: 'Cat-2' },
  { id: 'imp-spry400', name: '400L Boom Sprayer (12m)', category: 'Crop Protection', minHP: 35, requiredPTO: 540, hitchType: 'Cat-1 / Cat-2' },
  { id: 'imp-spry600', name: '600L Heavy Orchard Sprayer', category: 'Crop Protection', minHP: 55, requiredPTO: 540, hitchType: 'Cat-2' },
  { id: 'imp-cult9', name: '9-Tyne Spring Cultivator', category: 'Secondary Tillage', minHP: 35, requiredPTO: 0, hitchType: 'Cat-1' },
  { id: 'imp-trail5t', name: 'Hydraulic Tipping Trailer (5-Ton)', category: 'Haulage', minHP: 45, requiredPTO: 0, hitchType: 'Drawbar Hitch' },
];

export const INITIAL_COMPATIBILITY_RULES: CompatibilityRule[] = [
  // Vels 45HP Compact Utility
  { modelId: 'mod-v45', implementId: 'imp-rot7', status: 'compatible', notes: 'Optimal fuel efficiency in light soil' },
  { modelId: 'mod-v45', implementId: 'imp-rot5', status: 'compatible', notes: 'Perfect match for inter-crop weed clearance' },
  { modelId: 'mod-v45', implementId: 'imp-mb2', status: 'compatible', notes: 'Standard Cat-1 linkage' },
  { modelId: 'mod-v45', implementId: 'imp-mb3', status: 'incompatible', notes: 'Requires minimum 60HP and Cat-2 hitch' },
  { modelId: 'mod-v45', implementId: 'imp-spry400', status: 'compatible', notes: 'Direct PTO drive at 540 RPM' },
  { modelId: 'mod-v45', implementId: 'imp-spry600', status: 'not_recommended', notes: 'Tank load requires 55HP tractor counter-balance' },
  { modelId: 'mod-v45', implementId: 'imp-cult9', status: 'compatible', notes: 'Recommended for dry land prep' },
  { modelId: 'mod-v45', implementId: 'imp-trail5t', status: 'compatible', notes: 'Hydraulic brake pipe connection available' },

  // Vels 55HP 4WD Heavy Agro
  { modelId: 'mod-v55', implementId: 'imp-rot7', status: 'compatible', notes: 'Ideal high-torque match for hard clay & wet paddy' },
  { modelId: 'mod-v55', implementId: 'imp-rot5', status: 'compatible', notes: 'Compatible' },
  { modelId: 'mod-v55', implementId: 'imp-mb2', status: 'compatible', notes: 'Effortless continuous plowing' },
  { modelId: 'mod-v55', implementId: 'imp-mb3', status: 'not_recommended', notes: 'Recommended with front ballast weights' },
  { modelId: 'mod-v55', implementId: 'imp-spry400', status: 'compatible', notes: 'Compatible' },
  { modelId: 'mod-v55', implementId: 'imp-spry600', status: 'compatible', notes: 'Full pressure misting operational' },
  { modelId: 'mod-v55', implementId: 'imp-cult9', status: 'compatible', notes: 'Compatible' },
  { modelId: 'mod-v55', implementId: 'imp-trail5t', status: 'compatible', notes: 'Dual-line air brake compatible' },

  // Vels 75HP Turbo Multi-Crop
  { modelId: 'mod-v75', implementId: 'imp-rot7', status: 'compatible', notes: 'Maximum throughput at low diesel burn' },
  { modelId: 'mod-v75', implementId: 'imp-rot5', status: 'compatible', notes: 'Compatible' },
  { modelId: 'mod-v75', implementId: 'imp-mb2', status: 'compatible', notes: 'Compatible' },
  { modelId: 'mod-v75', implementId: 'imp-mb3', status: 'compatible', notes: '100% optimal deep soil trash burial' },
  { modelId: 'mod-v75', implementId: 'imp-spry400', status: 'compatible', notes: 'Compatible' },
  { modelId: 'mod-v75', implementId: 'imp-spry600', status: 'compatible', notes: 'Handles heavy 600L orchard booms with ease' },
  { modelId: 'mod-v75', implementId: 'imp-cult9', status: 'compatible', notes: 'High speed run supported' },
  { modelId: 'mod-v75', implementId: 'imp-trail5t', status: 'compatible', notes: 'Up to 7-ton gross weight supported' },

  // Captain 28HP Orchard
  { modelId: 'mod-capt28', implementId: 'imp-rot7', status: 'incompatible', notes: 'Insufficient HP (<45HP required)' },
  { modelId: 'mod-capt28', implementId: 'imp-rot5', status: 'compatible', notes: 'Engineered for 28HP orchard tractors' },
  { modelId: 'mod-capt28', implementId: 'imp-mb2', status: 'not_recommended', notes: 'Recommended only in soft tilled soil' },
  { modelId: 'mod-capt28', implementId: 'imp-mb3', status: 'incompatible', notes: 'Exceeds lifting capacity' },
  { modelId: 'mod-capt28', implementId: 'imp-spry400', status: 'not_recommended', notes: 'Rear lift capacity boundary' },
  { modelId: 'mod-capt28', implementId: 'imp-spry600', status: 'incompatible', notes: 'Incompatible' },
  { modelId: 'mod-capt28', implementId: 'imp-cult9', status: 'not_recommended', notes: 'Recommend 5-tyne mini cultivator instead' },
  { modelId: 'mod-capt28', implementId: 'imp-trail5t', status: 'incompatible', notes: 'Trailer too heavy for 28HP chassis' },

  // Fieldstar 90HP Combine
  { modelId: 'mod-field90', implementId: 'imp-rot7', status: 'incompatible', notes: 'Harvester crawler unit - non-tractor PTO' },
  { modelId: 'mod-field90', implementId: 'imp-rot5', status: 'incompatible', notes: 'Incompatible' },
  { modelId: 'mod-field90', implementId: 'imp-mb2', status: 'incompatible', notes: 'Incompatible' },
  { modelId: 'mod-field90', implementId: 'imp-mb3', status: 'incompatible', notes: 'Incompatible' },
  { modelId: 'mod-field90', implementId: 'imp-spry400', status: 'incompatible', notes: 'Incompatible' },
  { modelId: 'mod-field90', implementId: 'imp-spry600', status: 'incompatible', notes: 'Incompatible' },
  { modelId: 'mod-field90', implementId: 'imp-cult9', status: 'incompatible', notes: 'Incompatible' },
  { modelId: 'mod-field90', implementId: 'imp-trail5t', status: 'compatible', notes: 'Heavy tow hitch supported' },
];
