import { ONE_DAY_MS } from '../data/constants';

const intFmt = new Intl.NumberFormat('en-IN');
const moneyFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const moneyRoundFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatInt = (val: number): string => intFmt.format(Math.round(val));

export const formatNumber = (val: number, maxDigits = 1): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDigits }).format(val);

export const formatPercent = (val: number, digits = 0): string => `${(val * 100).toFixed(digits)}%`;

export const formatMoney = (val: number): string => moneyFmt.format(val);

export const formatMoneyRound = (val: number): string => moneyRoundFmt.format(Math.round(val));

export const formatMoneyK = (val: number): string =>
  Math.abs(val) >= 1000
    ? `₹${(val / 1000).toFixed(Math.abs(val) >= 10000 ? 0 : 1)}k`
    : `₹${Math.round(val)}`;

export const formatDate = (ts: number, includeYear = false): string =>
  new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });

export const formatTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export const formatDateWithDay = (ts: number): string =>
  new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export const formatDateTime = (ts: number): string => `${formatDate(ts, true)} at ${formatTime(ts)}`;

export const formatRelativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const abs = Math.abs(diff);
  const isFuture = diff < 0;
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / ONE_DAY_MS);

  if (abs < 60000) return 'just now';
  const unit = mins < 60 ? `${mins} min` : hours < 24 ? `${hours} h` : days < 7 ? `${days} d` : '';
  return unit ? (isFuture ? `in ${unit}` : `${unit} ago`) : formatDate(ts);
};

export const formatRelativeDay = (ts: number): string => {
  const today = new Date().setHours(0, 0, 0, 0);
  const target = new Date(ts).setHours(0, 0, 0, 0);
  const diffDays = Math.floor((target - today) / ONE_DAY_MS);
  return diffDays === 0
    ? 'Today'
    : diffDays === 1
      ? 'Tomorrow'
      : diffDays === -1
        ? 'Yesterday'
        : formatDateWithDay(ts);
};

export const pluralize = (count: number, singular: string, plural = `${singular}s`): string =>
  `${formatInt(count)} ${count === 1 ? singular : plural}`;

export const startOfDay = (ts: number): number => new Date(ts).setHours(0, 0, 0, 0);

export const startOfToday = (): number => startOfDay(Date.now());

export const startOfMonth = (ts: number): number => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
};

export const formatMonogram = (name: string): string =>
  name
    .replace(/[&]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const daysUntilExpiry = (batch: { expiresAt: number }): number =>
  Math.ceil((batch.expiresAt - Date.now()) / ONE_DAY_MS);

export { formatCsvRow, downloadFile } from './csv';

