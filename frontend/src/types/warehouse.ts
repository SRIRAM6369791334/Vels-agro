export type LocationKind = 'dc' | 'lab' | 'shop';

export interface LocationZone {
  id: string;
  name: string;
  kind: 'ambient' | 'cool' | 'quarantine' | 'dispatch';
  bins: number;
}

export interface Location {
  id: string;
  name: string;
  kind: LocationKind;
  city: string;
  address: string;
  capacity: number;
  managerId: string;
  hours: string;
  zones: LocationZone[];
}

export interface StockMovement {
  id: string;
  at: number;
  itemId: string;
  from?: string;
  to?: string;
  qty: number;
  reason: 'sale' | 'production' | 'transfer' | 'adjustment' | 'return';
  ref?: string;
}

export type TransferStatus = 'planned' | 'in-transit' | 'received';

export interface Transfer {
  id: string;
  fromLocId: string;
  toLocId: string;
  status: TransferStatus;
  createdAt: number;
  eta: number;
  lines: { productId: string; qty: number }[];
}

export type CycleCountStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface CycleCountLine {
  productId: string;
  expected: number;
  counted?: number;
}

export interface CycleCount {
  id: string;
  locId: string;
  status: CycleCountStatus;
  scheduledAt: number;
  completedAt?: number;
  lines: CycleCountLine[];
}
