export type OrderStatus = 'new' | 'picking' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type OrderChannel = 'wholesale' | 'online' | 'studio';

export interface OrderLine {
  productId: string;
  qty: number;
  price: number;
}

export interface OrderHistoryEntry {
  at: number;
  to: OrderStatus;
  by: string;
}

export interface SalesOrder {
  id: string;
  number: string;
  customerId: string;
  channel: OrderChannel;
  status: OrderStatus;
  createdAt: number;
  shipBy: number;
  locId: string;
  lines: OrderLine[];
  carrier: string;
  paid: boolean;
  history: OrderHistoryEntry[];
  trackingNumber?: string;
}

export type ReturnStatus = 'requested' | 'received' | 'restocked' | 'refunded' | 'rejected';

export interface ReturnOrder {
  id: string;
  orderId: string;
  customerId: string;
  status: ReturnStatus;
  createdAt: number;
  reason: string;
  lines: { productId: string; qty: number }[];
  refundAmount: number;
}
