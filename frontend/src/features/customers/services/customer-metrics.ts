import { ONE_DAY_MS } from '../../../core/constants';
import { store, findProductById } from '../../../core/store';
import { startOfMonth, formatRelativeTime } from '../../../utils/formatters';
import { getOrderTotal } from '../../../main';
import type { Customer, CustomerMetrics, CustomerKind, TopProductItem } from '../../../types/customer';

export function generateMonthlyBucketTimestamps(monthsCount: number): number[] {
  const buckets: number[] = [];
  let currentMonth = startOfMonth(Date.now());
  for (let i = 0; i < monthsCount; i++) {
    buckets.unshift(currentMonth);
    currentMonth = startOfMonth(currentMonth - ONE_DAY_MS);
  }
  return buckets;
}

export function calculateCustomerMetrics(customer: Customer): CustomerMetrics {
  const customerOrders = store.orders
    .filter((o: any) => o.customerId === customer.id)
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  const activeOrders = customerOrders.filter((o: any) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((acc: number, item: any) => acc + getOrderTotal(item), 0);

  const monthBuckets = generateMonthlyBucketTimestamps(6);
  const monthlySpend = monthBuckets.map((bucketStart, idx) => {
    const bucketEnd = monthBuckets[idx + 1] ?? Date.now() + 86400000;
    return activeOrders
      .filter((o: any) => o.createdAt >= bucketStart && o.createdAt < bucketEnd)
      .reduce((acc: number, item: any) => acc + getOrderTotal(item), 0);
  });

  const unpaidRevenue = activeOrders
    .filter((o: any) => !o.paid)
    .reduce((acc: number, item: any) => acc + getOrderTotal(item), 0);

  return {
    orders: customerOrders,
    n: activeOrders.length,
    revenue: totalRevenue,
    last: activeOrders[0]?.createdAt ?? 0,
    avg: activeOrders.length ? totalRevenue / activeOrders.length : 0,
    monthly: monthlySpend,
    unpaid: unpaidRevenue,
  };
}

export function buildCustomerMetricsMap(kind: CustomerKind): Map<string, CustomerMetrics> {
  const metricsMap = new Map<string, CustomerMetrics>();
  store.customers
    .filter((c: any) => c.kind === kind)
    .forEach((c: any) => metricsMap.set(c.id, calculateCustomerMetrics(c)));
  return metricsMap;
}

export function formatLastOrderRelative(lastTimestamp: number): string {
  if (lastTimestamp) {
    return formatRelativeTime(lastTimestamp);
  }
  return 'No orders yet';
}

export function getCustomerTopProducts(metrics: CustomerMetrics): TopProductItem[] {
  const productQuantities = new Map<string, number>();
  metrics.orders
    .filter((o: any) => o.status !== 'cancelled')
    .forEach((o: any) =>
      o.lines.forEach((line: any) => {
        productQuantities.set(
          line.productId,
          (productQuantities.get(line.productId) ?? 0) + line.qty
        );
      })
    );

  return [...productQuantities.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([productId, quantity]) => ({
      p: findProductById(productId),
      u: quantity,
    }))
    .filter((item) => !!item.p);
}
