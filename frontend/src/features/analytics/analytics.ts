import { subscribeToStore } from '../../core/store';
import { domQuery, domQueryAll } from '../../utils/dom';
import { clearStatsCache } from './services/stats-cache';
import {
  renderOverviewSubtab,
  initOverviewSubtab,
  animateOverviewSubtab,
  updateMetricsGrid,
  updateMainChart,
} from './subtabs/overview';
import {
  renderSalesSubtab,
  initSalesSubtab,
  animateSalesSubtab,
  updateSalesSubtab,
  updateHeatmap,
} from './subtabs/sales';
import {
  renderStockSubtab,
  initStockSubtab,
  animateStockSubtab,
  updateStockSubtab,
} from './subtabs/stock';

let rootContainer: HTMLElement | null = null;
let currentSubtab = 'overview';
const initializedSubtabs = new Set<string>();

const VALID_SUBTABS = ['overview', 'sales', 'stock'] as const;
type AnalyticsSubtab = (typeof VALID_SUBTABS)[number];

const SUBTAB_TITLES: Record<string, string> = {
  overview: 'Reports',
  sales: 'Sales',
  stock: 'Stock health',
};

const getSubtabContainer = (sub: string): HTMLElement | null =>
  rootContainer ? domQuery(`[data-sub="${sub}"]`, rootContainer) : null;

const isSubtabActive = (sub: string): boolean =>
  !!rootContainer && !rootContainer.hidden && currentSubtab === sub;

function activateSubtab(subtab: string): void {
  currentSubtab = subtab;

  if (rootContainer) {
    domQueryAll('[data-sub]', rootContainer).forEach((el) => {
      el.hidden = el.dataset.sub !== subtab;
    });
  }

  const subContainer = getSubtabContainer(subtab);
  if (!subContainer) return;

  if (!initializedSubtabs.has(subtab)) {
    initializedSubtabs.add(subtab);

    switch (subtab) {
      case 'overview':
        subContainer.innerHTML = renderOverviewSubtab();
        initOverviewSubtab(subContainer);
        break;
      case 'sales':
        subContainer.innerHTML = renderSalesSubtab();
        initSalesSubtab(subContainer);
        break;
      case 'stock':
        subContainer.innerHTML = renderStockSubtab();
        initStockSubtab(subContainer);
        break;
    }
  }

  switch (subtab) {
    case 'overview':
      animateOverviewSubtab(subContainer);
      break;
    case 'sales':
      animateSalesSubtab(subContainer);
      break;
    case 'stock':
      animateStockSubtab(subContainer);
      break;
  }
}

function refreshCurrentSubtab(): void {
  const subContainer = getSubtabContainer(currentSubtab);
  if (!subContainer) return;

  if (isSubtabActive('overview')) {
    updateMetricsGrid(subContainer, false);
    updateMainChart(subContainer, false);
  } else if (isSubtabActive('sales')) {
    updateSalesSubtab(subContainer, false);
  } else if (isSubtabActive('stock')) {
    updateStockSubtab(subContainer, false);
  }
}

export const page = {
  title: (params: string[]) =>
    ({
      sales: 'Sales',
      stock: 'Stock health',
    })[params[0] ?? ''] ?? 'Reports',

  mount(container: HTMLElement) {
    rootContainer = container;
    rootContainer.innerHTML = VALID_SUBTABS.map((s) => `<div data-sub="${s}" hidden></div>`).join('');

    subscribeToStore('orders', () => {
      clearStatsCache();
      refreshCurrentSubtab();
    });

    subscribeToStore('history', () => {
      clearStatsCache();
      refreshCurrentSubtab();
    });

    subscribeToStore('products', refreshCurrentSubtab);

    subscribeToStore('batches', () => {
      const stockContainer = getSubtabContainer('stock');
      if (isSubtabActive('stock') && stockContainer) {
        updateStockSubtab(stockContainer, false);
      }
    });

    subscribeToStore('counts', () => {
      const stockContainer = getSubtabContainer('stock');
      if (isSubtabActive('stock') && stockContainer) {
        updateStockSubtab(stockContainer, false);
      }
    });

    subscribeToStore('moves', () => {
      const ovContainer = getSubtabContainer('overview');
      if (isSubtabActive('overview') && ovContainer) {
        updateMainChart(ovContainer, false);
      }
    });

    subscribeToStore('settings', () => {
      const ovContainer = getSubtabContainer('overview');
      if (isSubtabActive('overview') && ovContainer) {
        updateMainChart(ovContainer, false);
      } else if (isSubtabActive('stock')) {
        const stockContainer = getSubtabContainer('stock');
        if (stockContainer) updateStockSubtab(stockContainer, false);
      } else if (isSubtabActive('sales')) {
        const salesContainer = getSubtabContainer('sales');
        if (salesContainer) updateHeatmap(salesContainer, false);
      }
    });
  },

  enter({ params, same }: { params: string[]; first: boolean; same: boolean }) {
    const sub = (VALID_SUBTABS as readonly string[]).includes(params[0] ?? '') ? params[0] : 'overview';
    if (!(same && sub === currentSubtab && initializedSubtabs.has(sub))) {
      activateSubtab(sub);
    }
  },

  leave() {},
};
