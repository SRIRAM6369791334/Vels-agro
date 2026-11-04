// Vels Agro Enterprise — Offers & Promotions Data Model (Section 17)
// Coupons, Product/Category Discounts, Dealer Schemes, Banners & Featured Machinery

export interface CouponCode {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number; // in ₹ or %
  minOrderValue: number;
  maxDiscount?: number;
  applicableTo: 'all' | 'farmers_only' | 'dealers_only' | 'specific_category';
  categoryTarget?: string;
  startDate: number;
  endDate: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface ProductCategoryDiscount {
  id: string;
  title: string;
  targetType: 'product' | 'category';
  targetId: string;
  targetName: string;
  discountPct: number;
  flatDiscountINR: number;
  subsidyScheme?: string;
  badgeText: string;
  validFrom: number;
  validUntil: number;
  isActive: boolean;
  minQty: number;
}

export interface DealerSpecialScheme {
  id: string;
  title: string;
  tier: 'all' | 'platinum' | 'gold' | 'silver';
  minUnits: number;
  additionalDiscountPct: number;
  creditPeriodExtensionDays: number;
  freeFreightIncluded: boolean;
  eligibleDealersCount: number;
  validUntil: number;
  status: 'active' | 'upcoming' | 'expired';
  termsNote: string;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  placement: 'homepage_hero' | 'mobile_app_carousel' | 'category_header' | 'checkout_popup';
  targetUrl: string;
  imageUrl: string;
  badgeText: string;
  ctaText: string;
  featuredMachineryIds: string[];
  displayOrder: number;
  isActive: boolean;
  clicksCount: number;
  conversionsCount: number;
}

const NOW = Date.now();
const DAY_MS = 86400000;

export const INITIAL_COUPONS: CouponCode[] = [
  {
    id: 'cpn-01',
    code: 'KISAN5000',
    title: 'Small & Marginal Farmer Direct Subsidy Token',
    description: 'Flat ₹5,000 instant discount on rotavators, power tillers and boom sprayers for farmers.',
    discountType: 'flat',
    discountValue: 5000,
    minOrderValue: 40000,
    applicableTo: 'farmers_only',
    categoryTarget: 'Implements',
    startDate: NOW - 15 * DAY_MS,
    endDate: NOW + 45 * DAY_MS,
    usageLimit: 250,
    usedCount: 84,
    isActive: true,
  },
  {
    id: 'cpn-02',
    code: 'PONGAL2026',
    title: 'Harvest Festival Mega Tractor Booking Offer',
    description: 'Flat ₹25,000 cash discount on Vels Bull 45HP and 55HP tractors booked before harvest season.',
    discountType: 'flat',
    discountValue: 25000,
    minOrderValue: 500000,
    applicableTo: 'all',
    startDate: NOW - 5 * DAY_MS,
    endDate: NOW + 30 * DAY_MS,
    usageLimit: 50,
    usedCount: 19,
    isActive: true,
  },
  {
    id: 'cpn-03',
    code: 'DEALERBULK10',
    title: 'Authorized Dealer Wholesale Consignment Booster',
    description: 'Additional 10% invoice discount on purchase orders of 3 or more multi-crop combine harvesters.',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 2000000,
    maxDiscount: 250000,
    applicableTo: 'dealers_only',
    startDate: NOW - 20 * DAY_MS,
    endDate: NOW + 20 * DAY_MS,
    usageLimit: 30,
    usedCount: 7,
    isActive: true,
  },
  {
    id: 'cpn-04',
    code: 'SPAREPARTS15',
    title: 'Genuine OEM Spares & Wear Parts Rebate',
    description: '15% discount on genuine Boron Steel rotavator blades, hydraulic filters and clutch plates.',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 5000,
    maxDiscount: 15000,
    applicableTo: 'all',
    categoryTarget: 'Spare Parts',
    startDate: NOW - 10 * DAY_MS,
    endDate: NOW + 60 * DAY_MS,
    usageLimit: 500,
    usedCount: 162,
    isActive: true,
  },
  {
    id: 'cpn-05',
    code: 'ORCHARD3000',
    title: 'Horticulture & Orchard Farmer Incentive',
    description: 'Special ₹3,000 subsidy discount on 35HP mini tractors and compact inter-cultivators.',
    discountType: 'flat',
    discountValue: 3000,
    minOrderValue: 150000,
    applicableTo: 'farmers_only',
    startDate: NOW - 30 * DAY_MS,
    endDate: NOW - 2 * DAY_MS,
    usageLimit: 100,
    usedCount: 98,
    isActive: false, // Expired
  },
];

export const INITIAL_DISCOUNTS: ProductCategoryDiscount[] = [
  {
    id: 'disc-01',
    title: 'Vels Bull 55HP 4WD Harvest Price Slash',
    targetType: 'product',
    targetId: 'prod-01',
    targetName: 'Vels Bull 55HP 4WD Heavy Tractor',
    discountPct: 5.5,
    flatDiscountINR: 45000,
    subsidyScheme: 'Tamil Nadu SMAM Agro Machinery Subsidy Scheme',
    badgeText: '₹45,000 Off + 5-Yr Warranty',
    validFrom: NOW - 10 * DAY_MS,
    validUntil: NOW + 35 * DAY_MS,
    isActive: true,
    minQty: 1,
  },
  {
    id: 'disc-02',
    title: 'Rotary Tillers & Rotavators Pre-Monsoon Rebate',
    targetType: 'category',
    targetId: 'cat-implements',
    targetName: 'Primary & Secondary Tillage Implements',
    discountPct: 8.0,
    flatDiscountINR: 8500,
    subsidyScheme: 'Kisan Krishi Yantra Yojna',
    badgeText: '8% Off All Rotavators',
    validFrom: NOW - 5 * DAY_MS,
    validUntil: NOW + 25 * DAY_MS,
    isActive: true,
    minQty: 1,
  },
  {
    id: 'disc-03',
    title: 'Multi-Crop Combine Harvester Off-Season Booking',
    targetType: 'product',
    targetId: 'prod-03',
    targetName: 'Vels Harvester 88HP Multi-Crop (Rubber Track)',
    discountPct: 6.0,
    flatDiscountINR: 120000,
    subsidyScheme: 'National Food Security Mission Farm Mechanization',
    badgeText: 'Save ₹1.2 Lakh on Pre-Order',
    validFrom: NOW - 20 * DAY_MS,
    validUntil: NOW + 15 * DAY_MS,
    isActive: true,
    minQty: 1,
  },
  {
    id: 'disc-04',
    title: 'OEM Fast-Moving Spares Maintenance Bundle',
    targetType: 'category',
    targetId: 'cat-spares',
    targetName: 'Consumables & Lubricants',
    discountPct: 12.0,
    flatDiscountINR: 1500,
    badgeText: '12% Off Spares Cart',
    validFrom: NOW - 2 * DAY_MS,
    validUntil: NOW + 40 * DAY_MS,
    isActive: true,
    minQty: 5,
  },
];

export const INITIAL_DEALER_SCHEMES: DealerSpecialScheme[] = [
  {
    id: 'ds-01',
    title: 'Platinum Dealer Mega Volume Slabs — Q3 Festival Run',
    tier: 'platinum',
    minUnits: 5,
    additionalDiscountPct: 4.5,
    creditPeriodExtensionDays: 15, // 30 days -> 45 days
    freeFreightIncluded: true,
    eligibleDealersCount: 4,
    validUntil: NOW + 45 * DAY_MS,
    status: 'active',
    termsNote: 'Applicable on wholesale bookings of 5+ tractor chassis. Free low-bed trailer delivery up to 400 km.',
  },
  {
    id: 'ds-02',
    title: 'Gold Tier Implements Stocking Incentive',
    tier: 'gold',
    minUnits: 10,
    additionalDiscountPct: 3.0,
    creditPeriodExtensionDays: 10,
    freeFreightIncluded: true,
    eligibleDealersCount: 8,
    validUntil: NOW + 30 * DAY_MS,
    status: 'active',
    termsNote: 'Order minimum 10 implements mix (Rotavators, Disc Harrows, Cultivators) to claim +3% margin rebate.',
  },
  {
    id: 'ds-03',
    title: 'New Dealership Onboarding Kickstart Scheme',
    tier: 'silver',
    minUnits: 2,
    additionalDiscountPct: 2.0,
    creditPeriodExtensionDays: 0,
    freeFreightIncluded: false,
    eligibleDealersCount: 5,
    validUntil: NOW + 60 * DAY_MS,
    status: 'active',
    termsNote: 'Applicable on first 2 orders for dealers onboarded in FY 2026. Instant credit note issuance upon delivery signoff.',
  },
  {
    id: 'ds-04',
    title: 'Kharif Harvest Pre-Booking Incentive (Past)',
    tier: 'all',
    minUnits: 8,
    additionalDiscountPct: 5.0,
    creditPeriodExtensionDays: 15,
    freeFreightIncluded: true,
    eligibleDealersCount: 12,
    validUntil: NOW - 10 * DAY_MS,
    status: 'expired',
    termsNote: 'Concluded Kharif season promotion; all dealer credit vouchers settled.',
  },
];

export const INITIAL_BANNERS: PromotionalBanner[] = [
  {
    id: 'ban-01',
    title: 'Harvest Festival Mega Exchange Mela 2026',
    subtitle: 'Exchange any old tractor for an advanced Vels Bull 55HP 4WD with ₹50,000 Exchange Bonus & 5.9% Agri Loan.',
    placement: 'homepage_hero',
    targetUrl: '#/products/catalog',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    badgeText: '🌾 Pongal & Harvest Special',
    ctaText: 'Explore Tractors & Book Demo',
    featuredMachineryIds: ['prod-01', 'prod-02'],
    displayOrder: 1,
    isActive: true,
    clicksCount: 1420,
    conversionsCount: 38,
  },
  {
    id: 'ban-02',
    title: 'Zero Down Payment Kisan Credit Card Scheme',
    subtitle: 'Get instant pre-approved loans for primary rotavators & seed drills. Zero processing fee for PACS members.',
    placement: 'mobile_app_carousel',
    targetUrl: '#/orders/payments',
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',
    badgeText: '💳 Bank Partner Scheme',
    ctaText: 'Check Loan Eligibility',
    featuredMachineryIds: ['prod-04', 'prod-05'],
    displayOrder: 2,
    isActive: true,
    clicksCount: 890,
    conversionsCount: 22,
  },
  {
    id: 'ban-03',
    title: 'Heavy Duty Boron Steel Rotavator Blade Kits',
    subtitle: 'High durability laser-treated blades suitable for hard black cotton & delta clay soils. Flat 15% off combo pack.',
    placement: 'category_header',
    targetUrl: '#/products/catalog',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    badgeText: '⚙️ OEM Genuine Spares',
    ctaText: 'Order Blade Set',
    featuredMachineryIds: ['prod-06'],
    displayOrder: 3,
    isActive: true,
    clicksCount: 620,
    conversionsCount: 45,
  },
  {
    id: 'ban-04',
    title: 'Authorized Dealership Network Expansion',
    subtitle: 'Exclusive territory rights, demo tractor subsidy and up to 18% margin for Coimbatore, Erode & Salem districts.',
    placement: 'checkout_popup',
    targetUrl: '#/dealers/locations',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    badgeText: '🏢 Business Partnership',
    ctaText: 'Apply for Dealership',
    featuredMachineryIds: [],
    displayOrder: 4,
    isActive: false,
    clicksCount: 310,
    conversionsCount: 11,
  },
];

// LocalStorage helpers
export function getStoredCoupons(): CouponCode[] {
  try {
    const raw = localStorage.getItem('Vels:coupons');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_COUPONS];
}

export function saveStoredCoupons(data: CouponCode[]): void {
  try {
    localStorage.setItem('Vels:coupons', JSON.stringify(data));
  } catch {}
}

export function getStoredDiscounts(): ProductCategoryDiscount[] {
  try {
    const raw = localStorage.getItem('Vels:discounts');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_DISCOUNTS];
}

export function saveStoredDiscounts(data: ProductCategoryDiscount[]): void {
  try {
    localStorage.setItem('Vels:discounts', JSON.stringify(data));
  } catch {}
}

export function getStoredDealerSchemes(): DealerSpecialScheme[] {
  try {
    const raw = localStorage.getItem('Vels:dealer_schemes');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_DEALER_SCHEMES];
}

export function saveStoredDealerSchemes(data: DealerSpecialScheme[]): void {
  try {
    localStorage.setItem('Vels:dealer_schemes', JSON.stringify(data));
  } catch {}
}

export function getStoredBanners(): PromotionalBanner[] {
  try {
    const raw = localStorage.getItem('Vels:banners');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_BANNERS];
}

export function saveStoredBanners(data: PromotionalBanner[]): void {
  try {
    localStorage.setItem('Vels:banners', JSON.stringify(data));
  } catch {}
}
