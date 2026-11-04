import { Product, Material } from './product';
import { Batch } from './batch';
import { SalesOrder, ReturnOrder } from './order';
import { PurchaseOrder, Supplier } from './purchasing';
import { Location, StockMovement, Transfer, CycleCount } from './warehouse';
import { Customer } from './customer';
import { TeamMember } from './user';
import { AppSettings } from './settings';

export interface Notice {
  id: string;
  at: number;
  kind: 'order' | 'batch' | 'stock' | 'system';
  title: string;
  msg: string;
  href?: string;
  read?: boolean;
}

export interface ActivityItem {
  id: string;
  at: number;
  kind: 'order' | 'batch' | 'transfer' | 'po';
  title: string;
  sub: string;
  href?: string;
  by?: string;
}

export interface HelpTicket {
  id: string;
  title: string;
  sub: string;
  createdAt: number;
  status: 'open' | 'resolved';
}

export interface AppState {
  team: TeamMember[];
  locations: Location[];
  products: Product[];
  materials: Material[];
  batches: Batch[];
  orders: SalesOrder[];
  returns: ReturnOrder[];
  pos: PurchaseOrder[];
  suppliers: Supplier[];
  transfers: Transfer[];
  counts: CycleCount[];
  moves: StockMovement[];
  notices: Notice[];
  activities: ActivityItem[];
  tickets: HelpTicket[];
  settings: AppSettings;
  months: { key: string; value: number }[];
  weeks: { key: string; value: number }[];
}
