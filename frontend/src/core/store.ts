export const STORAGE_KEY = 'Vels:data:v2';

let storeState: any = null;
const subscribers = new Map<string, Set<() => void>>();
let debounceTimer = 0;

export function initStore(initialState: any): any {
  storeState = initialState;
  return storeState;
}

export function getStore(): any {
  return storeState;
}

export function setStore(mutator: (state: any) => void): void {
  if (storeState) {
    mutator(storeState);
  }
}

export const store = new Proxy({} as any, {
  get(_target, prop) {
    return storeState ? storeState[prop] : undefined;
  },
  set(_target, prop, value) {
    if (storeState) {
      storeState[prop] = value;
      return true;
    }
    return false;
  },
});

export function subscribeToStore(sliceKey: string, callback: () => void): () => void {
  if (!subscribers.has(sliceKey)) {
    subscribers.set(sliceKey, new Set());
  }
  subscribers.get(sliceKey)!.add(callback);
  return () => {
    subscribers.get(sliceKey)?.delete(callback);
  };
}

export function notifyStoreSubscribers(...slices: string[]): void {
  // 250ms debounced persistence to localStorage
  if (typeof window !== 'undefined') {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      try {
        if (storeState) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storeState));
        }
      } catch (err) {
        console.warn('Failed to persist storeState to localStorage', err);
      }
    }, 250);
  }

  const triggeredCallbacks = new Set<() => void>();
  slices.forEach((slice) => {
    subscribers.get(slice)?.forEach((cb) => triggeredCallbacks.add(cb));
  });
  subscribers.get('*')?.forEach((cb) => triggeredCallbacks.add(cb));

  triggeredCallbacks.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('Store subscriber callback error:', err);
    }
  });
}

// Accessor & query helper methods
export function findMemberById(id: string) {
  return storeState?.team?.find((m: any) => m.id === id);
}

export function findLocationById(id: string) {
  return storeState?.locations?.find((l: any) => l.id === id);
}

export function findProductById(id: string) {
  return storeState?.products?.find((p: any) => p.id === id);
}

export function findMaterialById(id: string) {
  return storeState?.materials?.find((m: any) => m.id === id);
}

export function findSupplierById(id: string) {
  return storeState?.suppliers?.find((s: any) => s.id === id);
}

export function findCustomerById(id: string) {
  return storeState?.customers?.find((c: any) => c.id === id);
}

export function findOrderById(id: string) {
  return storeState?.orders?.find((o: any) => o.id === id);
}

export function findBatchById(id: string) {
  return storeState?.batches?.find((b: any) => b.id === id);
}

export function findPoById(id: string) {
  return storeState?.pos?.find((p: any) => p.id === id);
}

export function getProductStock(product: any, locId?: string): number {
  if (!product || !product.stock) return 0;
  if (locId) return product.stock[locId] ?? 0;
  const stockValues: any[] = Object.values(product.stock);
  return stockValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
}

export function getActiveAllocatedStock(productId: string, locId?: string): number {
  if (!storeState?.orders) return 0;
  const activeStages = ['new', 'picking', 'packed'];
  return storeState.orders
    .filter((o: any) => activeStages.includes(o.status) && (!locId || o.locId === locId))
    .reduce(
      (sum: number, o: any) =>
        sum +
        o.lines
          .filter((l: any) => l.productId === productId)
          .reduce((lineSum: number, l: any) => lineSum + l.qty, 0),
      0
    );
}

export function getAvailableStock(product: any, locId?: string): number {
  if (!product) return 0;
  return getProductStock(product, locId) - getActiveAllocatedStock(product.id, locId);
}

export function isProductLowStock(product: any): boolean {
  if (!product || !product.active) return false;
  return getAvailableStock(product, 'dc') <= product.reorderAt;
}

export function isProductOutOfStock(product: any): boolean {
  if (!product || !product.active) return false;
  return getAvailableStock(product, 'dc') <= 0;
}

export function getLowStockProducts(): any[] {
  if (!storeState?.products) return [];
  return storeState.products.filter(isProductLowStock);
}

export function getOutOfStockProducts(): any[] {
  if (!storeState?.products) return [];
  return storeState.products.filter(isProductOutOfStock);
}

export function getLowStockMaterials(): any[] {
  if (!storeState?.materials) return [];
  return storeState.materials.filter((m: any) => m.onHand <= m.reorderAt);
}

export function getPendingOrdersToShip(): any[] {
  if (!storeState?.orders) return [];
  const activeStages = ['new', 'picking', 'packed'];
  return storeState.orders.filter((o: any) => activeStages.includes(o.status));
}

export function getUnreadNoticesCount(): number {
  if (!storeState?.notices) return 0;
  return storeState.notices.filter((n: any) => !n.read).length;
}

export function addNotification(kind: string, text: string, href: string): void {
  if (!storeState?.notices) return;
  storeState.notices.unshift({
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    text,
    href,
    read: false,
    kind,
  });
  storeState.notices.length = Math.min(storeState.notices.length, 30);
  notifyStoreSubscribers('notices');
}

export function addActivityLog(kind: string, title: string, text: string, href: string, who = 'm-okafor'): void {
  if (!storeState?.activity) return;
  storeState.activity.unshift({
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    who,
    kind,
    title,
    text,
    href,
  });
  storeState.activity.length = Math.min(storeState.activity.length, 120);
  notifyStoreSubscribers('activity');
}
