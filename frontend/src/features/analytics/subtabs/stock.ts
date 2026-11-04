import {
  store,
  findProductById,
  findLocationById,
  getProductStock,
  getAvailableStock,
} from '../../../core/store';
import {
  motionDuration,
  animateCards,
  animateRows,
  animateCounter,
  playHaptic,
  bindMagnetic,
  initLiftAnimations,
  morphReplace,
  gsap,
} from '../../../core/motion';
import {
  renderDonutRingMeter,
  renderColumnBarChart,
  renderRadialGaugeMeter,
} from '../../../shared/widgets/charts';
import { escapeHtml, queryOne, domQuery, domQueryAll } from '../../../utils/dom';
import {
  formatInt,
  formatMoneyK,
  formatMoneyRound,
  formatPercent,
  formatRelativeTime,
  pluralize,
} from '../../../utils/formatters';
import { renderIcon, renderPill } from '../../../utils/icons';
import { PRODUCT_CATEGORIES, getTotalInventoryValue } from '../services/stats-cache';
import {
  calculateStockAccuracy,
  calculateStockTurns,
  calculateExpiringLots,
  calculateMedianDaysOfCover,
  calculateProductDaysOfCover,
  getProductRecentSales,
  daysUntilExpiry,
} from '../services/stock-calculator';
import {
  renderPageHeader,
  renderTag,
  renderProductThumb,
  renderEmptyState,
  highlightSearchMatch,
  exportStockCsv,
  formatProductFullName,
  openScheduleCountModal,
  openMakeBatchModal,
  openNewBatchModal,
  animatePageTransition,
} from '../../../main';

const MAX_COVER_SCALE_DAYS = 120;

export const getCoverTier = (days: number): 'bad' | 'warn' | 'ok' | 'none' => {
  if (days === Infinity) return 'none';
  if (days < 14) return 'bad';
  if (days < 30) return 'warn';
  return 'ok';
};

export const COVER_TIER_META: Record<string, [string, string]> = {
  bad: ['Critical', 'rose'],
  warn: ['Watch', 'ochre'],
  ok: ['Healthy', 'sage'],
  none: ['No sales', 'slate'],
};

let activeFilter: 'all' | 'risk' | 'ok' = 'all';
let searchFilter = '';

let accuracyGaugeInstance: any = null;
let locationDonutInstance: any = null;
let categoryDonutInstance: any = null;
let sellThroughDonutInstance: any = null;

export function renderStockSubtab(): string {
  const expiringLots = calculateExpiringLots();
  const expiryWarnDays = store.settings.prefs.expiryWarnDays;
  const turns = calculateStockTurns();
  const medianCover = calculateMedianDaysOfCover();

  const expiringValue = expiringLots
    .filter((e) => e.d <= Math.max(30, Math.min(90, expiryWarnDays)))
    .reduce((sum, e) => sum + e.value, 0);

  return `${renderPageHeader({
    eyebrow: 'How healthy the shelves are',
    title: 'Stock health',
    actions: `<button type="button" class="btn btn--ghost" data-k="sh-export">${renderIcon('download')}Export stock</button><button type="button" class="btn btn--primary magnetic" data-k="sh-count">${renderIcon('clipCheck')}Schedule a count</button>`,
    stats: [
      {
        key: 'value',
        icon: 'layers',
        label: 'Stock value',
        value: getTotalInventoryValue(),
        fmt: 'money',
        ico: 'teal',
      },
      {
        key: 'cover',
        icon: 'calendar',
        label: 'Median cover',
        value: medianCover,
        suffix: 'days',
        ico: 'pine',
      },
      {
        key: 'turn',
        icon: 'refresh',
        label: 'Time on the shelf',
        value: isFinite(turns.days) ? turns.days : 0,
        suffix: 'days',
        ico: 'ocean',
      },
      {
        key: 'exp',
        icon: 'calX',
        label: `Expiring ≤ ${Math.min(90, expiryWarnDays)} days`,
        value: expiringValue,
        fmt: 'money',
        ico: 'rose',
      },
    ],
  })}
  <div class="an-row an-row--cover">
    <section class="card an-cover" aria-labelledby="sh-cv-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-cv-t">Days of cover</h2><p class="card__sub">Available stock at the last 30 days’ sell rate</p></div>
        <div class="card__tools"><label class="search">${renderIcon('search')}<input type="search" placeholder="Search products…" aria-label="Search products" data-k="sh-q" /></label></div></header>
      <div class="toolbar"><div class="chips" data-k="sh-filter">${[
        ['all', 'All'],
        ['risk', 'At risk'],
        ['ok', 'Healthy'],
      ]
        .map(
          ([val, label]) =>
            `<button type="button" class="chip" data-cv="${val}" aria-pressed="${val === activeFilter}">${escapeHtml(label)} <b data-cvn="${val}"></b></button>`
        )
        .join('')}</div>
        <span class="toolbar__spacer"></span><span class="an-cover__key">${['bad', 'warn', 'ok'].map((tier) => `<span><i class="dot" style="--c:var(--${COVER_TIER_META[tier][1]})"></i>${COVER_TIER_META[tier][0]}</span>`).join('')}</span></div>
      <div class="an-bar an-bar--scale" aria-hidden="true"><span></span><span class="an-scale">${[0, 30, 60, 90, MAX_COVER_SCALE_DAYS].map((day) => `<i style="left:${(day / MAX_COVER_SCALE_DAYS) * 100}%">${day === MAX_COVER_SCALE_DAYS ? `${day}+ days` : day}</i>`).join('')}</span><span></span><span></span></div>
      <div class="an-bars" data-k="sh-cover"></div>
    </section>
    <div class="an-stack">
      <section class="card an-acc" aria-labelledby="sh-acc-t">
        <header class="card__head"><div><h2 class="card__title" id="sh-acc-t">Stock accuracy</h2><p class="card__sub">From finished cycle counts</p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="/warehouses/counts">${renderIcon('clipboard')}Counts</a></div></header>
        <div data-k="sh-gauge"></div>
        <div class="rows an-acc__list" data-k="sh-counts"></div>
      </section>
      <section class="card" aria-labelledby="sh-loc-t">
        <header class="card__head"><div><h2 class="card__title" id="sh-loc-t">Value by location</h2><p class="card__sub">At cost, materials sit at the lab</p></div></header>
        <div class="an-donut__body"><div data-k="sh-donut"></div><ul class="an-parts an-parts--stack" data-k="sh-locparts"></ul></div>
      </section>
    </div>
  </div>
  <div class="an-row an-row--3">
    <section class="card" aria-labelledby="sh-cat-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-cat-t">Value by category</h2><p class="card__sub">Finished goods at cost</p></div></header>
      <div data-k="sh-cat"></div><p class="an-cats__foot" data-k="sh-cat-foot"></p>
    </section>
    <section class="card" aria-labelledby="sh-st-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-st-t">Sell-through</h2><p class="card__sub">Share of stock sold in 30 days</p></div></header>
      <div data-k="sh-st"></div><p class="an-cats__foot" data-k="sh-st-foot"></p>
    </section>
    <section class="card an-exp" aria-labelledby="sh-exp-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-exp-t">Expiry exposure</h2><p class="card__sub" data-k="sh-exp-sub"></p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="/products/batches">${renderIcon('flask')}Batches</a></div></header>
      <div class="an-exp__tiles" data-k="sh-exp"></div>
      <div class="rows an-exp__lots" data-k="sh-lots"></div>
    </section>
  </div>
  <section class="card an-dead" aria-labelledby="sh-dead-t">
    <header class="card__head"><div><h2 class="card__title" id="sh-dead-t">Dead stock</h2><p class="card__sub">On the shelf, with no sale in the last 30 days</p></div></header>
    <div class="rows an-dead__rows" data-k="sh-dead"></div>
  </section>`;
}

export function updateDaysOfCover(container: HTMLElement, animateMeters = false): void {
  const productsWithCover = store.products
    .filter((p) => p.active)
    .map((p) => ({ p, d: calculateProductDaysOfCover(p) }))
    .sort((a, b) => a.d - b.d);

  const query = searchFilter.trim().toLowerCase();
  const isAtRisk = (days: number) => days < 30;

  const countsByFilter = {
    all: productsWithCover.length,
    risk: productsWithCover.filter((item) => isAtRisk(item.d)).length,
    ok: productsWithCover.filter((item) => !isAtRisk(item.d)).length,
  };

  (['all', 'risk', 'ok'] as const).forEach((tier) => {
    const countEl = queryOne<HTMLElement>(`[data-cvn="${tier}"]`, container);
    if (countEl) countEl.textContent = String(countsByFilter[tier]);
  });

  const filtered = productsWithCover.filter(
    (item) =>
      (activeFilter === 'all' || (activeFilter === 'risk' ? isAtRisk(item.d) : !isAtRisk(item.d))) &&
      (!query || `${item.p.name} ${item.p.size} ${item.p.sku}`.toLowerCase().includes(query))
  );

  const listEl = queryOne<HTMLElement>('[data-k="sh-cover"]', container);
  if (!listEl) return;

  const barsHtml = filtered.length
    ? filtered
        .map(({ p, d }) => {
          const tier = getCoverTier(d);
          const [label, tone] = COVER_TIER_META[tier];
          const scale = d === Infinity ? 1 : Math.max(0.015, Math.min(1, d / MAX_COVER_SCALE_DAYS));
          const daysText = d === Infinity ? '—' : `${formatInt(d)}<small> ${d === 1 ? 'day' : 'days'}</small>`;

          return `<div class="an-bar" data-key="${p.id}" style="--c:var(--${tone})">
      <a class="prod" href="/products/item/${p.id}">${renderProductThumb(p, 'sm')}<span><b>${highlightSearchMatch(p.name, query)}</b><small>${escapeHtml(p.size)} · ${formatInt(getAvailableStock(p))} free · ${formatInt(getProductRecentSales(p.id, 30))} sold</small></span></a>
      <span class="an-bar__track"><span class="an-bar__fill" style="transform:scaleX(${animateMeters ? scale : 0})" data-to="${scale}"></span></span>
      <span class="an-bar__val"><b class="num">${daysText}</b><em>${label}</em></span>
      ${tier === 'bad' || tier === 'warn' ? `<button type="button" class="btn btn--soft btn--xs" data-make="${p.id}">${renderIcon('flask')}Make</button>` : '<span class="an-bar__ok" aria-hidden="true"></span>'}
    </div>`;
        })
        .join('')
    : renderEmptyState(
        query ? `Nothing matches “${searchFilter.trim()}”` : activeFilter === 'risk' ? 'Nothing at risk' : 'Nothing here',
        query
          ? 'Try a product name, size or SKU.'
          : activeFilter === 'risk'
            ? 'Every product has at least a month of cover.'
            : 'No product matches this filter.',
        query ? 'search' : 'shield',
        query || activeFilter !== 'all'
          ? '<button type="button" class="btn btn--ghost btn--sm" data-k="sh-clear">Show everything</button>'
          : ''
      );

  if (animateMeters) {
    morphReplace(listEl, () => {
      listEl.innerHTML = barsHtml;
    });
  } else {
    listEl.innerHTML = barsHtml;
    gsap.to(domQueryAll('.an-bar__fill', listEl), {
      scaleX: (_i, el) => Number((el as HTMLElement).dataset.to),
      duration: motionDuration(1.1),
      stagger: motionDuration(0.04),
      delay: motionDuration(0.35),
      ease: 'power3.inOut',
    });
  }
}

export function updateStockAccuracySection(container: HTMLElement, animate = false): void {
  const accuracyData = calculateStockAccuracy();
  const scaledVal = Math.max(0, Math.min(1, (accuracyData.acc - 0.9) / 0.1));
  const subText = `${pluralize(accuracyData.counts.length, 'count')} · ${pluralize(accuracyData.lines, 'line')}`;

  const gaugeEl = queryOne<HTMLElement>('[data-k="sh-gauge"]', container);
  if (accuracyGaugeInstance) {
    accuracyGaugeInstance.update(scaledVal, subText);
  } else if (gaugeEl) {
    accuracyGaugeInstance = renderRadialGaugeMeter(gaugeEl, {
      value: scaledVal,
      format: (val: number) => `${(90 + val * 10).toFixed(1)}%`,
      sub: subText,
      label: `Stock accuracy ${(accuracyData.acc * 100).toFixed(1)}%`,
      zones: { bad: 0.5, warn: 0.8 },
    });
    accuracyGaugeInstance.play(animate ? 0.4 : 0);
  }

  const countsEl = queryOne<HTMLElement>('[data-k="sh-counts"]', container);
  if (countsEl) {
    countsEl.innerHTML =
      accuracyData.counts
        .slice(0, 3)
        .map((count: any) => {
          const offCount = count.lines.reduce(
            (sum: number, line: any) => sum + Math.abs((line.counted ?? line.expected) - line.expected),
            0
          );
          const location = findLocationById(count.locId);
          return `<a class="row" href="/warehouses/counts/${count.id}">${renderTag('clipCheck', offCount ? 'ochre' : 'sage', 'sm')}<span class="row__txt"><b><span class="mono">${escapeHtml(count.number)}</span> · ${escapeHtml(location?.name ?? '')}</b><small>Zone ${escapeHtml(count.zone)} · ${pluralize(count.lines.length, 'line')} · ${formatRelativeTime(count.at)}</small></span><span class="row__end">${offCount ? renderPill(`${offCount} off`, 'ochre') : renderPill('Exact', 'sage')}</span></a>`;
        })
        .join('') ||
      renderEmptyState(
        'No counts yet',
        'Accuracy appears once a cycle count is closed.',
        'clipboard'
      );
  }
}

export function updateLocationStockDonut(container: HTMLElement, animate = false): void {
  const materialCost = store.materials.reduce((sum, m) => sum + m.onHand * m.cost, 0);
  const tones = ['pine', 'ocean', 'ochre'] as const;

  const parts = store.locations.map((loc, idx) => ({
    label: loc.name,
    value:
      store.products.reduce((sum, p) => sum + (p.stock[loc.id] ?? 0) * p.cost, 0) +
      (loc.id === 'lab' ? materialCost : 0),
    tone: tones[idx % 3],
    id: loc.id,
  }));

  const totalValue = parts.reduce((sum, p) => sum + p.value, 0) || 1;
  const donutEl = queryOne<HTMLElement>('[data-k="sh-donut"]', container);

  if (locationDonutInstance) {
    locationDonutInstance.update(parts, formatMoneyK(totalValue));
  } else if (donutEl) {
    locationDonutInstance = renderDonutRingMeter(donutEl, {
      parts,
      center: formatMoneyK(totalValue),
      sub: 'at cost',
      label: 'Stock value by location',
    });
    locationDonutInstance.play(animate ? 0.5 : 0);
  }

  const partsListEl = queryOne<HTMLElement>('[data-k="sh-locparts"]', container);
  if (partsListEl) {
    partsListEl.innerHTML = parts
      .map(
        (p) =>
          `<li><i class="dot" style="--c:var(--${p.tone})"></i><a href="/warehouses/locations/${p.id}">${escapeHtml(p.label)}</a><b class="num">${formatMoneyRound(p.value)}</b><small>${formatPercent(p.value / totalValue)}</small></li>`
      )
      .join('');
  }
}

export function updateCategoryAndSellThrough(container: HTMLElement, animate = false): void {
  // Category Stock Value Donut
  const catValues = PRODUCT_CATEGORIES.map((cat) =>
    store.products
      .filter((p) => p.category === cat)
      .reduce((sum, p) => sum + getProductStock(p) * p.cost, 0)
  );

  const catEl = queryOne<HTMLElement>('[data-k="sh-cat"]', container);
  if (categoryDonutInstance) {
    categoryDonutInstance.update(catValues);
  } else if (catEl) {
    categoryDonutInstance = renderColumnBarChart(catEl, {
      labels: PRODUCT_CATEGORIES,
      values: catValues,
      format: formatMoneyRound,
      tone: 'teal',
      label: 'Stock value by category',
    });
    categoryDonutInstance.play(animate ? 0.5 : 0);
  }

  if (catEl) {
    domQueryAll('.bars__col', catEl).forEach((col, idx) => {
      queryOne('.bars__val', col)?.remove();
      col.insertAdjacentHTML(
        'afterbegin',
        `<b class="bars__val num">${escapeHtml(formatMoneyK(catValues[idx] ?? 0))}</b>`
      );
    });
  }

  const bestCatIdx = catValues.reduce((bestIdx, val, idx) => {
    if (val > (catValues[bestIdx] ?? 0)) return idx;
    return bestIdx;
  }, 0);
  const catTotalSum = catValues.reduce((sum, v) => sum + v, 0) || 1;

  const catFootEl = queryOne<HTMLElement>('[data-k="sh-cat-foot"]', container);
  if (catFootEl) {
    catFootEl.innerHTML = `<b>${escapeHtml(PRODUCT_CATEGORIES[bestCatIdx])}</b> holds ${formatPercent((catValues[bestCatIdx] ?? 0) / catTotalSum)} of it — <b>${formatMoneyRound(catValues[bestCatIdx] ?? 0)}</b>.`;
  }

  // Sell-through Category Donut
  const sellThroughValues = PRODUCT_CATEGORIES.map((cat) => {
    const productsInCat = store.products.filter((p) => p.category === cat);
    const soldQty = productsInCat.reduce((sum, p) => sum + getProductRecentSales(p.id, 30), 0);
    const onHandQty = productsInCat.reduce((sum, p) => sum + getProductStock(p), 0);
    return soldQty + onHandQty ? soldQty / (soldQty + onHandQty) : 0;
  });

  const stEl = queryOne<HTMLElement>('[data-k="sh-st"]', container);
  if (sellThroughDonutInstance) {
    sellThroughDonutInstance.update(sellThroughValues);
  } else if (stEl) {
    sellThroughDonutInstance = renderColumnBarChart(stEl, {
      labels: PRODUCT_CATEGORIES,
      values: sellThroughValues,
      format: (val: number) => formatPercent(val),
      tone: 'ocean',
      label: 'Sell-through by category, last 30 days',
    });
    sellThroughDonutInstance.play(animate ? 0.6 : 0);
  }

  if (stEl) {
    domQueryAll('.bars__col', stEl).forEach((col, idx) => {
      queryOne('.bars__val', col)?.remove();
      col.insertAdjacentHTML(
        'afterbegin',
        `<b class="bars__val num">${escapeHtml(formatPercent(sellThroughValues[idx] ?? 0))}</b>`
      );
    });
  }

  const turns = calculateStockTurns();
  const bestStIdx = sellThroughValues.reduce((bestIdx, val, idx) => {
    if (val > (sellThroughValues[bestIdx] ?? 0)) return idx;
    return bestIdx;
  }, 0);

  const stFootEl = queryOne<HTMLElement>('[data-k="sh-st-foot"]', container);
  if (stFootEl) {
    stFootEl.innerHTML = `Stock turns <b>${turns.t.toFixed(1)}×</b> a year — about <b>${isFinite(turns.days) ? formatInt(turns.days) : '—'} days</b> on the shelf. Fastest: <b>${escapeHtml(PRODUCT_CATEGORIES[bestStIdx])}</b> (${formatPercent(sellThroughValues[bestStIdx] ?? 0)}).`;
  }
}

export function updateExpirySection(container: HTMLElement, animate = false): void {
  const expiringLots = calculateExpiringLots();
  const expiryWarnDays = store.settings.prefs.expiryWarnDays;
  const totalExpValue = expiringLots.reduce((sum, b) => sum + b.value, 0);

  const subEl = queryOne<HTMLElement>('[data-k="sh-exp-sub"]', container);
  if (subEl) {
    subEl.innerHTML = `Value at cost of lots that expire soon · alerts at <a href="/settings/company">${expiryWarnDays} days</a>`;
  }

  const expTilesEl = queryOne<HTMLElement>('[data-k="sh-exp"]', container);
  if (expTilesEl) {
    const tones = ['rose', 'ochre', 'sky'] as const;
    expTilesEl.innerHTML = expiringLots
      .map((bucket, idx) => {
        const isWarn = bucket.d <= expiryWarnDays;
        const daysLabel = idx ? `${expiringLots[idx - 1].d + 1}–${bucket.d}` : `≤ ${bucket.d}`;
        const ratio = totalExpValue ? Math.max(0.02, bucket.value / totalExpValue) : 0.02;

        return `<div class="an-exp__tile${isWarn ? ' is-warn' : ''}" style="--c:var(--${tones[idx]})">
        <small>${daysLabel} days</small><b class="num" data-ev="${idx}">${formatMoneyRound(animate ? 0 : bucket.value)}</b><span>${pluralize(bucket.lots.length, 'lot')} · ${formatInt(bucket.units)} units</span>
        <span class="meter"><span class="meter__fill" style="transform:scaleX(0)" data-to="${ratio}"></span></span></div>`;
      })
      .join('');

    expiringLots.forEach((bucket, idx) => {
      const numEl = queryOne<HTMLElement>(`[data-ev="${idx}"]`, expTilesEl);
      if (numEl) {
        animateCounter(numEl, bucket.value, formatMoneyRound, {
          from: 0,
          duration: 1.2,
          delay: animate ? 0.5 + idx * 0.1 : 0,
        });
      }
    });

    gsap.to(domQueryAll('.an-exp__tile .meter__fill', expTilesEl), {
      scaleX: (_i, el) => Number((el as HTMLElement).dataset.to),
      duration: motionDuration(1),
      stagger: motionDuration(0.08),
      delay: motionDuration(animate ? 0.6 : 0.1),
      ease: 'power3.inOut',
    });
  }

  const soonestLots = expiringLots
    .flatMap((b) => b.lots)
    .sort((a, b) => a.expiresAt - b.expiresAt)
    .slice(0, 4);

  const lotsListEl = queryOne<HTMLElement>('[data-k="sh-lots"]', container);
  if (lotsListEl) {
    lotsListEl.innerHTML = soonestLots.length
      ? soonestLots
          .map((batch: any) => {
            const product = findProductById(batch.productId);
            const daysLeft = daysUntilExpiry(batch);
            const tone = daysLeft <= 30 ? 'rose' : daysLeft <= 60 ? 'ochre' : 'sky';
            const pillText = daysLeft <= 0 ? 'Expired' : `${daysLeft} d`;

            return `<a class="row" href="/products/batches/${batch.id}">${renderProductThumb(product, 'sm')}<span class="row__txt"><b>${escapeHtml(formatProductFullName(product))}</b><small><span class="mono">${escapeHtml(batch.lot)}</span> · ${formatInt(batch.left)} left${batch.status === 'hold' ? ' · on hold' : ''}</small></span><span class="row__end">${renderPill(pillText, tone)}</span></a>`;
          })
          .join('')
      : renderEmptyState(
          'Nothing expires within 90 days',
          'Every lot on the shelf has more than three months left.',
          'calendar'
        );
  }
}

export function updateDeadStock(container: HTMLElement): void {
  const deadProducts = store.products.filter(
    (p) => p.active && getProductStock(p) > 0 && getProductRecentSales(p.id, 30) === 0
  );

  const deadEl = queryOne<HTMLElement>('[data-k="sh-dead"]', container);
  if (deadEl) {
    deadEl.innerHTML = deadProducts.length
      ? deadProducts
          .map((p) => {
            const onHand = getProductStock(p);
            const costVal = formatMoneyRound(onHand * p.cost);
            const locNames = store.locations
              .filter((loc) => (p.stock[loc.id] ?? 0) > 0)
              .map((loc) => loc.name)
              .join(', ');

            const moveBtn =
              (p.stock.dc ?? 0) > 0
                ? `<button type="button" class="btn btn--soft btn--xs" data-move="${p.id}">${renderIcon('store')}Sell at the shop</button>`
                : '';

            return `<div class="row" data-key="${p.id}">${renderProductThumb(p, 'md')}<a class="row__txt" href="/products/item/${p.id}"><b>${escapeHtml(formatProductFullName(p))}</b><small>${formatInt(onHand)} on hand · ${costVal} at cost · ${locNames}</small></a>${moveBtn}</div>`;
          })
          .join('')
      : `<div class="an-dead__clear">${renderTag('sparkle', 'sage')}<span><b>No dead stock</b><small>Every product on the shelves sold at least once in the last 30 days. Slow movers show up here before they become a write-off.</small></span></div>`;
  }
}

export function updateStockHeaderStats(container: HTMLElement): void {
  const updateStat = (key: string, val: number) => {
    const el = queryOne<HTMLElement>(`[data-stat="${key}"] b[data-count]`, container);
    if (el) {
      el.dataset.count = String(val);
      const fmt = el.dataset.fmt === 'money' ? formatMoneyRound : formatInt;
      animateCounter(el, val, fmt, { duration: 0.9 });
    }
  };

  const expiryWarnDays = store.settings.prefs.expiryWarnDays;
  const turns = calculateStockTurns();
  const medianCover = calculateMedianDaysOfCover();
  const expiringValue = calculateExpiringLots()
    .filter((e) => e.d <= Math.max(30, Math.min(90, expiryWarnDays)))
    .reduce((sum, e) => sum + e.value, 0);

  updateStat('value', getTotalInventoryValue());
  updateStat('cover', medianCover);
  updateStat('turn', isFinite(turns.days) ? turns.days : 0);
  updateStat('exp', expiringValue);

  const expLabel = queryOne<HTMLElement>('[data-stat="exp"] .stat__label', container);
  if (expLabel?.lastChild) {
    expLabel.lastChild.textContent = `Expiring ≤ ${Math.max(30, Math.min(90, expiryWarnDays))} days`;
  }
}

export function updateStockSubtab(container: HTMLElement, animate = false): void {
  if (!animate) updateStockHeaderStats(container);
  updateDaysOfCover(container, !animate);
  updateStockAccuracySection(container, animate);
  updateLocationStockDonut(container, animate);
  updateCategoryAndSellThrough(container, animate);
  updateExpirySection(container, animate);
  updateDeadStock(container);
}

export function initStockSubtab(container: HTMLElement): void {
  bindMagnetic(container);

  queryOne<HTMLElement>('[data-k="sh-filter"]', container)?.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-cv]');
    if (chip) {
      playHaptic(chip);
      activeFilter = chip.dataset.cv as any;
      domQueryAll('[data-cv]', container).forEach((c) =>
        c.setAttribute('aria-pressed', String(c === chip))
      );
      updateDaysOfCover(container, true);
    }
  });

  const searchInput = queryOne<HTMLInputElement>('[data-k="sh-q"]', container);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchFilter = (e.target as HTMLInputElement).value;
      updateDaysOfCover(container, true);
    });
  }

  queryOne<HTMLElement>('[data-k="sh-count"]', container)?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    playHaptic(target);
    openScheduleCountModal(target);
  });

  queryOne<HTMLElement>('[data-k="sh-export"]', container)?.addEventListener('click', (e) => {
    playHaptic(e.currentTarget as HTMLElement);
    exportStockCsv();
  });

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const makeBtn = target.closest<HTMLElement>('[data-make]');
    if (makeBtn) {
      playHaptic(makeBtn);
      openMakeBatchModal(makeBtn.dataset.make, makeBtn);
      return;
    }

    const moveBtn = target.closest<HTMLElement>('[data-move]');
    if (moveBtn) {
      playHaptic(moveBtn);
      openNewBatchModal(
        { from: 'dc', to: 'shop', productId: moveBtn.dataset.move },
        moveBtn
      );
      return;
    }

    if (target.closest('[data-k="sh-clear"]')) {
      searchFilter = '';
      activeFilter = 'all';
      if (searchInput) searchInput.value = '';
      domQueryAll('[data-cv]', container).forEach((c) =>
        c.setAttribute('aria-pressed', String(c.getAttribute('data-cv') === 'all'))
      );
      updateDaysOfCover(container, true);
    }
  });
}

export function animateStockSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.06 }), 0.15)
    .add(animateRows(domQueryAll('.an-bar', container), { x: -10, y: 0, stagger: 0.03 }), 0.35)
    .add(
      animateRows(
        domQueryAll('.an-acc__list .row, .an-exp__lots .row, .an-dead__rows > *, .an-parts li', container),
        { y: 10, stagger: 0.04 }
      ),
      0.5
    );

  updateStockSubtab(container, true);
  if (accuracyGaugeInstance) {
    accuracyGaugeInstance.play(0.4);
    locationDonutInstance?.play(0.5);
    categoryDonutInstance?.play(0.5);
    sellThroughDonutInstance?.play(0.6);
  }
  initLiftAnimations(container);
}
