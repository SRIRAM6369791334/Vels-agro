import type { FeaturePage } from '../../types/common';
import { subscribeToStore } from '../../core/store';
import { domQueryAll, queryOne } from '../../utils/dom';
import { gsap } from '../../core/motion';
import {
  initDashboardOverview,
  animateDashboardOverview,
  updateClock,
  updateHelloSub,
  updateKpiCards,
  updateSalesOverview,
  updateShipsToday,
  updateLocations,
  updateRecentActivities,
  updateAlertsList,
  updateTopSellers,
} from './subtabs/overview';
import {
  initActivitySubtab,
  animateActivitySubtab,
  updateActivityList,
  updateStockLedger,
} from './subtabs/activity';
import {
  initAlertsSubtab,
  animateAlertsSubtab,
  updateAlertsGroups,
} from './subtabs/alerts';

let rootContainer: HTMLElement | null = null;
let currentSubtab = 'overview';
const initializedSubtabs = new Set<string>();

const isCurrentSubtab = (sub: string) => !!rootContainer && !rootContainer.hidden && currentSubtab === sub;

function switchSubtab(targetSub: string, isSame: boolean) {
  const prevSub = currentSubtab;
  currentSubtab = targetSub;

  if (rootContainer) {
    domQueryAll<HTMLElement>('[data-sub]', rootContainer).forEach((el) => {
      el.hidden = el.dataset.sub !== targetSub;
    });
  }

  const subContainer = rootContainer ? queryOne<HTMLElement>(`[data-sub="${targetSub}"]`, rootContainer) : null;
  if (!subContainer) return;

  if (!initializedSubtabs.has(targetSub)) {
    initializedSubtabs.add(targetSub);
    if (targetSub === 'overview') {
      initDashboardOverview(subContainer);
    } else if (targetSub === 'activity') {
      initActivitySubtab(subContainer);
    } else {
      initAlertsSubtab(subContainer);
    }
  }

  if (targetSub === 'overview') {
    if (isSame || prevSub !== targetSub) {
      animateDashboardOverview(subContainer);
    }
  } else if (targetSub === 'activity') {
    updateActivityList(subContainer, false);
    updateStockLedger(subContainer);
    animateActivitySubtab(subContainer);
  } else {
    updateAlertsGroups(subContainer, false);
    animateAlertsSubtab(subContainer);
  }
}

export const page: FeaturePage = {
  title: (params = []) =>
    ({
      activity: 'Activity',
      alerts: 'Alerts',
    })[params[0] ?? ''] ?? 'Dashboard',

  mount(container: HTMLElement) {
    rootContainer = container;
    rootContainer.innerHTML = `
      <div data-sub="overview" hidden></div>
      <div data-sub="activity" hidden></div>
      <div data-sub="alerts" hidden></div>
    `;

    subscribeToStore('orders', () => {
      const overviewEl = queryOne<HTMLElement>('[data-sub="overview"]', rootContainer!);
      const alertsEl = queryOne<HTMLElement>('[data-sub="alerts"]', rootContainer!);
      if (isCurrentSubtab('overview') && overviewEl) {
        updateKpiCards(overviewEl, false);
        updateSalesOverview(overviewEl, false);
        updateShipsToday(overviewEl, false);
        updateTopSellers(overviewEl);
        updateAlertsList(overviewEl);
        updateHelloSub(overviewEl);
      } else if (isCurrentSubtab('alerts') && alertsEl) {
        updateAlertsGroups(alertsEl, true);
      }
    });

    subscribeToStore('products', () => {
      const overviewEl = queryOne<HTMLElement>('[data-sub="overview"]', rootContainer!);
      const alertsEl = queryOne<HTMLElement>('[data-sub="alerts"]', rootContainer!);
      if (isCurrentSubtab('overview') && overviewEl) {
        updateKpiCards(overviewEl, false);
        updateAlertsList(overviewEl);
        updateLocations(overviewEl, false);
      } else if (isCurrentSubtab('alerts') && alertsEl) {
        updateAlertsGroups(alertsEl, true);
      }
    });

    subscribeToStore('materials', () => {
      const overviewEl = queryOne<HTMLElement>('[data-sub="overview"]', rootContainer!);
      const alertsEl = queryOne<HTMLElement>('[data-sub="alerts"]', rootContainer!);
      if (isCurrentSubtab('overview') && overviewEl) {
        updateKpiCards(overviewEl, false);
        updateAlertsList(overviewEl);
      } else if (isCurrentSubtab('alerts') && alertsEl) {
        updateAlertsGroups(alertsEl, true);
      }
    });

    subscribeToStore('batches', () => {
      const overviewEl = queryOne<HTMLElement>('[data-sub="overview"]', rootContainer!);
      const alertsEl = queryOne<HTMLElement>('[data-sub="alerts"]', rootContainer!);
      if (isCurrentSubtab('overview') && overviewEl) {
        updateAlertsList(overviewEl);
        updateHelloSub(overviewEl);
      } else if (isCurrentSubtab('alerts') && alertsEl) {
        updateAlertsGroups(alertsEl, true);
      }
    });

    subscribeToStore('pos', () => {
      const alertsEl = queryOne<HTMLElement>('[data-sub="alerts"]', rootContainer!);
      if (isCurrentSubtab('alerts') && alertsEl) {
        updateAlertsGroups(alertsEl, true);
      }
    });

    subscribeToStore('activity', () => {
      const overviewEl = queryOne<HTMLElement>('[data-sub="overview"]', rootContainer!);
      const activityEl = queryOne<HTMLElement>('[data-sub="activity"]', rootContainer!);
      if (isCurrentSubtab('overview') && overviewEl) {
        updateRecentActivities(overviewEl, false);
      } else if (isCurrentSubtab('activity') && activityEl) {
        updateActivityList(activityEl, true);
      }
    });

    subscribeToStore('moves', () => {
      const activityEl = queryOne<HTMLElement>('[data-sub="activity"]', rootContainer!);
      if (isCurrentSubtab('activity') && activityEl) {
        updateStockLedger(activityEl);
      }
    });

    subscribeToStore('history', () => {
      // History changes automatically reflected on subtab entry
    });

    subscribeToStore('settings', () => {
      const overviewEl = queryOne<HTMLElement>('[data-sub="overview"]', rootContainer!);
      if (isCurrentSubtab('overview') && overviewEl) {
        updateSalesOverview(overviewEl, false);
      }
    });

    let lastClockUpdate = 0;
    gsap.ticker.add(() => {
      const now = Date.now();
      if (now - lastClockUpdate > 10000 && isCurrentSubtab('overview')) {
        lastClockUpdate = now;
        const overviewEl = queryOne<HTMLElement>('[data-sub="overview"]', rootContainer!);
        if (overviewEl) updateClock(overviewEl);
      }
    });
  },

  enter({ params, same }) {
    const targetSub = ['overview', 'activity', 'alerts'].includes(params[0] ?? '') ? params[0] : 'overview';
    if (!(same && targetSub === currentSubtab && initializedSubtabs.has(targetSub))) {
      switchSubtab(targetSub, true);
    }
  },

  leave() {},
};
