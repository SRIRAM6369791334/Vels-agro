// Vels Agro Enterprise — Offers & Promotions Feature Module (Section 17 & 19)
// Main Page Shell, Routing Subtabs & GSAP Transitions

import './promotions.css';
import { renderCouponsSubtab } from './subtabs/coupons-subtab';
import { renderDiscountsSubtab } from './subtabs/discounts-subtab';
import { renderDealerSchemesSubtab } from './subtabs/dealers-scheme-subtab';
import { renderBannersSubtab } from './subtabs/banners-subtab';
import { domQuery, domQueryAll } from '../../main';

const SUBTABS = ['coupons', 'discounts', 'dealers', 'banners'];
let pageContainer: HTMLElement | null = null;
let currentSubtab = 'coupons';
const visitedSubtabs = new Set<string>();

const subEl = (sub: string) => domQuery<HTMLElement>(`[data-sub="${sub}"]`, pageContainer);

export const page = {
  title: (params?: string[]) => {
    const sub = params?.[0] ?? 'coupons';
    switch (sub) {
      case 'discounts':
        return 'Product & Category Offers';
      case 'dealers':
        return 'Dealer Special Schemes';
      case 'banners':
        return 'Banners & Featured Machinery';
      case 'coupons':
      default:
        return 'Offers & Promotions';
    }
  },

  mount(container: HTMLElement) {
    pageContainer = container;
    pageContainer.innerHTML = SUBTABS.map(
      (sub) => `<div class="promo-sub-view" data-sub="${sub}" hidden></div>`
    ).join('');
  },

  enter({ params, same }: { params?: string[]; same?: boolean } = {}) {
    const sub = SUBTABS.includes(params?.[0] || '') ? params![0] : 'coupons';
    currentSubtab = sub;

    // Toggle hidden state
    domQueryAll<HTMLElement>('.promo-sub-view', pageContainer).forEach((el) => {
      el.hidden = el.dataset.sub !== sub;
    });

    const targetEl = subEl(sub);
    if (!targetEl) return;

    if (!visitedSubtabs.has(sub)) {
      visitedSubtabs.add(sub);
      if (sub === 'coupons') {
        renderCouponsSubtab(targetEl);
      } else if (sub === 'discounts') {
        renderDiscountsSubtab(targetEl);
      } else if (sub === 'dealers') {
        renderDealerSchemesSubtab(targetEl);
      } else if (sub === 'banners') {
        renderBannersSubtab(targetEl);
      }
    } else {
      // Re-render to ensure fresh state
      if (sub === 'coupons') {
        renderCouponsSubtab(targetEl);
      } else if (sub === 'discounts') {
        renderDiscountsSubtab(targetEl);
      } else if (sub === 'dealers') {
        renderDealerSchemesSubtab(targetEl);
      } else if (sub === 'banners') {
        renderBannersSubtab(targetEl);
      }
    }
  },

  leave() {
    // Cleanup if necessary
  },
};
