import { CUSTOMER_TAG_NAMES } from '../../../core/constants';
import { escapeHtml } from '../../../utils/dom';
import { formatMoneyRound } from '../../../utils/formatters';
import { renderIcon } from '../../../utils/icons';
import { renderAvatar, highlightSearchMatch } from '../../../main';
import { renderSparklineSvg } from '../../../shared/widgets/charts';
import type { Customer, CustomerMetrics } from '../../../types/customer';
import { formatLastOrderRelative } from '../services/customer-metrics';

export const CUSTOMER_TAG_COLOR_VARS: Record<string, string> = {
  vip: 'pine',
  net30: 'sky',
  new: 'sage',
  subscriber: 'ocean',
};

export function renderCustomerTagBadge(tag: string): string {
  const tone = CUSTOMER_TAG_COLOR_VARS[tag] ?? 'slate';
  const label = CUSTOMER_TAG_NAMES[tag] ?? tag;
  return `<span class="tag" style="--c:var(--${tone})">${label}</span>`;
}

/**
 * CRITICAL TEST INVARIANT:
 * Customer stockist card name MUST be rendered as <h3><b>${highlightSearchMatch(customer.name, query)}</b></h3>
 * inside .cs-card__name to satisfy E2E locator assertions.
 */
export function renderStockistCardHtml(
  customer: Customer,
  metrics: CustomerMetrics,
  query: string
): string {
  const hasSpend = metrics.monthly.some((val) => val > 0);
  const contactText = customer.contact ?? '';

  return `<a class="cs-card" href="#/customers/stockists/${customer.id}" data-key="${customer.id}" data-lift>
    <span class="cs-card__id">${renderAvatar(customer.id, 'lg')}<span class="cs-card__name"><h3><b>${highlightSearchMatch(customer.name, query)}</b></h3><small>${highlightSearchMatch(contactText, query)}</small></span></span>
    <span class="cs-card__loc">${renderIcon('map')}${highlightSearchMatch(`${customer.city}, ${customer.region ?? ''}`, query)}</span>
    <span class="cs-card__tags">${customer.tags.map(renderCustomerTagBadge).join('') || '<span class="cs-none">No tags</span>'}</span>
    <span class="cs-card__figs">
      <span><small>Lifetime</small><b>${formatMoneyRound(metrics.revenue)}</b></span>
      <span><small>Last order</small><b>${escapeHtml(formatLastOrderRelative(metrics.last))}</b></span>
    </span>
    <span class="cs-card__spark">
      ${hasSpend ? renderSparklineSvg(metrics.monthly, 'pine', 220, 40) : '<span class="cs-flat"></span>'}
      <small>${hasSpend ? `${formatMoneyRound(metrics.monthly.at(-1) ?? 0)} this month` : 'No spend in six months'}</small>
    </span>
  </a>`;
}
