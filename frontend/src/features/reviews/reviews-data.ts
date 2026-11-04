// Vels Agro Enterprise — Reviews & Ratings Data Store (Section 22)
// Real Tamil Nadu Agro Machinery Reviews, Verified Farmer Credentials, & Feedback Tickets

export interface ReviewItem {
  id: string;
  customerName: string;
  customerType: 'farmer' | 'dealer' | 'contractor';
  location: string;
  verifiedBuyer: boolean;
  verifiedFarmer: boolean;
  landholdingAcres?: number;
  productId: string;
  productName: string;
  productCategory: string;
  productImage: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  photos: string[];
  date: number; // timestamp
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  rejectionReason?: string;
  helpfulCount: number;
  adminReply?: {
    author: string;
    role: string;
    replyText: string;
    date: number;
  };
  tags: string[];
}

export interface FeedbackTicket {
  id: string;
  customerName: string;
  phone: string;
  village: string;
  district: string;
  machineModel: string;
  serialOrVin: string;
  category: 'service_request' | 'part_performance' | 'mileage_fuel' | 'hydraulic_issue' | 'delivery_feedback';
  subject: string;
  description: string;
  urgency: 'high' | 'medium' | 'standard';
  status: 'open' | 'in_progress' | 'resolved';
  createdDate: number;
  resolutionNotes?: string;
  assignedTechnician?: string;
  resolvedAt?: number;
}

const STORAGE_KEY_REVIEWS = 'vels_agro_reviews_v1';
const STORAGE_KEY_FEEDBACK = 'vels_agro_feedback_v1';

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-101',
    customerName: 'Thangavelu K.',
    customerType: 'farmer',
    location: 'Kodumudi, Erode, Tamil Nadu',
    verifiedBuyer: true,
    verifiedFarmer: true,
    landholdingAcres: 20,
    productId: 'ag-tr-454wd',
    productName: 'Vels Bull 45HP 4WD Agro Tractor',
    productCategory: 'Tractor 4WD',
    productImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Superb wet soil pulling power and low diesel consumption',
    comment: 'We purchased this tractor for sugarcane and turmeric farming. In Kodumudi Cauvery basin wet fields, the 4WD grip is rock solid without slippage. Fuel burn is around 3.2 litres/hour with 7ft rotavator. PACB subsidy clearance was smooth.',
    photos: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&auto=format&fit=crop&q=80',
    ],
    date: Date.now() - 2 * 24 * 3600 * 1000,
    status: 'approved',
    helpfulCount: 24,
    adminReply: {
      author: 'Vels Engineering Care',
      role: 'Chief Agronomist & Service Lead',
      replyText: 'Thank you Thangavelu sir! Delighted to see our 45HP 4WD Bull perform exceptionally in your Kodumudi sugarcane fields. Your complimentary 50-hour engine oil inspection is scheduled for next Tuesday.',
      date: Date.now() - 1 * 24 * 3600 * 1000,
    },
    tags: ['Heavy Pulling', 'Fuel Efficient', '4WD Wet Field', 'PACB Subsidy'],
  },
  {
    id: 'rev-102',
    customerName: 'Selvakumar Palanisamy',
    customerType: 'farmer',
    location: 'Kangeyam Road, Tiruppur, Tamil Nadu',
    verifiedBuyer: true,
    verifiedFarmer: true,
    landholdingAcres: 18,
    productId: 'ag-rot-7ft',
    productName: 'Vels 7ft Heavy Duty Rotavator',
    productCategory: 'Rotavator',
    productImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Boron steel L-blades pulverize sugarcane stumps with ease',
    comment: 'The heavy cast multi-speed gearbox runs super silent on 540 RPM PTO. We tilled 18 acres of red gravelly soil without a single bolt loose. Blade wear is practically zero after 45 hours.',
    photos: [],
    date: Date.now() - 4 * 24 * 3600 * 1000,
    status: 'approved',
    helpfulCount: 19,
    adminReply: {
      author: 'Vels Quality Division',
      role: 'Implements Technical Team',
      replyText: 'Glad to hear that, Selvakumar sir! Our Italian-spec boron blades are specifically heat-treated for tough Deccan red soils.',
      date: Date.now() - 3 * 24 * 3600 * 1000,
    },
    tags: ['Boron Steel Blades', 'Multi-Speed Gearbox', 'Zero Vibration'],
  },
  {
    id: 'rev-103',
    customerName: 'Muthuvelan Ramanathan',
    customerType: 'farmer',
    location: 'Thiruvidaimarudur, Thanjavur, Tamil Nadu',
    verifiedBuyer: true,
    verifiedFarmer: true,
    landholdingAcres: 24,
    productId: 'ag-spr-600l',
    productName: 'Vels 600L Tractor Mounted Boom Sprayer',
    productCategory: 'Sprayers',
    productImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=200&auto=format&fit=crop&q=80',
    rating: 4,
    title: 'Fast coverage across 20 acres paddy, need Tamil nozzle chart',
    comment: 'Covers 15 to 20 acres per morning shift with uniform misting. Nozzle pressure gauge is very accurate. Would appreciate a printed Tamil calibration chart for delta crop pest control mixtures.',
    photos: [
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&auto=format&fit=crop&q=80',
    ],
    date: Date.now() - 6 * 24 * 3600 * 1000,
    status: 'pending',
    helpfulCount: 11,
    tags: ['Paddy Protection', 'Delta Farming', 'Uniform Misting'],
  },
  {
    id: 'rev-104',
    customerName: 'Balwinder Singh Dhillon',
    customerType: 'farmer',
    location: 'Batala, Gurdaspur, Punjab',
    verifiedBuyer: true,
    verifiedFarmer: true,
    landholdingAcres: 45,
    productId: 'ag-lvl-pro',
    productName: 'Vels Laser Land Leveler Pro-X',
    productCategory: 'Land Leveler',
    productImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Saved 25% canal irrigation water on wheat field',
    comment: 'The laser mast transmitter has 800m range and works flawlessly in morning fog. Hydrolink valve responds instantly to gradient changes. Best leveler in Indian market.',
    photos: [],
    date: Date.now() - 9 * 24 * 3600 * 1000,
    status: 'approved',
    helpfulCount: 37,
    tags: ['Laser Guided', 'Water Conservation', 'Wheat Farming'],
  },
  {
    id: 'rev-105',
    customerName: 'Arumugam Karuppan',
    customerType: 'farmer',
    location: 'Kariyapatti, Virudhunagar, Tamil Nadu',
    verifiedBuyer: true,
    verifiedFarmer: true,
    landholdingAcres: 12,
    productId: 'ag-sd-2row',
    productName: 'Vels 2-Row Seed Drill (Manual/Tractor)',
    productCategory: 'Planters & Drills',
    productImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=200&auto=format&fit=crop&q=80',
    rating: 2,
    title: 'Seed meter plate tension was tight for small cotton seeds',
    comment: 'The seed roller jammed once during cotton sowing in Virudhunagar red loam. Local mechanic helped loosen the drive chain tension. Machine is sturdy but needs factory preset check.',
    photos: [],
    date: Date.now() - 11 * 24 * 3600 * 1000,
    status: 'flagged',
    helpfulCount: 5,
    tags: ['Cotton Sowing', 'Seed Meter', 'Needs Calibration'],
  },
  {
    id: 'rev-106',
    customerName: 'Suresh Gowda',
    customerType: 'farmer',
    location: 'Bhadravati, Shimoga, Karnataka',
    verifiedBuyer: true,
    verifiedFarmer: true,
    landholdingAcres: 32,
    productId: 'ag-spr-orch400',
    productName: 'Vels High-Pressure Orchard Sprayer 400L',
    productCategory: 'Sprayers',
    productImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Ceramic nozzles reach top of Arecanut and coffee canopy',
    comment: '35 bar working pressure with triple ceramic nozzles gives ultra-fine droplet spectrum. High penetration through dense coffee shade trees without pesticide wastage.',
    photos: [],
    date: Date.now() - 14 * 24 * 3600 * 1000,
    status: 'approved',
    helpfulCount: 16,
    tags: ['Arecanut Orchard', 'Coffee Canopy', 'High Bar Pressure'],
  },
  {
    id: 'rev-107',
    customerName: 'Kavitha Agro Traders',
    customerType: 'dealer',
    location: 'Pollachi Road, Coimbatore, Tamil Nadu',
    verifiedBuyer: true,
    verifiedFarmer: false,
    productId: 'ag-rot-7ft',
    productName: 'Vels 7ft Heavy Duty Rotavator',
    productCategory: 'Rotavator',
    productImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'High dealer margins and exceptional customer re-orders',
    comment: 'Sold 14 units across Pollachi and Udumalaipettai belt. Farmers love the low noise helical crown pinion bevel gear. Zero warranty claims so far.',
    photos: [],
    date: Date.now() - 18 * 24 * 3600 * 1000,
    status: 'approved',
    helpfulCount: 29,
    tags: ['Dealer Bulk Order', 'Zero Warranty Claim', 'Helical Gear'],
  },
  {
    id: 'rev-108',
    customerName: 'Murugan Shanmugam',
    customerType: 'farmer',
    location: 'Omalur, Salem, Tamil Nadu',
    verifiedBuyer: true,
    verifiedFarmer: true,
    landholdingAcres: 10,
    productId: 'ag-tr-orch24',
    productName: 'Vels 35HP Compact Orchard Tractor',
    productCategory: 'Tractor 4WD',
    productImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&auto=format&fit=crop&q=80',
    rating: 1,
    title: 'Logistics lorry delayed delivery by 5 days from Coimbatore',
    comment: 'Tractor is in excellent brand-new condition, but the contracted freight carrier sat in hub for 5 extra days during peak planting week.',
    photos: [],
    date: Date.now() - 21 * 24 * 3600 * 1000,
    status: 'pending',
    helpfulCount: 4,
    tags: ['Freight Delay', 'Carrier Feedback'],
  },
];

export const INITIAL_FEEDBACK: FeedbackTicket[] = [
  {
    id: 'FB-901',
    customerName: 'Arumugam Karuppan',
    phone: '+91 97860 12345',
    village: 'Kariyapatti',
    district: 'Virudhunagar',
    machineModel: 'Vels 2-Row Seed Drill (Manual/Tractor)',
    serialOrVin: 'SD-2026-VIR-091',
    category: 'part_performance',
    subject: 'Seed Meter Roller Calibration & Roller Tension',
    description: 'Cotton seeds spacing had minor unevenness in dry soil. Need technical assistance on seed disc selector plate replacement.',
    urgency: 'high',
    status: 'open',
    createdDate: Date.now() - 1 * 24 * 3600 * 1000,
  },
  {
    id: 'FB-902',
    customerName: 'Muthuvelan Ramanathan',
    phone: '+91 94431 82710',
    village: 'Thiruvidaimarudur',
    district: 'Thanjavur',
    machineModel: 'Vels 600L Tractor Mounted Boom Sprayer',
    serialOrVin: 'SPR-600-TJR-442',
    category: 'service_request',
    subject: 'Tamil Language Calibration Guide & Nozzle Tips',
    description: 'Requested booklet copy of Tamil delta paddy chemical spraying dosage and PTO pressure chart.',
    urgency: 'medium',
    status: 'resolved',
    createdDate: Date.now() - 5 * 24 * 3600 * 1000,
    resolutionNotes: 'Tamil agricultural spray guide PDF and laminated chart dispatched via courier + WhatsApp copy sent.',
    assignedTechnician: 'R. Veeramani (Delta Field Service)',
    resolvedAt: Date.now() - 4 * 24 * 3600 * 1000,
  },
  {
    id: 'FB-903',
    customerName: 'Senthil Nathan',
    phone: '+91 98421 99182',
    village: 'Harur',
    district: 'Dharmapuri',
    machineModel: 'Vels Bull 45HP 4WD Agro Tractor',
    serialOrVin: 'TR-45-DHP-1104',
    category: 'hydraulic_issue',
    subject: 'Auxiliary Hydraulic Quick-Release Coupler O-Ring',
    description: 'Minor hydraulic weeping observed near rear spool valve when tipping high-sided mango trailer.',
    urgency: 'medium',
    status: 'in_progress',
    createdDate: Date.now() - 3 * 24 * 3600 * 1000,
    assignedTechnician: 'K. Balaji (Mobile Service Van 3)',
  },
  {
    id: 'FB-904',
    customerName: 'Perumal Gurusamy',
    phone: '+91 94432 10874',
    village: 'Usilampatti',
    district: 'Madurai',
    machineModel: 'Vels 7ft Heavy Duty Rotavator',
    serialOrVin: 'ROT-7FT-MDU-872',
    category: 'service_request',
    subject: 'First 50-Hour PTO Gearbox Oil Change & Free Inspection',
    description: 'Completed 50 hours of ground preparation for cotton crop. Requesting scheduled on-farm technician visit.',
    urgency: 'high',
    status: 'open',
    createdDate: Date.now() - 12 * 3600 * 1000,
  },
];

export function getStoredReviews(): ReviewItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored reviews', e);
  }
  return [...INITIAL_REVIEWS];
}

export function saveStoredReviews(items: ReviewItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save reviews', e);
  }
}

export function getStoredFeedback(): FeedbackTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDBACK);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored feedback', e);
  }
  return [...INITIAL_FEEDBACK];
}

export function saveStoredFeedback(items: FeedbackTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save feedback', e);
  }
}
