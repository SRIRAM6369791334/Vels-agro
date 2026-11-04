import {
  store,
  findProductById,
  getProductStock,
  getAvailableStock,
} from '../../../core/store';
import { ONE_DAY_MS } from '../../../core/constants';
import { StockTurnMetrics, ExpiryBucket, StockAccuracyMetrics } from '../../../types/analytics';

export const daysUntilExpiry = (batch: { expiresAt: number }): number =>
  Math.ceil((batch.expiresAt - Date.now()) / ONE_DAY_MS);

export function getProductRecentSales(productId: string, days = 30): number {
  const since = Date.now() - days * ONE_DAY_MS;
  return store.orders
    .filter((o: any) => o.createdAt >= since && o.status !== 'cancelled')
    .reduce(
      (sum: number, o: any) =>
        sum + o.lines.filter((l: any) => l.productId === productId).reduce((lSum: number, l: any) => lSum + l.qty, 0),
      0
    );
}

export function getTotalProductStockCost(): number {
  return store.products.reduce((sum: number, p: any) => sum + getProductStock(p) * p.cost, 0);
}

export function calculateProductDaysOfCover(product: any): number {
  const dailyVelocity = getProductRecentSales(product.id, 30) / 30;
  return dailyVelocity ? Math.floor(getAvailableStock(product) / dailyVelocity) : Infinity;
}

export function calculateStockAccuracy(): StockAccuracyMetrics & { off: number } {
  const counts = store.counts.filter((c) => c.status === 'done');
  let expectedSum = 0;
  let offSum = 0;
  let totalLines = 0;

  counts.forEach((count) => {
    count.lines.forEach((line) => {
      expectedSum += line.expected;
      offSum += Math.abs((line.counted ?? line.expected) - line.expected);
      totalLines += 1;
    });
  });

  return {
    acc: expectedSum ? 1 - offSum / expectedSum : 1,
    counts,
    lines: totalLines,
    off: offSum,
  };
}

export function calculateStockTurns(): StockTurnMetrics {
  const cogs30Days = store.products.reduce(
    (sum, p) => sum + getProductRecentSales(p.id, 30) * p.cost,
    0
  );

  const endingStock = getTotalProductStockCost();
  const beginningStock = store.products.reduce(
    (sum, p) => sum + (getProductStock(p) + getProductRecentSales(p.id, 30)) * p.cost,
    0
  );
  const avgStock = (endingStock + beginningStock) / 2;

  const turns = avgStock ? (cogs30Days * 365) / 30 / avgStock : 0;
  return {
    t: turns,
    days: turns ? 365 / turns : Infinity,
  };
}

export function calculateExpiringLots(): ExpiryBucket[] {
  const eligibleBatches = store.batches.filter(
    (b) => b.left > 0 && (b.status === 'released' || b.status === 'hold')
  );

  const getLotValue = (batch: any) =>
    batch.left * (findProductById(batch.productId)?.cost ?? 0);

  return [30, 60, 90].map((thresholdDays, idx, arr) => {
    const minDays = idx ? arr[idx - 1] : -Infinity;
    const lots = eligibleBatches.filter(
      (b) => daysUntilExpiry(b) <= thresholdDays && daysUntilExpiry(b) > minDays
    );

    return {
      d: thresholdDays,
      lots,
      value: lots.reduce((sum, b) => sum + getLotValue(b), 0),
      units: lots.reduce((sum, b) => sum + b.left, 0),
    };
  });
}

export function calculateMedianDaysOfCover(): number {
  const coverDays = store.products
    .filter((p) => p.active)
    .map(calculateProductDaysOfCover)
    .filter(isFinite)
    .sort((a, b) => a - b);

  if (coverDays.length) {
    return coverDays[Math.floor(coverDays.length / 2)];
  }
  return 0;
}
