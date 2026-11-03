export type BatchStatus = 'quarantine' | 'released' | 'hold' | 'expired';

export interface Batch {
  id: string;
  lot: string;
  productId: string;
  status: BatchStatus;
  initialQty: number;
  qty: number;
  left: number;
  mfgAt: number;
  releasedAt?: number;
  expiresAt: number;
  notes?: string;
}
