import { domQuery, domQueryAll } from '../../utils/dom';
import { subscribeToStore, findCustomerById } from '../../core/store';
import type { FeaturePage } from '../../types/common';
import '../promotions/promotions.css';
import {
  mountStockistsSubtab,
  renderStockistsList,
  animateStockistsSubtabEnter,
  updateStockistHeaderKpis,
} from './subtabs/stockists';
import {
  mountShoppersSubtab,
  renderShoppersTable,
  animateShoppersSubtabEnter,
  updateShopperHeaderKpis,
} from './subtabs/shoppers';
import {
  openCustomerProfileDrawer,
  refreshActiveDrawer,
  closeActiveCustomerDrawer,
} from './components/customer-drawer';
import { renderFarmersSubtab } from './subtabs/farmers';

const SUBTABS = ['farmers', 'stockists', 'shoppers'] as const;
type CustomerSubtab = (typeof SUBTABS)[number];

let pageContainer: HTMLElement | null = null;
let activeSubtab: CustomerSubtab = 'farmers';
const mountedSubtabs = new Set<CustomerSubtab>();

function getSubtabContainer(subtab: CustomerSubtab): HTMLElement {
  return domQuery<HTMLElement>(`[data-sub="${subtab}"]`, pageContainer!);
}

function isSubtabVisible(subtab: CustomerSubtab): boolean {
  return !!pageContainer && !pageContainer.hidden && activeSubtab === subtab;
}

function activateSubtab(subtab: CustomerSubtab): void {
  activeSubtab = subtab;
  domQueryAll<HTMLElement>('[data-sub]', pageContainer!).forEach((el) => {
    el.hidden = el.dataset.sub !== subtab;
  });

  if (!mountedSubtabs.has(subtab)) {
    mountedSubtabs.add(subtab);
    const subContainer = getSubtabContainer(subtab);
    if (subtab === 'farmers') {
      renderFarmersSubtab(subContainer);
    } else if (subtab === 'stockists') {
      mountStockistsSubtab(subContainer);
    } else {
      mountShoppersSubtab(subContainer);
    }
  }

  const currentContainer = getSubtabContainer(subtab);
  if (subtab === 'farmers') {
    renderFarmersSubtab(currentContainer);
  } else if (subtab === 'stockists') {
    updateStockistHeaderKpis(currentContainer);
    renderStockistsList(false);
    animateStockistsSubtabEnter(currentContainer);
  } else {
    updateShopperHeaderKpis(currentContainer);
    renderShoppersTable(false);
    animateShoppersSubtabEnter(currentContainer);
  }
}

export const page: FeaturePage = {
  title(params = []) {
    const sub = params[0] ?? 'farmers';
    if (sub === 'farmers') return 'Customers';
    const baseTitle = sub === 'shoppers' ? 'Shoppers' : 'Stockists';
    const customer = params[1] ? findCustomerById(params[1]) : null;
    return customer ? `${baseTitle} · ${customer.name}` : baseTitle;
  },

  mount(container: HTMLElement) {
    pageContainer = container;
    pageContainer.innerHTML = SUBTABS.map((sub) => `<div data-sub="${sub}" hidden></div>`).join('');

    const onStoreChange = () => {
      if (isSubtabVisible('farmers')) {
        renderFarmersSubtab(getSubtabContainer('farmers'));
      } else if (isSubtabVisible('stockists')) {
        updateStockistHeaderKpis(getSubtabContainer('stockists'));
        renderStockistsList(true);
      } else if (isSubtabVisible('shoppers')) {
        updateShopperHeaderKpis(getSubtabContainer('shoppers'));
        renderShoppersTable(true);
      }
      refreshActiveDrawer();
    };

    subscribeToStore('customers', onStoreChange);
    subscribeToStore('orders', onStoreChange);
  },

  enter({ params, same }) {
    const rawSub = params[0] as CustomerSubtab;
    const targetSub: CustomerSubtab = SUBTABS.includes(rawSub) ? rawSub : 'stockists';

    if (!(same && targetSub === activeSubtab && mountedSubtabs.has(targetSub))) {
      activateSubtab(targetSub);
    }

    const customerId = params[1];
    if (customerId) {
      openCustomerProfileDrawer(customerId, targetSub);
    } else {
      closeActiveCustomerDrawer();
    }
  },

  leave() {
    closeActiveCustomerDrawer();
  },
};
