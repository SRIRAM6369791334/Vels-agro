export type PoStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';

export interface PoLine {
  materialId: string;
  qty: number;
  cost: number;
  received?: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  status: PoStatus;
  createdAt: number;
  eta: number;
  lines: PoLine[];
  notes?: string;
  receivedAt?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  leadDays: number;
  materialsCount?: number;
}
