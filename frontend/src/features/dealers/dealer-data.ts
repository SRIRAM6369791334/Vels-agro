// Vels Agro — Enterprise Dealer Network & Management Seed Data
// Realistic Indian Agricultural Machinery & Equipment Dealerships

export interface Dealer {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string;
  gstin: string;
  hubId: string;
  status: 'active' | 'pending' | 'rejected' | 'inactive';
  registrationDate: string;
  approvedAt?: string;
  rejectionReason?: string;
  pricingTier: 'platinum' | 'gold' | 'silver' | 'standard';
  discountPct: number;
  creditLimit: number;
  creditUsed: number;
  annualSalesTarget: number;
  salesYTD: number;
  stock: Record<string, number>;
  ordersCount: number;
}

export interface DealerTransfer {
  id: string;
  number: string;
  dealerId: string;
  dealerName: string;
  fromLocId: string;
  fromLocName: string;
  createdAt: string;
  expectedAt: string;
  status: 'draft' | 'dispatched' | 'received' | 'cancelled';
  carrier: string;
  trackingNumber: string;
  items: {
    productId: string;
    productName: string;
    units: number;
    unitPrice: number;
  }[];
  totalUnits: number;
  totalValue: number;
  notes?: string;
}

export interface DealerCount {
  id: string;
  number: string;
  dealerId: string;
  dealerName: string;
  scheduledDate: string;
  auditorName: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  lines: {
    productId: string;
    productName: string;
    systemUnits: number;
    countedUnits: number;
    variance: number;
    unitPrice: number;
  }[];
  varianceUnits: number;
  varianceValue: number;
  completedAt?: string;
}

export const INITIAL_DEALERS: Dealer[] = [
  {
    id: 'dlr-01',
    code: 'VELS-DLR-TN01',
    name: 'Kovai Agro Machineries & Implements',
    contactPerson: 'R. Sundaram',
    phone: '+91 98421 77210',
    email: 'sundaram@kovaiagro.in',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '42, Pollachi Main Road, Eachanari, Coimbatore - 641021',
    gstin: '33AABCV1234F1Z8',
    hubId: 'dc',
    status: 'active',
    registrationDate: '2025-04-12',
    approvedAt: '2025-04-15',
    pricingTier: 'platinum',
    discountPct: 25,
    creditLimit: 7500000,
    creditUsed: 2240000,
    annualSalesTarget: 18000000,
    salesYTD: 14850000,
    stock: {
      'p-01': 14,
      'p-02': 18,
      'p-03': 8,
      'p-04': 22,
    },
    ordersCount: 38,
  },
  {
    id: 'dlr-02',
    code: 'VELS-DLR-TN02',
    name: 'Delta Agri Farm Equipments',
    contactPerson: 'K. Meenakshi Sundaram',
    phone: '+91 94432 88419',
    email: 'orders@deltaagri.com',
    city: 'Thanjavur',
    state: 'Tamil Nadu',
    address: '118, Medical College Road, Thanjavur - 613007',
    gstin: '33AABCM9876E1Z4',
    hubId: 'dc',
    status: 'active',
    registrationDate: '2025-06-19',
    approvedAt: '2025-06-22',
    pricingTier: 'gold',
    discountPct: 20,
    creditLimit: 5000000,
    creditUsed: 1420000,
    annualSalesTarget: 12500000,
    salesYTD: 10240000,
    stock: {
      'p-01': 8,
      'p-02': 12,
      'p-03': 15,
      'p-04': 10,
    },
    ordersCount: 26,
  },
  {
    id: 'dlr-03',
    code: 'VELS-DLR-PB01',
    name: 'Punjab Tractors & Harvest Tech',
    contactPerson: 'Harpreet Singh Dhillon',
    phone: '+91 98140 22391',
    email: 'hsingh@punjabtractors.net',
    city: 'Ludhiana',
    state: 'Punjab',
    address: 'Plot 76, GT Road By-pass, Dhandari Kalan, Ludhiana - 141010',
    gstin: '03AACPT4512K1ZQ',
    hubId: 'dc',
    status: 'active',
    registrationDate: '2025-02-10',
    approvedAt: '2025-02-12',
    pricingTier: 'platinum',
    discountPct: 25,
    creditLimit: 10000000,
    creditUsed: 3800000,
    annualSalesTarget: 24000000,
    salesYTD: 21300000,
    stock: {
      'p-01': 22,
      'p-02': 25,
      'p-03': 14,
      'p-04': 30,
    },
    ordersCount: 52,
  },
  {
    id: 'dlr-04',
    code: 'VELS-DLR-MH01',
    name: 'Deccan Krishi Yantra Kendra',
    contactPerson: 'Anand V. Patil',
    phone: '+91 98220 54109',
    email: 'anand@deccankrishi.in',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Gate 45, Pune-Solapur Highway, Hadapsar, Pune - 411028',
    gstin: '27AABCD6789L1Z5',
    hubId: 'dc',
    status: 'active',
    pricingTier: 'gold',
    discountPct: 20,
    registrationDate: '2025-07-04',
    approvedAt: '2025-07-07',
    creditLimit: 6000000,
    creditUsed: 1950000,
    annualSalesTarget: 14000000,
    salesYTD: 11800000,
    stock: {
      'p-01': 10,
      'p-02': 14,
      'p-03': 9,
      'p-04': 18,
    },
    ordersCount: 31,
  },
  {
    id: 'dlr-05',
    code: 'VELS-DLR-GJ01',
    name: 'Saurashtra Agro Power Implements',
    contactPerson: 'Bhavikbhai Patel',
    phone: '+91 98242 11984',
    email: 'bhavik@saurashtraagro.com',
    city: 'Rajkot',
    state: 'Gujarat',
    address: 'Shapar Industrial Zone, Gondal Road, Rajkot - 360024',
    gstin: '24AABCS3321P1Z9',
    hubId: 'dc',
    status: 'active',
    registrationDate: '2025-09-12',
    approvedAt: '2025-09-15',
    pricingTier: 'silver',
    discountPct: 15,
    creditLimit: 4500000,
    creditUsed: 1100000,
    annualSalesTarget: 10000000,
    salesYTD: 8200000,
    stock: {
      'p-01': 6,
      'p-02': 10,
      'p-03': 7,
      'p-04': 12,
    },
    ordersCount: 22,
  },
  {
    id: 'dlr-06',
    code: 'VELS-DLR-KA01',
    name: 'Kisan Power Hub & Machinery',
    contactPerson: 'Suresh Kumar B.',
    phone: '+91 94481 67320',
    email: 'kisanpower.hubli@gmail.com',
    city: 'Hubli',
    state: 'Karnataka',
    address: 'Tarihal Industrial Estate, Airport Road, Hubli - 580026',
    gstin: '29AABCK5543D1Z2',
    hubId: 'dc',
    status: 'active',
    registrationDate: '2025-10-01',
    approvedAt: '2025-10-04',
    pricingTier: 'gold',
    discountPct: 20,
    creditLimit: 5500000,
    creditUsed: 1600000,
    annualSalesTarget: 13000000,
    salesYTD: 9800000,
    stock: {
      'p-01': 9,
      'p-02': 15,
      'p-03': 11,
      'p-04': 14,
    },
    ordersCount: 25,
  },
  {
    id: 'dlr-07',
    code: 'VELS-DLR-AP01',
    name: 'Krishna Godavari Agro Tech',
    contactPerson: 'Ch. Venkata Rao',
    phone: '+91 98480 33145',
    email: 'venkat@krishnaagro.org',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    address: 'Autonagar Main Road, Near Ring Center, Vijayawada - 520007',
    gstin: '37AABCK8891M1Z1',
    hubId: 'dc',
    status: 'active',
    registrationDate: '2025-11-15',
    approvedAt: '2025-11-18',
    pricingTier: 'silver',
    discountPct: 15,
    creditLimit: 4000000,
    creditUsed: 920000,
    annualSalesTarget: 9000000,
    salesYTD: 7100000,
    stock: {
      'p-01': 5,
      'p-02': 8,
      'p-03': 6,
      'p-04': 11,
    },
    ordersCount: 18,
  },
  {
    id: 'dlr-08',
    code: 'VELS-DLR-MP01',
    name: 'Malwa Agro Machinery Mart',
    contactPerson: 'Deepak Sharma',
    phone: '+91 94250 89123',
    email: 'deepak@malwaagro.in',
    city: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Sanwer Road Industrial Area, Sector C, Indore - 452015',
    gstin: '23AABCM1122N1Z6',
    hubId: 'dc',
    status: 'active',
    registrationDate: '2025-12-05',
    approvedAt: '2025-12-08',
    pricingTier: 'gold',
    discountPct: 20,
    creditLimit: 5000000,
    creditUsed: 1350000,
    annualSalesTarget: 11500000,
    salesYTD: 8900000,
    stock: {
      'p-01': 8,
      'p-02': 11,
      'p-03': 9,
      'p-04': 13,
    },
    ordersCount: 20,
  },
  // PENDING REGISTRATIONS (Admin Can Review & Approve/Reject)
  {
    id: 'dlr-09',
    code: 'VELS-DLR-UP01',
    name: 'Ganga Valley Farm Machineries',
    contactPerson: 'Vipin Bihari Tiwari',
    phone: '+91 94152 77801',
    email: 'vipin@gangafarmtech.com',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    address: 'Ramnagar Industrial Area, Phase II, Varanasi - 221008',
    gstin: '09AABCG4432T1Z7',
    hubId: 'dc',
    status: 'pending',
    registrationDate: '2026-10-24',
    pricingTier: 'standard',
    discountPct: 15,
    creditLimit: 3500000,
    creditUsed: 0,
    annualSalesTarget: 8000000,
    salesYTD: 0,
    stock: {
      'p-01': 0,
      'p-02': 0,
      'p-03': 0,
      'p-04': 0,
    },
    ordersCount: 0,
  },
  {
    id: 'dlr-10',
    code: 'VELS-DLR-KA02',
    name: 'Cauvery Agri-Drive Tractors',
    contactPerson: 'B. M. Siddaraju',
    phone: '+91 98450 12890',
    email: 'siddaraju@cauveryagri.com',
    city: 'Mysuru',
    state: 'Karnataka',
    address: 'Bannur Road, Alanahalli, Mysuru - 570028',
    gstin: '29AABCC7711B1Z3',
    hubId: 'dc',
    status: 'pending',
    registrationDate: '2026-10-28',
    pricingTier: 'standard',
    discountPct: 15,
    creditLimit: 3000000,
    creditUsed: 0,
    annualSalesTarget: 7500000,
    salesYTD: 0,
    stock: {
      'p-01': 0,
      'p-02': 0,
      'p-03': 0,
      'p-04': 0,
    },
    ordersCount: 0,
  },
  {
    id: 'dlr-11',
    code: 'VELS-DLR-HR01',
    name: 'Karnal Kisan Agro Implements',
    contactPerson: 'Rajender Choudhary',
    phone: '+91 98960 45678',
    email: 'karnalkisan@agrodealers.in',
    city: 'Karnal',
    state: 'Haryana',
    address: 'Near New Anaj Mandi, Kunjpura Road, Karnal - 132001',
    gstin: '06AABCK9901E1Z0',
    hubId: 'dc',
    status: 'pending',
    registrationDate: '2026-11-01',
    pricingTier: 'standard',
    discountPct: 15,
    creditLimit: 4000000,
    creditUsed: 0,
    annualSalesTarget: 9500000,
    salesYTD: 0,
    stock: {
      'p-01': 0,
      'p-02': 0,
      'p-03': 0,
      'p-04': 0,
    },
    ordersCount: 0,
  },
  // REJECTED / INACTIVE
  {
    id: 'dlr-12',
    code: 'VELS-DLR-GJ02',
    name: 'Apex Bio-Tractor Agency',
    contactPerson: 'Kirit M. Shah',
    phone: '+91 98790 33452',
    email: 'apex@biotractors.in',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: 'Changodar Industrial Estate, Sanand Road, Ahmedabad - 382213',
    gstin: '24AABCA6655H1Z1',
    hubId: 'dc',
    status: 'rejected',
    registrationDate: '2026-09-02',
    rejectionReason: 'GSTIN verification mismatch and insufficient showroom yard frontage (<4,000 sq.ft)',
    pricingTier: 'standard',
    discountPct: 10,
    creditLimit: 0,
    creditUsed: 0,
    annualSalesTarget: 5000000,
    salesYTD: 0,
    stock: {},
    ordersCount: 0,
  },
];

export const INITIAL_DEALER_TRANSFERS: DealerTransfer[] = [
  {
    id: 'dtr-01',
    number: 'DTR-2026-081',
    dealerId: 'dlr-01',
    dealerName: 'Kovai Agro Machineries & Implements',
    fromLocId: 'dc',
    fromLocName: 'Vels Central DC & Yard',
    createdAt: '2026-10-30',
    expectedAt: '2026-11-02',
    status: 'dispatched',
    carrier: 'VRL Logistics (Heavy Haul)',
    trackingNumber: 'VRL-TN-884910',
    items: [
      { productId: 'p-01', productName: 'Vels 55HP 4WD Agro Tractor', units: 4, unitPrice: 780000 },
      { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator (7ft)', units: 6, unitPrice: 115000 },
      { productId: 'p-04', productName: 'Automated 16L Boom Sprayer Kit', units: 10, unitPrice: 28000 },
    ],
    totalUnits: 20,
    totalValue: 4090000,
    notes: 'Kovai regional festive stock allocation. Dispatched on low-bed trailer.',
  },
  {
    id: 'dtr-02',
    number: 'DTR-2026-082',
    dealerId: 'dlr-03',
    dealerName: 'Punjab Tractors & Harvest Tech',
    fromLocId: 'dc',
    fromLocName: 'Vels Central DC & Yard',
    createdAt: '2026-10-28',
    expectedAt: '2026-11-03',
    status: 'dispatched',
    carrier: 'TCI Freight Express',
    trackingNumber: 'TCI-PB-994120',
    items: [
      { productId: 'p-01', productName: 'Vels 55HP 4WD Agro Tractor', units: 6, unitPrice: 780000 },
      { productId: 'p-03', productName: 'High-Yield Paddy Combine Harvester', units: 2, unitPrice: 1650000 },
      { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator (7ft)', units: 8, unitPrice: 115000 },
    ],
    totalUnits: 16,
    totalValue: 8900000,
    notes: 'Paddy harvesting seasonal dispatch for Ludhiana hub.',
  },
  {
    id: 'dtr-03',
    number: 'DTR-2026-079',
    dealerId: 'dlr-04',
    dealerName: 'Deccan Krishi Yantra Kendra',
    fromLocId: 'dc',
    fromLocName: 'Vels Central DC & Yard',
    createdAt: '2026-10-18',
    expectedAt: '2026-10-22',
    status: 'received',
    carrier: 'GATI KWE Commercial',
    trackingNumber: 'GATI-MH-552109',
    items: [
      { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator (7ft)', units: 5, unitPrice: 115000 },
      { productId: 'p-04', productName: 'Automated 16L Boom Sprayer Kit', units: 12, unitPrice: 28000 },
    ],
    totalUnits: 17,
    totalValue: 911000,
    notes: 'Received in full by Pune yard manager. Inspection passed.',
  },
  {
    id: 'dtr-04',
    number: 'DTR-2026-078',
    dealerId: 'dlr-05',
    dealerName: 'Saurashtra Agro Power Implements',
    fromLocId: 'dc',
    fromLocName: 'Vels Central DC & Yard',
    createdAt: '2026-10-14',
    expectedAt: '2026-10-18',
    status: 'received',
    carrier: 'VRL Logistics',
    trackingNumber: 'VRL-GJ-441200',
    items: [
      { productId: 'p-01', productName: 'Vels 55HP 4WD Agro Tractor', units: 3, unitPrice: 780000 },
      { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator (7ft)', units: 4, unitPrice: 115000 },
    ],
    totalUnits: 7,
    totalValue: 2800000,
    notes: 'Delivered and acknowledged by Rajkot showroom.',
  },
  {
    id: 'dtr-05',
    number: 'DTR-2026-085',
    dealerId: 'dlr-02',
    dealerName: 'Delta Agri Farm Equipments',
    fromLocId: 'dc',
    fromLocName: 'Vels Central DC & Yard',
    createdAt: '2026-11-03',
    expectedAt: '2026-11-06',
    status: 'draft',
    carrier: 'Direct Factory Flatbed',
    trackingNumber: 'PENDING',
    items: [
      { productId: 'p-03', productName: 'High-Yield Paddy Combine Harvester', units: 3, unitPrice: 1650000 },
      { productId: 'p-04', productName: 'Automated 16L Boom Sprayer Kit', units: 15, unitPrice: 28000 },
    ],
    totalUnits: 18,
    totalValue: 5370000,
    notes: 'Awaiting shipping bay allocation for Thanjavur Cauvery delta dispatch.',
  },
];

export const INITIAL_DEALER_COUNTS: DealerCount[] = [
  {
    id: 'dct-01',
    number: 'DCT-2026-031',
    dealerId: 'dlr-01',
    dealerName: 'Kovai Agro Machineries · Coimbatore',
    scheduledDate: '2026-11-04',
    auditorName: 'S. Ramanathan (Territory Service Mgr)',
    status: 'in_progress',
    lines: [
      { productId: 'p-01', productName: 'Vels 55HP 4WD Agro Tractor', systemUnits: 14, countedUnits: 14, variance: 0, unitPrice: 780000 },
      { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator', systemUnits: 18, countedUnits: 18, variance: 0, unitPrice: 115000 },
      { productId: 'p-03', productName: 'Paddy Combine Harvester', systemUnits: 8, countedUnits: 8, variance: 0, unitPrice: 1650000 },
      { productId: 'p-04', productName: 'Automated 16L Boom Sprayer', systemUnits: 22, countedUnits: 21, variance: -1, unitPrice: 28000 },
    ],
    varianceUnits: -1,
    varianceValue: -28000,
  },
  {
    id: 'dct-02',
    number: 'DCT-2026-029',
    dealerId: 'dlr-03',
    dealerName: 'Punjab Tractors & Harvest Tech · Ludhiana',
    scheduledDate: '2026-10-31',
    auditorName: 'H. Singh (Audit Lead)',
    status: 'completed',
    lines: [
      { productId: 'p-01', productName: 'Vels 55HP 4WD Agro Tractor', systemUnits: 22, countedUnits: 22, variance: 0, unitPrice: 780000 },
      { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator', systemUnits: 25, countedUnits: 25, variance: 0, unitPrice: 115000 },
      { productId: 'p-03', productName: 'Paddy Combine Harvester', systemUnits: 14, countedUnits: 14, variance: 0, unitPrice: 1650000 },
      { productId: 'p-04', productName: 'Automated 16L Boom Sprayer', systemUnits: 30, countedUnits: 30, variance: 0, unitPrice: 28000 },
    ],
    varianceUnits: 0,
    varianceValue: 0,
    completedAt: '2026-10-31',
  },
  {
    id: 'dct-03',
    number: 'DCT-2026-032',
    dealerId: 'dlr-04',
    dealerName: 'Deccan Krishi Yantra · Pune',
    scheduledDate: '2026-11-06',
    auditorName: 'A. Deshmukh (Regional Auditor)',
    status: 'scheduled',
    lines: [
      { productId: 'p-01', productName: 'Vels 55HP 4WD Agro Tractor', systemUnits: 10, countedUnits: 0, variance: 0, unitPrice: 780000 },
      { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator', systemUnits: 14, countedUnits: 0, variance: 0, unitPrice: 115000 },
      { productId: 'p-03', productName: 'Paddy Combine Harvester', systemUnits: 9, countedUnits: 0, variance: 0, unitPrice: 1650000 },
      { productId: 'p-04', productName: 'Automated 16L Boom Sprayer', systemUnits: 18, countedUnits: 0, variance: 0, unitPrice: 28000 },
    ],
    varianceUnits: 0,
    varianceValue: 0,
  },
];
