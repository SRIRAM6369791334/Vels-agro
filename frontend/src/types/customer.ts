export type CustomerKind = 'stockist' | 'shopper';

export interface CustomerRfm {
  recencyDays: number;
  frequency: number;
  monetary: number;
  score?: number;
  segment?: string;
}

export interface Customer {
  id: string;
  name: string;
  kind: CustomerKind;
  contact?: string;
  email: string;
  phone: string;
  city: string;
  region?: string;
  since?: number;
  tags: string[];
  note?: string;
  discountPct?: number;
  ordersCount?: number;
  totalSpent?: number;
  rfm?: CustomerRfm;
}

export interface CustomerMetrics {
  orders: any[];
  n: number;
  revenue: number;
  last: number;
  avg: number;
  monthly: number[];
  unpaid: number;
}

export interface TopProductItem {
  p: any;
  u: number;
}
