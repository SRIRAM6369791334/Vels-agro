// Vels Agro Enterprise — Reviews & Ratings Feature Module (Section 22)
// Main Page Shell, Routing Subtabs & Transition Lifecycle

import '../promotions/promotions.css';
import './reviews.css';
import { renderAllReviewsSubtab } from './subtabs/all-reviews-subtab';
import { renderProductRatingsSubtab } from './subtabs/product-ratings-subtab';
import { renderFeedbackSubtab } from './subtabs/feedback-subtab';
import { domQuery, domQueryAll } from '../../main';

const SUBTABS = ['all', 'products', 'feedback'];
let pageContainer: HTMLElement | null = null;
let currentSubtab = 'all';
const visitedSubtabs = new Set<string>();

const subEl = (sub: string) => domQuery<HTMLElement>(`[data-sub="${sub}"]`, pageContainer);

export const page = {
  title: (params?: string[]) => {
    const sub = params?.[0] ?? 'all';
    switch (sub) {
      case 'products':
        return 'Product Ratings & Scorecard';
      case 'feedback':
        return 'Customer Feedback & Service';
      case 'all':
      default:
        return 'Reviews & Ratings';
    }
  },

  mount(container: HTMLElement) {
    pageContainer = container;
    pageContainer.innerHTML = SUBTABS.map(
      (sub) => `<div class="reviews-sub-view" data-sub="${sub}" hidden></div>`
    ).join('');
  },

  enter({ params }: { params?: string[]; same?: boolean } = {}) {
    const sub = SUBTABS.includes(params?.[0] || '') ? params![0] : 'all';
    currentSubtab = sub;

    // Toggle hidden state
    domQueryAll<HTMLElement>('.reviews-sub-view', pageContainer).forEach((el) => {
      el.hidden = el.dataset.sub !== sub;
    });

    const targetEl = subEl(sub);
    if (!targetEl) return;

    if (!visitedSubtabs.has(sub)) {
      visitedSubtabs.add(sub);
      if (sub === 'all') {
        renderAllReviewsSubtab(targetEl);
      } else if (sub === 'products') {
        renderProductRatingsSubtab(targetEl);
      } else if (sub === 'feedback') {
        renderFeedbackSubtab(targetEl);
      }
    } else {
      // Re-render to ensure fresh state
      if (sub === 'all') {
        renderAllReviewsSubtab(targetEl);
      } else if (sub === 'products') {
        renderProductRatingsSubtab(targetEl);
      } else if (sub === 'feedback') {
        renderFeedbackSubtab(targetEl);
      }
    }
  },

  leave() {
    // Teardown when navigating away
  },
};
