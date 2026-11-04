import { ONE_DAY_MS, CUSTOMER_TAG_NAMES } from '../../../core/constants';
import { store } from '../../../core/store';
import {
  playHaptic,
  bindMagnetic,
  prefersReducedMotion,
  animatePulse,
  initLiftAnimations,
  motionDuration,
  animateCards,
  animateRows,
  gsap,
} from '../../../core/motion';
import { openDropdownMenu } from '../../../ui/popover';
import { domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import { renderIcon, renderIconButton } from '../../../utils/icons';
import {
  renderPageHeader,
  renderEmptyState,
  renderFilterBar,
  openNewCustomerModal,
  bindModalDismiss,
  animatePageTransition,
  animateWobble,
  getOrderTotal,
} from '../../../main';
import type { Customer } from '../../../types/customer';
import { buildCustomerMetricsMap } from '../services/customer-metrics';
import { renderStockistCardHtml } from '../components/stockist-card';

export const STOCKIST_SORT_OPTIONS = [
  ['revenue', 'Lifetime revenue'],
  ['last', 'Last order'],
  ['name', 'Name, A–Z'],
  ['since', 'Newest stockists'],
] as const;

let rootContainer: HTMLElement | null = null;
let searchQuery = '';
let selectedTag = 'all';
let currentSort = 'revenue';
let viewMode: 'grid' | 'list' = 'grid';

try {
  viewMode = localStorage.getItem('Vels:stockist-view') === 'list' ? 'list' : 'grid';
} catch {}

export function computeStockistKpis() {
  const stockists = store.customers.filter((c: any) => c.kind === 'stockist');
  const metricsMap = buildCustomerMetricsMap('stockist');
  const activeCount = stockists.filter(
    (c: any) => (metricsMap.get(c.id)?.last ?? 0) >= Date.now() - 60 * ONE_DAY_MS
  ).length;

  const ninetyDaysAgo = Date.now() - 90 * ONE_DAY_MS;
  const wholesaleOrders = store.orders.filter(
    (o: any) => o.channel === 'wholesale' && o.status !== 'cancelled' && o.createdAt >= ninetyDaysAgo
  );
  const wholesaleRev = wholesaleOrders.reduce((acc: number, item: any) => acc + getOrderTotal(item), 0);
  const totalUnpaid = [...metricsMap.values()].reduce((acc, item) => acc + item.unpaid, 0);

  return [
    {
      key: 'n',
      icon: 'store',
      ico: 'pine',
      label: 'Stockists',
      value: stockists.length,
      badge: `${activeCount} active`,
      tone: 'good',
    },
    {
      key: 'rev',
      icon: 'trend',
      ico: 'teal',
      label: 'Wholesale · 90 days',
      value: wholesaleRev,
      fmt: 'money',
    },
    {
      key: 'avg',
      icon: 'receipt',
      ico: 'sky',
      label: 'Average order',
      value: wholesaleOrders.length ? wholesaleRev / wholesaleOrders.length : 0,
      fmt: 'money',
    },
    {
      key: 'due',
      icon: 'clock',
      ico: 'ochre',
      label: 'On account, unpaid',
      value: totalUnpaid,
      fmt: 'money',
      badge: totalUnpaid ? 'Net 30' : 'All settled',
      tone: totalUnpaid ? 'warn' : 'good',
    },
  ];
}

export function animateSparklineStrokes(container: HTMLElement, delay = 0): void {
  domQueryAll<SVGPathElement>('.cs-card__spark path', container).forEach((pathEl, idx) => {
    const len = pathEl.getTotalLength();
    gsap.fromTo(
      pathEl,
      {
        strokeDasharray: len,
        strokeDashoffset: len,
      },
      {
        strokeDashoffset: 0,
        duration: motionDuration(1.1),
        delay: motionDuration(delay + Math.min(idx, 10) * 0.06),
        ease: 'power2.inOut',
        clearProps: 'strokeDasharray,strokeDashoffset',
      }
    );
  });
}

function animateViewSwitch(): void {
  const gridEl = domQuery<HTMLElement>('[data-k="s-grid"]', rootContainer!);
  const cards = domQueryAll<HTMLElement>('.cs-card', gridEl);

  if (prefersReducedMotion.matches || !cards.length) {
    gridEl.classList.toggle('is-list', viewMode === 'list');
    return;
  }

  gsap.to(cards, {
    opacity: 0,
    y: 8,
    scale: 0.97,
    duration: 0.16,
    stagger: 0.012,
    ease: 'power2.in',
    overwrite: true,
    onComplete: () => {
      gridEl.classList.toggle('is-list', viewMode === 'list');
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 14,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.035,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
      animateSparklineStrokes(gridEl, 0.1);
    },
  });
}

export function renderStockistsList(animate: boolean): void {
  if (!rootContainer) return;
  const rawQuery = searchQuery.trim();
  const lowerQuery = rawQuery.toLowerCase();
  const metricsMap = buildCustomerMetricsMap('stockist');
  const allStockists: Customer[] = store.customers.filter((c: any) => c.kind === 'stockist');

  const textFiltered = allStockists.filter(
    (c) =>
      !lowerQuery ||
      `${c.name} ${c.contact ?? ''} ${c.city} ${c.region ?? ''} ${c.email}`.toLowerCase().includes(lowerQuery)
  );

  const tagKeys = ['all', 'vip', 'net30', 'new'];
  const countPerTag = (tag: string) => {
    if (tag === 'all') return textFiltered.length;
    return textFiltered.filter((c) => c.tags.includes(tag)).length;
  };

  const tagChipsContainer = domQuery<HTMLElement>('[data-k="s-tags"]', rootContainer);
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
          `<button type="button" class="chip" data-tag="${tag}" aria-pressed="${tag === selectedTag}">${tag === 'all' ? 'All stockists' : (CUSTOMER_TAG_NAMES as any)[tag]} <b>${countPerTag(tag)}</b></button>`
      )
      .join('');
  }

  const finalFiltered = textFiltered.filter((c) => selectedTag === 'all' || c.tags.includes(selectedTag));
  const getMetrics = (c: Customer) => metricsMap.get(c.id)!;

  finalFiltered.sort((a, b) => {
    if (currentSort === 'revenue') {
      return getMetrics(b).revenue - getMetrics(a).revenue;
    }
    if (currentSort === 'last') {
      return getMetrics(b).last - getMetrics(a).last;
    }
    if (currentSort === 'since') {
      return (b.since ?? 0) - (a.since ?? 0);
    }
    return a.name.localeCompare(b.name);
  });

  const gridEl = domQuery<HTMLElement>('[data-k="s-grid"]', rootContainer);
  const markup = finalFiltered.length
    ? finalFiltered.map((c) => renderStockistCardHtml(c, getMetrics(c), rawQuery)).join('')
    : `<div class="cs-empty">${allStockists.length ? renderEmptyState('No stockists match', `Nothing ${selectedTag === 'all' ? '' : `tagged ${(CUSTOMER_TAG_NAMES as any)[selectedTag]} `}for “${rawQuery || 'that filter'}”. Try another name or city.`, 'search', `<button type="button" class="btn btn--ghost btn--sm" data-act="sclear">${renderIcon('refresh')}Clear filters</button>`) : renderEmptyState('No stockists yet', 'Add the first shop that sells your range wholesale.', 'store', `<button type="button" class="btn btn--primary btn--sm" data-act="new">${renderIcon('userPlus')}New customer</button>`)}</div>`;

  if (animate) {
    bindModalDismiss(gridEl, () => {
      gridEl.innerHTML = markup;
    });
  } else {
    gridEl.innerHTML = markup;
  }

  initLiftAnimations(gridEl);
  if (animate) {
    animateSparklineStrokes(gridEl);
  }
}

export function mountStockistsSubtab(container: HTMLElement): void {
  rootContainer = container;
  rootContainer.innerHTML = `${renderPageHeader({
    eyebrow: 'Shops that sell Marlow & Fern on their shelves',
    title: 'Stockists',
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="new">${renderIcon('userPlus')}New customer</button>`,
    stats: computeStockistKpis(),
  })}
  <section class="card cs-wrap" aria-label="Stockists">
    <div class="toolbar">
      <div class="chips" data-k="s-tags" role="group" aria-label="Tag"></div>
      <span class="toolbar__spacer"></span>
      <label class="search cs-search">
        ${renderIcon('search')}
        <input type="search" placeholder="Name, contact or city…" aria-label="Search stockists" data-k="s-q" />
      </label>
      <button type="button" class="btn btn--ghost btn--sm cs-sort" data-k="s-sort" aria-haspopup="menu" aria-expanded="false">
        ${renderIcon('filter')}
        <span>${STOCKIST_SORT_OPTIONS.find((opt) => opt[0] === currentSort)![1]}</span>
        ${renderIcon('down')}
      </button>
      <div class="cs-views" role="group" aria-label="Layout">
        ${renderIconButton('grid', 'Cards', `data-view="grid" aria-pressed="${viewMode === 'grid'}"`, 'ibtn--sm')}
        ${renderIconButton('list', 'List', `data-view="list" aria-pressed="${viewMode === 'list'}"`, 'ibtn--sm')}
      </div>
    </div>
    <div class="cs-grid${viewMode === 'list' ? ' is-list' : ''}" data-k="s-grid"></div>
  </section>`;

  bindMagnetic(rootContainer);

  const tagsEl = domQuery<HTMLElement>('[data-k="s-tags"]', rootContainer);
  tagsEl.addEventListener('click', (evt) => {
    const chipBtn = (evt.target as HTMLElement).closest<HTMLElement>('[data-tag]');
    if (chipBtn) {
      playHaptic(chipBtn);
      selectedTag = chipBtn.dataset.tag!;
      renderStockistsList(true);
    }
  });

  const searchInput = domQuery<HTMLInputElement>('[data-k="s-q"]', rootContainer);
  searchInput.addEventListener('input', (evt) => {
    searchQuery = (evt.target as HTMLInputElement).value;
    renderStockistsList(true);
  });

  const sortBtn = domQuery<HTMLElement>('[data-k="s-sort"]', rootContainer);
  sortBtn.addEventListener('click', (evt) => {
    const anchor = evt.currentTarget as HTMLElement;
    openDropdownMenu(
      anchor,
      STOCKIST_SORT_OPTIONS.map(([val, label]) => ({
        label,
        checked: val === currentSort,
        onSelect: () => {
          if (val !== currentSort) {
            currentSort = val;
            domQuery('span', anchor).textContent = label;
            renderStockistsList(true);
          }
        },
      })),
      {
        align: 'end',
      }
    );
  });

  const viewsEl = domQuery<HTMLElement>('.cs-views', rootContainer);
  viewsEl.addEventListener('click', (evt) => {
    const viewBtn = (evt.target as HTMLElement).closest<HTMLElement>('[data-view]');
    if (viewBtn && viewBtn.dataset.view !== viewMode) {
      playHaptic(viewBtn);
      viewMode = viewBtn.dataset.view as 'grid' | 'list';
      try {
        localStorage.setItem('Vels:stockist-view', viewMode);
      } catch {}
      domQueryAll('[data-view]', viewsEl).forEach((btn) =>
        btn.setAttribute('aria-pressed', String(btn === viewBtn))
      );
      animateViewSwitch();
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
      } else if (actBtn.dataset.act === 'sclear') {
        searchQuery = '';
        selectedTag = 'all';
        searchInput.value = '';
        renderStockistsList(true);
      }
    }
  });
}

export function animateStockistsSubtabEnter(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(
      animateCards(domQueryAll('.cs-wrap', container), {
        y: 26,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll('.cs-wrap .toolbar > *:not(.toolbar__spacer), .cs-wrap .chip', container), {
        y: 8,
        stagger: 0.03,
      }),
      0.25
    )
    .add(
      animateWobble(domQueryAll('.cs-card', container).slice(0, 12), {
        stagger: 0.05,
      }),
      0.32
    );
  animateSparklineStrokes(container, 0.6);
}

export function updateStockistHeaderKpis(container: HTMLElement): void {
  computeStockistKpis().forEach((stat) => {
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
