export type ChartRange = '7d' | '30d' | '90d' | '12m';
export type AnalyticsSubtab = 'overview' | 'sales' | 'stock';
export type MetricKey = 'rev' | 'orders' | 'units' | 'aov' | 'stock' | 'margin';
export type RangePreset = '30' | '90' | 'ytd';
export type Granularity = 'day' | 'week' | 'month';
export type SalesChannel = 'wholesale' | 'online' | 'studio';

export interface CategoryMetricData {
  rev: number;
  units: number;
  cogs: number;
}

export interface ChannelDayStats {
  o: Record<SalesChannel, number>;
  c: Record<SalesChannel, Record<string, CategoryMetricData>>;
}

export interface MetricTotals {
  rev: number;
  orders: number;
  units: number;
  cogs: number;
}

export interface TimeBucket {
  s: number; // start timestamp
  e: number; // end timestamp
  label: string;
}

export interface SeriesDataResult {
  buckets: TimeBucket[];
  cur: number[];
  prev: number[];
  canCompare: boolean;
  total: number;
  prevTotal: number;
  est: boolean;
  empty: boolean;
}

export interface StockTurnMetrics {
  t: number; // turns per year
  days: number; // days on shelf
}

export interface ExpiryBucket {
  d: number;
  lots: any[];
  units: number;
  value: number;
}

export interface StockAccuracyMetrics {
  acc: number;
  counts: any[];
  lines: number;
}

export interface DailyStats {
  date: number;
  revenue: number;
  ordersCount: number;
  unitsSold: number;
  cost: number;
  margin: number;
}

export interface MetricSummary {
  label: string;
  value: number;
  prevValue?: number;
  changePct?: number;
  fmt?: string;
  tone?: string;
}
