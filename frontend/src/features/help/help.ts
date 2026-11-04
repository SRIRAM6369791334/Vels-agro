import { domQuery, domQueryAll } from '../../utils/dom';
import { subscribeToStore } from '../../core/store';
import { motionDuration } from '../../core/motion';
import type { FeaturePage } from '../../types/common';
import {
  initHelpCenterView,
  filterAndRenderFaqList,
  animateHelpCenterEntry,
  openFaqItemById,
  updateOpenTicketsStatus,
} from './subtabs/center';
import {
  initTicketsView,
  filterAndRenderTicketsList,
  animateTicketsEntry,
  openTicketItemById,
} from './subtabs/tickets';

const SUBTABS = ['center', 'tickets'] as const;
type HelpSubtab = (typeof SUBTABS)[number];

let pageContainer: HTMLElement | null = null;
let activeSubtab: HelpSubtab = 'center';
const mountedSubtabs = new Set<HelpSubtab>();

function getSubtabContainer(subtab: HelpSubtab): HTMLElement {
  return domQuery<HTMLElement>(`[data-sub="${subtab}"]`, pageContainer!);
}

function isSubtabVisible(subtab: HelpSubtab): boolean {
  return !!pageContainer && !pageContainer.hidden && activeSubtab === subtab;
}

function activateSubtab(subtab: HelpSubtab): void {
  activeSubtab = subtab;
  domQueryAll<HTMLElement>('[data-sub]', pageContainer!).forEach((el) => {
    el.hidden = el.dataset.sub !== subtab;
  });

  if (!mountedSubtabs.has(subtab)) {
    mountedSubtabs.add(subtab);
    const subContainer = getSubtabContainer(subtab);
    if (subtab === 'center') {
      initHelpCenterView(subContainer);
    } else {
      initTicketsView(subContainer);
    }
  }

  const currentContainer = getSubtabContainer(subtab);
  if (subtab === 'center') {
    filterAndRenderFaqList(false);
    animateHelpCenterEntry(currentContainer);
  } else {
    filterAndRenderTicketsList(false);
    animateTicketsEntry(currentContainer);
  }
}

function handleDeepLink(subtab: HelpSubtab, itemId?: string): void {
  if (!itemId) return;
  if (subtab === 'center') {
    openFaqItemById(itemId);
  } else {
    openTicketItemById(itemId);
  }
}

export const page: FeaturePage = {
  title(params = []) {
    if (params[0] === 'tickets') {
      return 'My tickets';
    }
    return 'Help center';
  },

  mount(container: HTMLElement) {
    pageContainer = container;
    pageContainer.innerHTML = SUBTABS.map((sub) => `<div data-sub="${sub}" hidden></div>`).join('');

    subscribeToStore('tickets', () => {
      if (isSubtabVisible('tickets')) {
        filterAndRenderTicketsList(true);
      } else if (isSubtabVisible('center')) {
        updateOpenTicketsStatus();
      }
    });
  },

  enter({ params, same }) {
    const rawSub = params[0] as HelpSubtab;
    const targetSub: HelpSubtab = SUBTABS.includes(rawSub) ? rawSub : 'center';

    if (same && targetSub === activeSubtab && mountedSubtabs.has(targetSub)) {
      handleDeepLink(targetSub, params[1]);
      return;
    }

    activateSubtab(targetSub);
    if (params[1]) {
      setTimeout(() => handleDeepLink(targetSub, params[1]), motionDuration(450));
    }
  },

  leave() {
    // Teardown / cleanup if necessary
  },
};
