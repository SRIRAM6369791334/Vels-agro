import {
  store,
  findProductById,
  getProductStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getLowStockMaterials,
  getAvailableStock,
} from '../../../core/store';
import { ONE_DAY_MS, KANBAN_STAGES } from '../../../core/constants';
import { startOfToday, startOfMonth, pluralize } from '../../../utils/formatters';

export function getTotalStockUnits(): number {
  if (!store.products) return 0;
  return store.products.reduce((sum: number, p: any) => sum + getProductStock(p), 0);
}

export function getLocationStockUnits(locId: string): number {
  if (!store.products) return 0;
  return store.products.reduce((sum: number, p: any) => sum + (p.stock?.[locId] ?? 0), 0);
}

export function getStockHistory(days: number): number[] {
  let units = getTotalStockUnits();
  const today = startOfToday();
  const history: number[] = [];
  for (let i = 0; i < days; i++) {
    history.unshift(units);
    const dayStart = today - i * ONE_DAY_MS;
    units -= store.moves
      .filter((m: any) => m.at >= dayStart && m.at < dayStart + ONE_DAY_MS && findProductById(m.itemId))
      .reduce((acc: number, m: any) => acc + m.qty, 0);
  }
  return history;
}

export function getMonthStartStock(): number {
  const monthStart = startOfMonth(Date.now());
  return (
    getTotalStockUnits() -
    store.moves
      .filter((m: any) => m.at >= monthStart && findProductById(m.itemId))
      .reduce((acc: number, m: any) => acc + m.qty, 0)
  );
}

export function getTotalInventoryValue(): number {
  const productVal = (store.products ?? []).reduce(
    (acc: number, p: any) => acc + getProductStock(p) * (p.cost ?? 0),
    0
  );
  const matVal = (store.materials ?? []).reduce(
    (acc: number, m: any) => acc + (m.onHand ?? 0) * (m.cost ?? 0),
    0
  );
  return productVal + matVal;
}

export function getLastMonthInventoryValue(): number {
  return store.months?.[store.months.length - 2]?.value ?? getTotalInventoryValue();
}

export function getInventoryStatsGroups(range: 'weekly' | 'monthly' | 'quarterly') {
  const data = range === 'weekly' ? store.weeks : store.months;
  if (range !== 'quarterly') {
    return (data ?? []).map((d: any) => ({
      label: d.label,
      values: [d.stockIn, d.stockOut, d.value],
    }));
  }
  const quarters: { label: string; values: [number, number, number] }[] = [];
  (store.months ?? []).forEach((m: any, idx: number) => {
    const q = Math.floor(idx / 3);
    const entry = quarters[q] ?? (quarters[q] = { label: `Q${q + 1}`, values: [0, 0, 0] });
    entry.values[0] += m.stockIn;
    entry.values[1] += m.stockOut;
    entry.values[2] = m.value;
  });
  return quarters;
}

export function getOrderRevenue(order: any): number {
  if (!order || !order.lines) return 0;
  return order.lines.reduce((acc: number, l: any) => acc + l.qty * l.price, 0);
}

export function getCurrentMonthSalesStats(mode: 'month' | 'last'): { rev: number; n: number; label: string } {
  const monthStart = startOfMonth(Date.now());
  if (mode === 'month') {
    const orders = (store.orders ?? []).filter(
      (o: any) => o.createdAt >= monthStart && o.createdAt <= Date.now() + ONE_DAY_MS && o.status !== 'cancelled'
    );
    const rev = orders.reduce((acc: number, o: any) => acc + getOrderRevenue(o), 0);
    return {
      rev,
      n: orders.length,
      label: 'Sales goal',
    };
  }
  const lastMonthStart = startOfMonth(monthStart - ONE_DAY_MS);
  const orders = (store.orders ?? []).filter(
    (o: any) => o.createdAt >= lastMonthStart && o.createdAt < monthStart && o.status !== 'cancelled'
  );
  const rev = orders.reduce((acc: number, o: any) => acc + getOrderRevenue(o), 0);
  return {
    rev,
    n: orders.length,
    label: 'Last month',
  };
}

export function getShippingOrdersToday(): any[] {
  const cutoff = startOfToday() + ONE_DAY_MS;
  return (store.orders ?? [])
    .filter(
      (o: any) =>
        o.status !== 'cancelled' &&
        (KANBAN_STAGES.indexOf(o.status) < 3
          ? o.shipBy < cutoff
          : (o.history?.find((h: any) => h.to === 'shipped')?.at ?? 0) >= startOfToday())
    )
    .sort(
      (a: any, b: any) =>
        KANBAN_STAGES.indexOf(a.status) - KANBAN_STAGES.indexOf(b.status) || a.shipBy - b.shipBy
    );
}

export function getExpiringBatches(withinDays?: number): any[] {
  const days = withinDays ?? store.settings?.prefs?.expiryWarnDays ?? 90;
  const horizon = Date.now() + days * ONE_DAY_MS;
  return (store.batches ?? []).filter((b: any) => b.expiresAt <= horizon && b.left > 0);
}

export function getActiveOrders(): any[] {
  return (store.orders ?? []).filter(
    (o: any) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
}

export function getActiveOrdersForLocation(productId: string, locId: string): number {
  return (store.orders ?? [])
    .filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled' && o.locId === locId)
    .reduce(
      (acc: number, o: any) =>
        acc +
        o.lines
          .filter((l: any) => l.productId === productId)
          .reduce((lineSum: number, l: any) => lineSum + l.qty, 0),
      0
    );
}

export function getDashboardAlertsSummary(): {
  key: string;
  tone: string;
  ico: string;
  title: string;
  text: string;
  href: string;
  n: number;
}[] {
  const outOfStock = getOutOfStockProducts();
  const lowProducts = getLowStockProducts().filter((p: any) => !outOfStock.includes(p));
  const lowMaterials = getLowStockMaterials();
  const expiring = getExpiringBatches();
  const activeOrders = getActiveOrders();
  const qaBatches = (store.batches ?? []).filter((b: any) => b.status === 'quarantine');

  return [
    {
      key: 'out',
      tone: 'rose',
      ico: 'box',
      title: 'Out of stock',
      text: outOfStock.length
        ? `${pluralize(outOfStock.length, 'product')} out at Riverside DC`
        : 'Nothing is out of stock',
      href: '/dashboard/alerts',
      n: outOfStock.length,
    },
    {
      key: 'exp',
      tone: 'teal',
      ico: 'calX',
      title: 'Expiring soon',
      text: expiring.length
        ? `${pluralize(expiring.length, 'lot')} expire within ${store.settings?.prefs?.expiryWarnDays ?? 90} days`
        : 'No lots near expiry',
      href: '/products/batches',
      n: expiring.length,
    },
    {
      key: 'low',
      tone: 'ochre',
      ico: 'alert',
      title: 'Low stock alert',
      text: `${pluralize(lowProducts.length + lowMaterials.length, 'item')} running low`,
      href: '/dashboard/alerts',
      n: lowProducts.length + lowMaterials.length,
    },
    {
      key: 'pend',
      tone: 'sky',
      ico: 'hourglass',
      title: 'Pending orders',
      text: `${pluralize(activeOrders.length, 'order')} waiting to ship`,
      href: '/orders/board',
      n: activeOrders.length,
    },
    {
      key: 'qa',
      tone: 'ocean',
      ico: 'flask',
      title: 'Batches in QA',
      text: `${pluralize(qaBatches.length, 'batch', 'batches')} waiting for release`,
      href: '/products/batches',
      n: qaBatches.length,
    },
  ];
}

export function getTopSellingProducts(limit = 3, days = 30): {
  product: any;
  units: number;
  revenue: number;
  orders: number;
}[] {
  const since = Date.now() - days * ONE_DAY_MS;
  const map = new Map<string, { units: number; revenue: number; orders: number }>();
  (store.orders ?? [])
    .filter((o: any) => o.createdAt >= since && o.status !== 'cancelled')
    .forEach((o: any) =>
      o.lines.forEach((l: any) => {
        const cur = map.get(l.productId) ?? { units: 0, revenue: 0, orders: 0 };
        cur.units += l.qty;
        cur.revenue += l.qty * l.price;
        cur.orders += 1;
        map.set(l.productId, cur);
      })
    );
  return Array.from(map.entries())
    .map(([productId, stats]) => ({
      product: findProductById(productId),
      ...stats,
    }))
    .filter((e) => Boolean(e.product))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getMaterialOnOrder(materialId: string): number {
  return (store.pos ?? [])
    .filter((po: any) => po.status === 'sent' || po.status === 'partial')
    .reduce(
      (sum: number, po: any) =>
        sum +
        po.lines
          .filter((l: any) => l.materialId === materialId)
          .reduce((lineSum: number, l: any) => lineSum + (l.qty - l.received), 0),
      0
    );
}
