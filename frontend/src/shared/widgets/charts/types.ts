export interface ChartInstance {
  play: (delay?: number) => void;
  update: (...args: any[]) => void;
  redraw?: () => void;
  set?: (val: number, subText?: string) => void;
  toggle?: (seriesIndex: number) => boolean;
  readonly pinned?: number;
}

export interface LineChartSeries {
  name: string;
  tone: string;
  dashed?: boolean;
  values: number[];
}

export interface LineChartOptions {
  label: string;
  labels: string[];
  series: LineChartSeries[];
  height?: number;
  format: (val: number) => string;
}

export interface ColumnBarChartOptions {
  label: string;
  labels: string[];
  values: number[];
  highlight?: number;
  tone?: string;
  format: (val: number) => string;
}

export interface DonutRingPart {
  label?: string;
  value: number;
  tone: string;
  id?: string;
}

export interface DonutRingOptions {
  label: string;
  center: string;
  sub: string;
  parts: DonutRingPart[];
}

export interface RadialGaugeOptions {
  label: string;
  value: number; // 0.0 to 1.0
  sub: string;
  format: (val: number) => string;
  ticks?: number;
  zones?: { bad: number; warn: number };
  tone?: string;
}

export interface GroupedBarGroup {
  label: string;
  values: number[];
}

export interface GroupedBarSeries {
  name: string;
  tone: string;
}

export interface GroupedBarChartOptions {
  label: string;
  groups: GroupedBarGroup[];
  series: GroupedBarSeries[];
  axis: (val: number) => string;
  format: (val: number) => string;
  pick?: number;
}

export interface FanMeterOptions {
  label: string;
  value: number; // 0.0 to 1.0
  sub: string;
  count?: number;
  format?: (val: number) => string;
}
