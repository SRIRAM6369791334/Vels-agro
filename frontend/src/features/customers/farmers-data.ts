// Vels Agro Enterprise — Farmer Customer Database Model (Section 11)
// Landholdings, Crop Portfolios, Machinery Assets, Purchase Histories & KYC Verification

export interface FarmerCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  village: string;
  district: string;
  state: string;
  landHoldingAcres: number;
  primaryCrops: string[];
  machineryOwned: string[];
  kisanCreditCardNo?: string;
  pattadharPassbookNo?: string;
  aadhaarLast4?: string;
  ordersCount: number;
  totalSpent: number;
  isActive: boolean;
  kycVerified: boolean;
  registeredDate: number;
  soilType: string;
  notes: string;
}

const NOW = Date.now();
const DAY_MS = 86400000;

export const INITIAL_FARMERS: FarmerCustomer[] = [
  {
    id: 'c-farmer-01',
    name: 'Selvakumar Palanisamy',
    phone: '+91 98421 77301',
    email: 'selvakumar.muthur@gmail.com',
    village: 'Muthur, Kangeyam Road',
    district: 'Tiruppur',
    state: 'Tamil Nadu',
    landHoldingAcres: 18,
    primaryCrops: ['Sugarcane', 'Cotton', 'Maize'],
    machineryOwned: ['Vels Bull 45HP 2WD Tractor', '5ft Cultivator'],
    kisanCreditCardNo: 'KCC-IOB-8819204',
    pattadharPassbookNo: 'PATTA-TPR-9941',
    aadhaarLast4: '4819',
    ordersCount: 2,
    totalSpent: 782800,
    isActive: true,
    kycVerified: true,
    registeredDate: NOW - 120 * DAY_MS,
    soilType: 'Red Loam & Black Soil',
    notes: 'Progressive sugarcane grower; PACB cooperative farm mechanization loan approved.',
  },
  {
    id: 'c-farmer-02',
    name: 'Muthuvelan Ramanathan',
    phone: '+91 94431 82710',
    email: 'muthu.delta@gmail.com',
    village: 'Thiruvidaimarudur',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    landHoldingAcres: 24,
    primaryCrops: ['Paddy (Kuruvai)', 'Black Gram', 'Banana'],
    machineryOwned: ['5ft Rotary Tiller', '600L Boom Sprayer'],
    kisanCreditCardNo: 'KCC-CANARA-441920',
    pattadharPassbookNo: 'PATTA-TJR-7721',
    aadhaarLast4: '9104',
    ordersCount: 3,
    totalSpent: 215000,
    isActive: true,
    kycVerified: true,
    registeredDate: NOW - 95 * DAY_MS,
    soilType: 'Cauvery Alluvial Clay',
    notes: 'Major paddy grower in Cauvery delta basin; custom hiring implement operator.',
  },
  {
    id: 'c-farmer-03',
    name: 'Suresh Gowda',
    phone: '+91 99014 43219',
    email: 'gowda.plantations@gmail.com',
    village: 'Bhadravati Bypass',
    district: 'Shimoga',
    state: 'Karnataka',
    landHoldingAcres: 32,
    primaryCrops: ['Arecanut', 'Intercrop Coffee', 'Cardamom'],
    machineryOwned: ['7ft Heavy Duty Rotavator', 'High-Pressure Orchard Sprayer'],
    kisanCreditCardNo: 'KCC-SBI-991044',
    pattadharPassbookNo: 'RTC-KAR-SMG-882',
    aadhaarLast4: '3391',
    ordersCount: 1,
    totalSpent: 118000,
    isActive: true,
    kycVerified: true,
    registeredDate: NOW - 60 * DAY_MS,
    soilType: 'Laterite Plantation Soil',
    notes: 'Hill plantation estate; interested in 28HP compact 4WD tractor demo next season.',
  },
  {
    id: 'c-farmer-04',
    name: 'Balwinder Singh Dhillon',
    phone: '+91 98150 99412',
    email: 'dhillon.farms@yahoo.com',
    village: 'GT Road Outskirts, Batala',
    district: 'Gurdaspur',
    state: 'Punjab',
    landHoldingAcres: 45,
    primaryCrops: ['Wheat (PBW 824)', 'Basmati Paddy (Pusa 1121)', 'Mustard'],
    machineryOwned: ['Vels Bull 55HP 4WD Tractor', 'Laser Land Leveler'],
    kisanCreditCardNo: 'KCC-PNB-662910',
    pattadharPassbookNo: 'JAMABANDI-PB-441',
    aadhaarLast4: '8820',
    ordersCount: 2,
    totalSpent: 854600,
    isActive: true,
    kycVerified: true,
    registeredDate: NOW - 150 * DAY_MS,
    soilType: 'Rich Fertile Silt Loam',
    notes: 'Large commercial grain farm; runs custom harvesting operations across Gurdaspur and Amritsar.',
  },
  {
    id: 'c-farmer-05',
    name: 'Arumugam Karuppan',
    phone: '+91 97860 12345',
    email: 'arumugam.madurai@gmail.com',
    village: 'Kariyapatti Taluk',
    district: 'Virudhunagar',
    state: 'Tamil Nadu',
    landHoldingAcres: 12,
    primaryCrops: ['Cotton', 'Millets (Ragi/Cumbu)', 'Red Chillies'],
    machineryOwned: ['2-Row Seed Drill (Manual)'],
    kisanCreditCardNo: 'KCC-IB-110492',
    pattadharPassbookNo: 'PATTA-VDR-3310',
    aadhaarLast4: '1094',
    ordersCount: 1,
    totalSpent: 0,
    isActive: false, // Temporarily held on cancellation
    kycVerified: false,
    registeredDate: NOW - 40 * DAY_MS,
    soilType: 'Deep Black Cotton Soil',
    notes: 'Applied for Tamil Nadu SMAM 50% capital machinery subsidy; awaiting revenue tahsildar signoff.',
  },
  {
    id: 'c-farmer-06',
    name: 'Rajendran Chinnasamy',
    phone: '+91 94431 55210',
    email: 'pollachi.coconuts@gmail.com',
    village: 'Anamalai Foothills, Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    landHoldingAcres: 28,
    primaryCrops: ['Coconut', 'Cocoa Intercrop', 'Nutmeg'],
    machineryOwned: ['35HP Compact Orchard Tractor', 'Tipping Trailer'],
    kisanCreditCardNo: 'KCC-CUB-551029',
    pattadharPassbookNo: 'PATTA-CBE-9901',
    aadhaarLast4: '7721',
    ordersCount: 2,
    totalSpent: 540000,
    isActive: true,
    kycVerified: true,
    registeredDate: NOW - 180 * DAY_MS,
    soilType: 'Sandy Loam with High Humus',
    notes: 'Drip irrigated coconut grove; pioneer in mechanizing coconut de-husking and inter-row tillage.',
  },
  {
    id: 'c-farmer-07',
    name: 'Venkatramana Reddy',
    phone: '+91 98481 00293',
    email: 'reddy.chilli@gmail.com',
    village: 'Tenali Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    landHoldingAcres: 35,
    primaryCrops: ['Teja Red Chillies', 'Tobacco', 'Maize'],
    machineryOwned: ['Vels Bull 55HP Tractor', '800L Trailed Sprayer'],
    kisanCreditCardNo: 'KCC-ANDHRA-88391',
    pattadharPassbookNo: '1B-AP-GNT-449',
    aadhaarLast4: '5501',
    ordersCount: 2,
    totalSpent: 980000,
    isActive: true,
    kycVerified: true,
    registeredDate: NOW - 110 * DAY_MS,
    soilType: 'Heavy Black Clay (Regur)',
    notes: 'Intensive commercial spice farm; utilizes high-power PTO for deep chiseling.',
  },
  {
    id: 'c-farmer-08',
    name: 'Manpreet Kaur Sandhu',
    phone: '+91 98720 11942',
    email: 'sandhu.combine@yahoo.com',
    village: 'Baghapurana',
    district: 'Moga',
    state: 'Punjab',
    landHoldingAcres: 50,
    primaryCrops: ['Basmati Rice', 'Durum Wheat', 'Sunflower'],
    machineryOwned: ['88HP Multi-Crop Combine Harvester', 'Heavy Axle Trolley'],
    kisanCreditCardNo: 'KCC-HDFC-994102',
    pattadharPassbookNo: 'JAMABANDI-PB-MG-12',
    aadhaarLast4: '6619',
    ordersCount: 1,
    totalSpent: 2484400,
    isActive: true,
    kycVerified: true,
    registeredDate: NOW - 75 * DAY_MS,
    soilType: 'Deep Alluvial Sandy Loam',
    notes: 'Women agri-entrepreneur running commercial contract custom hiring center for combines.',
  },
];

export function getStoredFarmers(): FarmerCustomer[] {
  try {
    const raw = localStorage.getItem('Vels:farmers');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_FARMERS];
}

export function saveStoredFarmers(data: FarmerCustomer[]): void {
  try {
    localStorage.setItem('Vels:farmers', JSON.stringify(data));
  } catch {}
}
