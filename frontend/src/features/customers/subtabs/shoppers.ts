import { ONE_DAY_MS, CUSTOMER_TAG_NAMES } from '../../../core/constants';
import { store } from '../../../core/store';
import {
  playHaptic,
  bindMagnetic,
  animatePulse,
  animateCards,
  animateRows,
  gsap,
} from '../../../core/motion';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import {
  formatDate,
  formatRelativeTime,
  formatMoneyRound,
  formatInt,
  formatPercent,
  pluralize,
} from '../../../utils/formatters';
import { renderIcon } from '../../../utils/icons';
import {
  renderPageHeader,
  renderEmptyState,
  renderFilterBar,
  renderAvatar,
  openNewCustomerModal,
  bindModalDismiss,
  highlightSearchMatch,
  animatePageTransition,
  getOrderTotal,
} from '../../../main';
import type { Customer } from '../../../types/customer';
import { buildCustomerMetricsMap } from '../services/customer-metrics';
import { renderCustomerTagBadge } from '../components/stockist-card';

export const SHOPPER_TABLE_COLUMNS = [
  ['name', 'Shopper', 'a-t'],
  ['city', 'City', 'a-s'],
  ['orders', 'Orders', 'a-h r'],
  ['spend', 'Spend', 'a-r r'],
  ['last', 'Last order', 'a-p'],
  ['', 'Tags', 'a-g'],
] as const;

let rootContainer: HTMLElement | null = null;
let searchQuery = '';
let selectedTag = 'all';
let sortColumn = 'spend';
let sortDirection: 1 | -1 = -1;
let displayLimit = 25;

export function computeShopperKpis() {
  const shoppers = store.customers.filter((c: any) => c.kind === 'shopper');
  const metricsMap = buildCustomerMetricsMap('shopper');
  const activeShoppers = shoppers.filter((c: any) => (metricsMap.get(c.id)?.n ?? 0) > 0);
  const totalRevenue = activeShoppers.reduce(
    (acc: number, item: any) => acc + (metricsMap.get(item.id)?.revenue ?? 0),
    0
  );

  const thirtyDaysAgo = Date.now() - 30 * ONE_DAY_MS;
  const shopperIdsSet = new Set(shoppers.map((c: any) => c.id));
  const recentOrders = store.orders.filter(
    (o: any) => shopperIdsSet.has(o.customerId) && o.createdAt >= thirtyDaysAgo && o.status !== 'cancelled'
  );
  const recentSpent = recentOrders.reduce((acc: number, item: any) => acc + getOrderTotal(item), 0);

  const subscribersCount = shoppers.filter((c: any) => c.tags.includes('subscriber')).length;
  const newThisMonthCount = shoppers.filter((c: any) => (c.since ?? 0) >= thirtyDaysAgo).length;

  return [
    {
      key: 'n',
      icon: 'users',
      ico: 'sky',
      label: 'Shoppers',
      value: shoppers.length,
      badge: `${newThisMonthCount} new this month`,
      tone: 'plain',
    },
    {
      key: 'sub',
      icon: 'refresh',
      ico: 'ocean',
      label: 'Subscribers',
      value: subscribersCount,
      badge: formatPercent(shoppers.length ? subscribersCount / shoppers.length : 0),
      tone: 'plain',
    },
    {
      key: 'rep',
      icon: 'cart',
      ico: 'ochre',
      label: 'Spent · 30 days',
      value: recentSpent,
      fmt: 'money',
      badge: pluralize(recentOrders.length, 'order'),
      tone: 'plain',
    },
    {
      key: 'avg',
      icon: 'dollar',
      ico: 'teal',
      label: 'Average spend',
      value: activeShoppers.length ? totalRevenue / activeShoppers.length : 0,
      fmt: 'money',
    },
  ];
}

export function renderShoppersTable(animate: boolean): void {
  if (!rootContainer) return;
  const rawQuery = searchQuery.trim();
  const lowerQuery = rawQuery.toLowerCase();
  const metricsMap = buildCustomerMetricsMap('shopper');
  const allShoppers: Customer[] = store.customers.filter((c: any) => c.kind === 'shopper');

  const textFiltered = allShoppers.filter(
    (c) =>
      !lowerQuery ||
      `${c.name} ${c.email} ${c.city} ${c.region ?? ''}`.toLowerCase().includes(lowerQuery)
  );

  const tagKeys = ['all', 'vip', 'subscriber', 'new', 'none'];
  const countPerTag = (tag: string) => {
    if (tag === 'all') return textFiltered.length;
    if (tag === 'none') return textFiltered.filter((c) => !metricsMap.get(c.id)?.n).length;
    return textFiltered.filter((c) => c.tags.includes(tag)).length;
  };

  const tagChipsContainer = domQuery<HTMLElement>('[data-k="p-tags"]', rootContainer);
  if (tagChipsContainer.children.length) {
    tagKeys.forEach((tag) => {
      const btn = domQuery<HTMLElement>(`[data-tag="${tag}"]`, tagChipsContainer);
      if (btn) {
        btn.setAttribute('aria-pressed', String(tag === selectedTag));
        const badge = domQuery('b', btn);
        if (badge && badge.textContent !== String(countPerTag(tag))) {
          badge.textContent = String(countPerTag(tag));
          animatePulse(badge);
        }
      }
    });
  } else {
    tagChipsContainer.innerHTML = tagKeys
      .map(
        (tag) =>
          `<button type="button" class="chip" data-tag="${tag}" aria-pressed="${tag === selectedTag}">${tag === 'all' ? 'All shoppers' : tag === 'none' ? 'No orders yet' : (CUSTOMER_TAG_NAMES as any)[tag]} <b>${countPerTag(tag)}</b></button>`
      )
      .join('');
  }

  const finalFiltered = textFiltered.filter(
    (c) => selectedTag === 'all' || (selectedTag === 'none' ? !metricsMap.get(c.id)?.n : c.tags.includes(selectedTag))
  );

  const getMetrics = (c: Customer) => metricsMap.get(c.id)!;
  const sortExtractors: Record<string, (c: Customer) => any> = {
    name: (c) => c.name.toLowerCase(),
    city: (c) => c.city,
    orders: (c) => getMetrics(c).n,
    spend: (c) => getMetrics(c).revenue,
    last: (c) => getMetrics(c).last,
  };

  finalFiltered.sort((a, b) => {
    const valA = sortExtractors[sortColumn]?.(a) ?? '';
    const valB = sortExtractors[sortColumn]?.(b) ?? '';
    return (valA < valB ? -1 : +(valA > valB)) * sortDirection || a.name.localeCompare(b.name);
  });

  const theadEl = domQuery<HTMLElement>('[data-k="p-head"]', rootContainer);
  theadEl.innerHTML = `<tr>${SHOPPER_TABLE_COLUMNS.map(([colKey, label, cssClass]) => `<th scope="col" class="${cssClass}"${colKey && colKey === sortColumn ? ` aria-sort="${sortDirection > 0 ? 'ascending' : 'descending'}"` : ''}>${colKey ? `<button type="button" data-sort="${colKey}">${label}${renderIcon(colKey === sortColumn && sortDirection > 0 ? 'up' : 'down', colKey === sortColumn ? '' : 'sh-idle')}</button>` : label}</th>`).join('')}</tr>`;

  const pagedShoppers = finalFiltered.slice(0, displayLimit);
  const tbodyEl = domQuery<HTMLElement>('[data-k="p-body"]', rootContainer);
  const tableRowsHtml = pagedShoppers.length
    ? pagedShoppers
        .map((shopper) => {
          const m = getMetrics(shopper);
          return `<tr class="is-link" data-key="${shopper.id}" data-open="${shopper.id}">
        <td class="a-t">
          <span class="cell-person">
            ${renderAvatar(shopper.id, 'md')}
            <span>
              <a class="sh-name" href="#/customers/shoppers/${shopper.id}">${highlightSearchMatch(shopper.name, rawQuery)}</a>
              <small>${highlightSearchMatch(shopper.email, rawQuery)}</small>
            </span>
          </span>
        </td>
        <td class="a-s sh-city">${renderIcon('map')}${highlightSearchMatch(`${shopper.city}, ${shopper.region ?? ''}`, rawQuery)}</td>
        <td class="a-h r"><b>${formatInt(m.n)}</b></td>
        <td class="a-r r sh-spend">
          <b>${formatMoneyRound(m.revenue)}</b>
          <small class="sh-n">${pluralize(m.n, 'order')}</small>
        </td>
        <td class="a-p sh-last">
          ${m.last ? `<span>${escapeHtml(formatRelativeTime(m.last))}</span>${formatRelativeTime(m.last) === formatDate(m.last) ? '' : `<small>${escapeHtml(formatDate(m.last))}</small>`}` : '<span class="sh-never">No orders yet</span>'}
        </td>
        <td class="a-g"><span class="sh-tags">${shopper.tags.map(renderCustomerTagBadge).join('') || '<span class="cs-none">—</span>'}</span></td>
      </tr>`;
        })
        .join('')
    : `<tr class="sh-empty"><td colspan="6">${allShoppers.length ? renderEmptyState('No shoppers match', 'Try another name, email or city — or clear the filter.', 'search', '<button type="button" class="btn btn--ghost btn--sm" data-act="pclear">' + renderIcon('refresh') + 'Clear filters</button>') : renderEmptyState('No shoppers yet', 'People who buy online or in the studio appear here after their first order.', 'users', '<button type="button" class="btn btn--primary btn--sm" data-act="new">' + renderIcon('userPlus') + 'New customer</button>')}</td></tr>`;

  if (animate) {
    bindModalDismiss(tbodyEl, () => {
      tbodyEl.innerHTML = tableRowsHtml;
    });
  } else {
    tbodyEl.innerHTML = tableRowsHtml;
  }

  const footEl = domQuery<HTMLElement>('[data-k="p-foot"]', rootContainer);
  footEl.innerHTML =
    finalFiltered.length > displayLimit
      ? `<span>Showing ${formatInt(pagedShoppers.length)} of ${pluralize(finalFiltered.length, 'shopper')}</span><button type="button" class="btn btn--ghost btn--sm" data-do="more">Show more${renderIcon('down')}</button>`
      : finalFiltered.length
        ? `<span>${pluralize(finalFiltered.length, 'shopper')} · ${formatMoneyRound(finalFiltered.reduce((acc, item) => acc + getMetrics(item).revenue, 0))} spent</span>`
        : '';
}

export function mountShoppersSubtab(container: HTMLElement): void {
  rootContainer = container;
  rootContainer.innerHTML = `${renderPageHeader({
    eyebrow: 'People who buy online and at the studio shop',
    title: 'Shoppers',
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="new">${renderIcon('userPlus')}New customer</button>`,
    stats: computeShopperKpis(),
  })}
  <section class="card sh-card" aria-label="Shoppers">
    <div class="toolbar">
      <div class="chips" data-k="p-tags" role="group" aria-label="Tag"></div>
      <span class="toolbar__spacer"></span>
      <label class="search cs-search">
        ${renderIcon('search')}
        <input type="search" placeholder="Name, email or city…" aria-label="Search shoppers" data-k="p-q" />
      </label>
    </div>
    <div class="table-wrap">
      <table class="table table--stack sh-table" style="--areas:'t r' 's p' 'g g'">
        <thead data-k="p-head"></thead>
        <tbody data-k="p-body"></tbody>
      </table>
    </div>
    <div class="sh-foot" data-k="p-foot"></div>
  </section>`;

  bindMagnetic(rootContainer);

  const tagsEl = domQuery<HTMLElement>('[data-k="p-tags"]', rootContainer);
  tagsEl.addEventListener('click', (evt) => {
    const chipBtn = (evt.target as HTMLElement).closest<HTMLElement>('[data-tag]');
    if (chipBtn) {
      playHaptic(chipBtn);
      selectedTag = chipBtn.dataset.tag!;
      displayLimit = 25;
      renderShoppersTable(true);
    }
  });

  const searchInput = domQuery<HTMLInputElement>('[data-k="p-q"]', rootContainer);
  searchInput.addEventListener('input', (evt) => {
    searchQuery = (evt.target as HTMLInputElement).value;
    displayLimit = 25;
    renderShoppersTable(true);
  });

  const theadEl = domQuery<HTMLElement>('[data-k="p-head"]', rootContainer);
  theadEl.addEventListener('click', (evt) => {
    const sortBtn = (evt.target as HTMLElement).closest<HTMLElement>('[data-sort]');
    if (!sortBtn) return;

    const columnKey = sortBtn.dataset.sort!;
    if (columnKey === sortColumn) {
      sortDirection = sortDirection === 1 ? -1 : 1;
    } else {
      sortColumn = columnKey;
      sortDirection = columnKey === 'name' || columnKey === 'city' ? 1 : -1;
    }
    renderShoppersTable(true);
  });

  const tbodyEl = domQuery<HTMLElement>('[data-k="p-body"]', rootContainer);
  tbodyEl.addEventListener('click', (evt) => {
    const target = evt.target as HTMLElement;
    if (target.closest('a, button')) return;

    const row = target.closest<HTMLElement>('tr[data-open]');
    if (row) {
      (window as any).navigateTo?.(`/customers/shoppers/${row.dataset.open}`);
    }
  });

  const footEl = domQuery<HTMLElement>('[data-k="p-foot"]', rootContainer);
  footEl.addEventListener('click', (evt) => {
    if ((evt.target as HTMLElement).closest('[data-do="more"]')) {
      displayLimit += 25;
      renderShoppersTable(true);
    }
  });

  rootContainer.addEventListener('click', (evt) => {
    const actBtn = (evt.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (actBtn) {
      playHaptic(actBtn);
      if (actBtn.dataset.act === 'new') {
        openNewCustomerModal(actBtn, (newCustomer: any) => {
          (window as any).navigateTo?.(`/customers/${newCustomer.kind === 'stockist' ? 'stockists' : 'shoppers'}/${newCustomer.id}`);
        });
      } else if (actBtn.dataset.act === 'pclear') {
        searchQuery = '';
        selectedTag = 'all';
        searchInput.value = '';
        renderShoppersTable(true);
      }
    }
  });
}

export function animateShoppersSubtabEnter(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(
      animateCards(domQueryAll('.sh-card', container), {
        y: 26,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll('.sh-card .toolbar > *:not(.toolbar__spacer), .sh-card .chip', container), {
        y: 8,
        stagger: 0.03,
      }),
      0.25
    )
    .add(
      animateRows(domQueryAll('tbody tr', container).slice(0, 14), {
        y: 12,
        stagger: 0.03,
      }),
      0.33
    );
}

export function updateShopperHeaderKpis(container: HTMLElement): void {
  computeShopperKpis().forEach((stat) => {
    const statEl = queryOne<HTMLElement>(`[data-stat="${stat.key}"]`, container);
    if (!statEl) return;

    const countEl = queryOne<HTMLElement>('[data-count]', statEl);
    if (countEl && Number(countEl.dataset.count) !== stat.value) {
      renderFilterBar(countEl, stat.value);
      animatePulse(countEl);
    }
    const badgeEl = queryOne<HTMLElement>('.badge', statEl);
    if (badgeEl && stat.badge !== undefined) {
      badgeEl.textContent = stat.badge;
      badgeEl.className = `badge badge--${stat.tone ?? 'plain'}`;
    }
  });
}
