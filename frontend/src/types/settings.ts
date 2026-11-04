import { TeamMember } from './user';

export interface CompanySettings {
  name: string;
  legal?: string;
  legalName?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  currency?: string;
  supportEmail?: string;
  email?: string;
  timezone?: string;
  fiscalStart?: string;
}

export interface CreditCardInfo {
  brand: string;
  last4: string;
  exp: string;
  name: string;
}

export interface BillingInvoice {
  id: string;
  at: number;
  amount: number;
  status: 'paid' | 'due';
}

export interface SubscriptionPlan {
  name: 'Studio' | 'Growth' | 'Scale';
  price: number;
  cap: number;
  blurb: string;
  feats: string[];
}

export interface BillingSettings {
  plan: 'Studio' | 'Growth' | 'Scale' | 'starter' | 'enterprise';
  seats: number;
  cycle: 'monthly' | 'yearly';
  nextBillingAt?: number;
  cardLast4?: string;
  card?: CreditCardInfo;
  invoices?: BillingInvoice[];
}

export interface NotificationSettings {
  lowStock?: boolean;
  expiry?: boolean;
  orders?: boolean;
  poUpdates?: boolean;
  returns?: boolean;
  digest?: boolean;
  digestAt?: string;
  email?: boolean;
  push?: boolean;
  emailLowStock?: boolean;
  emailOrderPlaced?: boolean;
  emailBatchExpiring?: boolean;
  inAppAlerts?: boolean;
}

export interface StockPreferences {
  expiryWarnDays: number;
  lowStockThreshold?: number;
  lowStockMode?: 'fixed' | 'cover';
  defaultLoc?: string;
  weekStart?: 'mon' | 'sun';
}

export interface AppSettings {
  goal: number;
  me: TeamMember;
  company?: CompanySettings;
  billing?: BillingSettings;
  notify?: NotificationSettings;
  notifications?: NotificationSettings;
  prefs: StockPreferences;
}

export interface ActiveSession {
  id: string;
  device: string;
  app: string;
  where: string;
  at: number;
  ico: string;
  me?: boolean;
}

export interface NotificationAlertDef {
  k: string;
  title: string;
  desc: string;
  ico: string;
  def: boolean;
}
