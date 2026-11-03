export type CustomerKind = 'stockist' | 'shopper';

export interface Customer {
  id: string;
  name: string;
  kind: CustomerKind;
  email: string;
  phone: string;
  city: string;
  tags: string[];
  discountPct?: number;
  ordersCount?: number;
  totalSpent?: number;
}
