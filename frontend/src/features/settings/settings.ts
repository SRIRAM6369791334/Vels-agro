import { store, subscribeToStore } from '../../core/store';
import { motionDuration } from '../../core/motion';
import { domQuery, domQueryAll, queryOne } from '../../utils/dom';
import { onThemeChange } from '../../main';
import {
  renderAccountSubtab,
  initAccountSubtab,
  animateAccountSubtab,
  updateThemeButtons,
  isAccountFormDirty,
  resetAccountForm,
} from './subtabs/account';
import {
  renderCompanySubtab,
  initCompanySubtab,
  animateCompanySubtab,
  updateExpiryCount,
} from './subtabs/company';
import {
  renderTeamSubtab,
  initTeamSubtab,
  animateTeamSubtab,
  updateMembersTable,
  updateTeamHeaderStats,
  updateSeatsSection,
  openMemberDrawer,
} from './subtabs/team';
import {
  renderBillingSubtab,
  initBillingSubtab,
  animateBillingSubtab,
  updatePlanPrices,
  updateSeatsControls,
  renderInvoicesTable,
  openInvoiceDrawer,
} from './subtabs/billing';
import {
  renderNotificationsSubtab,
  initNotificationsSubtab,
  animateNotificationsSubtab,
  renderAlertsList,
  updateDigestSection,
} from './subtabs/notifications';

let rootContainer: HTMLElement | null = null;
let currentSubtab = 'account';
const initializedSubtabs = new Set<string>();

const VALID_SUBTABS = ['account', 'company', 'team', 'billing', 'notifications'] as const;
type SettingsSubtab = (typeof VALID_SUBTABS)[number];

const SUBTAB_TITLES: Record<string, string> = {
  account: 'Account',
  company: 'Company',
  team: 'Team & roles',
  billing: 'Billing',
  notifications: 'Notifications',
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
      case 'account':
        subContainer.innerHTML = renderAccountSubtab();
        initAccountSubtab(subContainer);
        break;
      case 'company':
        subContainer.innerHTML = renderCompanySubtab();
        initCompanySubtab(subContainer);
        break;
      case 'team':
        subContainer.innerHTML = renderTeamSubtab();
        initTeamSubtab(subContainer);
        break;
      case 'billing':
        subContainer.innerHTML = renderBillingSubtab();
        initBillingSubtab(subContainer);
        break;
      case 'notifications':
        subContainer.innerHTML = renderNotificationsSubtab();
        initNotificationsSubtab(subContainer, () => isSubtabActive('notifications'));
        break;
    }
  }

  switch (subtab) {
    case 'account':
      updateThemeButtons(subContainer);
      animateAccountSubtab(subContainer);
      break;
    case 'company':
      animateCompanySubtab(subContainer);
      break;
    case 'team':
      updateMembersTable(subContainer, false);
      updateTeamHeaderStats(subContainer);
      animateTeamSubtab(subContainer);
      break;
    case 'billing':
      updatePlanPrices(subContainer, false);
      renderInvoicesTable(subContainer, false);
      animateBillingSubtab(subContainer);
      break;
    case 'notifications':
      renderAlertsList(subContainer, false);
      updateDigestSection(subContainer);
      animateNotificationsSubtab(subContainer);
      break;
  }
}

function handleDeepLink(subtab: string, paramId?: string): void {
  if (!paramId) return;
  if (subtab === 'team') {
    openMemberDrawer(paramId);
  } else if (subtab === 'billing') {
    openInvoiceDrawer(paramId);
  }
}

export const page = {
  title: (params: string[]) => SUBTAB_TITLES[params[0] ?? ''] ?? 'Settings',

  mount(container: HTMLElement) {
    rootContainer = container;
    rootContainer.innerHTML = VALID_SUBTABS.map((s) => `<div data-sub="${s}" hidden></div>`).join('');

    subscribeToStore('team', () => {
      const teamContainer = getSubtabContainer('team');
      if (isSubtabActive('team') && teamContainer) {
        updateMembersTable(teamContainer, true);
        updateTeamHeaderStats(teamContainer);
        updateSeatsSection(teamContainer, false);
      }
      const billingContainer = getSubtabContainer('billing');
      if (isSubtabActive('billing') && billingContainer) {
        updatePlanPrices(billingContainer, false);
        updateSeatsControls(billingContainer, false);
      }
      const accountContainer = getSubtabContainer('account');
      if (isSubtabActive('account') && accountContainer) {
        const form = queryOne<HTMLFormElement>('[data-k="ac-form"]', accountContainer);
        if (form && !isAccountFormDirty(form)) {
          resetAccountForm(form, accountContainer);
        }
      }
    });

    subscribeToStore('settings', () => {
      const billingContainer = getSubtabContainer('billing');
      if (isSubtabActive('billing') && billingContainer) {
        updatePlanPrices(billingContainer, true);
        updateSeatsControls(billingContainer, false);
        renderInvoicesTable(billingContainer, false);
        const cardSub = queryOne<HTMLElement>('.st-pay .card__sub', rootContainer);
        if (cardSub) {
          cardSub.textContent = `Charged on the 3rd of each ${store.settings.billing.cycle === 'yearly' ? 'year' : 'month'}`;
        }
      }
      const teamContainer = getSubtabContainer('team');
      if (isSubtabActive('team') && teamContainer) {
        updateTeamHeaderStats(teamContainer);
        updateSeatsSection(teamContainer, false);
      }
      const notifContainer = getSubtabContainer('notifications');
      if (isSubtabActive('notifications') && notifContainer) {
        updateDigestSection(notifContainer);
      }
    });

    subscribeToStore('batches', () => {
      const companyContainer = getSubtabContainer('company');
      if (isSubtabActive('company') && companyContainer) {
        updateExpiryCount(companyContainer);
      }
      const notifContainer = getSubtabContainer('notifications');
      if (isSubtabActive('notifications') && notifContainer) {
        updateDigestSection(notifContainer);
      }
    });

    subscribeToStore('products', () => {
      const notifContainer = getSubtabContainer('notifications');
      if (isSubtabActive('notifications') && notifContainer) {
        updateDigestSection(notifContainer);
      }
    });

    onThemeChange(() => {
      const accountContainer = getSubtabContainer('account');
      if (initializedSubtabs.has('account') && accountContainer) {
        updateThemeButtons(accountContainer);
      }
    });
  },

  enter({ params, same }: { params: string[]; first: boolean; same: boolean }) {
    const sub = (VALID_SUBTABS as readonly string[]).includes(params[0] ?? '') ? params[0] : 'account';

    if (same && sub === currentSubtab && initializedSubtabs.has(sub)) {
      handleDeepLink(sub, params[1]);
      return;
    }

    activateSubtab(sub);

    if (params[1]) {
      setTimeout(() => handleDeepLink(sub, params[1]), motionDuration(350));
    }
  },

  leave() {},
};
