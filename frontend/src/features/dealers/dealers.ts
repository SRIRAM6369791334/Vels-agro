/*! Vels Agro — Enterprise Dealer Management Feature Module
 * Cloned directly from Warehouses with 100% Exact UI, DOM Structure and GSAP Animations
 * Comprehensive Admin Capabilities:
 * - View & approve/reject dealer registrations
 * - Manage dealer profiles & activate/deactivate
 * - Configure dealer-specific pricing tiers & discount sliders
 * - Monitor dealer inventory, transfers & cycle counts
 * - Generate dealer-wise reports (CSV)
 */

import '../warehouses/warehouses.css';
import './dealers.css';
import {
  formatTime,
  escapeHtml,
  formatRelativeDay,
  store,
  showToast,
  closeDrawer,
  ONE_DAY_MS,
  renderEmptyState,
  closeCurrentPopover,
  queryOne,
  animatePageTransition,
  domQuery,
  ONE_HOUR_MS,
  findProductById,
  formatProductFullName,
  renderAvatar,
  motionDuration,
  renderTag,
  openDrawer,
  bindModalDismiss,
  animateWobble,
  formatRelativeTime,
  formatInt,
  animateRows,
  formatPercent,
  renderFilterBar,
  animateCards,
  formatMoneyRound,
  pluralize,
  gsap,
  renderPill,
  domQueryAll,
  initLiftAnimations,
  renderIcon,
  bindMagnetic,
  renderPageHeader,
  renderProductThumb,
} from '../../main.ts';

import {
  Dealer,
  DealerTransfer,
  DealerCount,
  INITIAL_DEALERS,
  INITIAL_DEALER_TRANSFERS,
  INITIAL_DEALER_COUNTS,
} from './dealer-data';

// Persistent Local State for Dealers
function getStoredDealers(): Dealer[] {
  try {
    const raw = localStorage.getItem('Vels:dealers');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_DEALERS];
}

function saveStoredDealers(dealers: Dealer[]): void {
  try {
    localStorage.setItem('Vels:dealers', JSON.stringify(dealers));
  } catch {}
}

function getStoredTransfers(): DealerTransfer[] {
  try {
    const raw = localStorage.getItem('Vels:dealer_transfers');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_DEALER_TRANSFERS];
}

function saveStoredTransfers(transfers: DealerTransfer[]): void {
  try {
    localStorage.setItem('Vels:dealer_transfers', JSON.stringify(transfers));
  } catch {}
}

function getStoredCounts(): DealerCount[] {
  try {
    const raw = localStorage.getItem('Vels:dealer_counts');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_DEALER_COUNTS];
}

function saveStoredCounts(counts: DealerCount[]): void {
  try {
    localStorage.setItem('Vels:dealer_counts', JSON.stringify(counts));
  } catch {}
}

const SUBTABS = ['locations', 'transfers', 'counts'];
let containerEl: HTMLElement | null = null;
let currentSubtab = 'locations';
let currentDealerId = 'dlr-01';
let currentStatusFilter = 'all';
let currentTransferFilter = 'all';
let currentCountFilter = 'all';
let blindCountRevealed = false;
let activeDrawerCountId: string | null = null;
const tweenRegistry: gsap.core.Tween[] = [];
let binEntranceTimeline: gsap.core.Timeline | null = null;

const subEl = (key: string) => domQuery(`[data-sub="${key}"]`, containerEl);
const kEl = (key: string) => domQuery(`[data-k="${key}"]`, containerEl);

// Dealer yard & bay zones definition
interface DealerZone {
  id: string;
  name: string;
  kind: 'ambient' | 'cool' | 'quarantine' | 'dispatch';
  bins: number;
}

const DEFAULT_DEALER_ZONES: DealerZone[] = [
  { id: 'T', name: 'Showroom Yard · Tractors', kind: 'ambient', bins: 20 },
  { id: 'H', name: 'Machinery Yard · Harvesters & Tillers', kind: 'ambient', bins: 16 },
  { id: 'S', name: 'Showroom Floor · Implements', kind: 'cool', bins: 12 },
  { id: 'P', name: 'Parts & Spares Rack', kind: 'dispatch', bins: 10 },
  { id: 'Q', name: 'Pre-Delivery Inspection (PDI)', kind: 'quarantine', bins: 6 },
];

const ZONE_KINDS_TONE: Record<string, string> = {
  ambient: 'pine',
  cool: 'sky',
  quarantine: 'ocean',
  dispatch: 'teal',
};

const ZONE_KIND_LABELS: Record<string, string> = {
  ambient: 'Yard',
  cool: 'Showroom',
  quarantine: 'PDI Bay',
  dispatch: 'Spares',
};

interface DealerBinItem {
  code: string;
  n: number;
  items: {
    name: string;
    sub: string;
    units: number;
    fill: number;
    href: string;
    p?: any;
    ico?: string;
    tone?: string;
  }[];
  fill: number;
  out: boolean;
}

let dealerBinsMap = new Map<string, DealerBinItem[]>();

function buildDealerBins(dealer: Dealer): Map<string, DealerBinItem[]> {
  const map = new Map<string, DealerBinItem[]>();
  DEFAULT_DEALER_ZONES.forEach((zone) => {
    map.set(
      zone.id,
      Array.from({ length: zone.bins }, (_, i) => ({
        code: `${zone.id}-${String(i + 1).padStart(2, '0')}`,
        n: i + 1,
        items: [],
        fill: 0,
        out: false,
      }))
    );
  });

  const add = (
    zoneId: string,
    binIdx: number,
    item: {
      name: string;
      sub: string;
      units: number;
      fill: number;
      href: string;
      p?: any;
      ico?: string;
      tone?: string;
    },
    out = false
  ) => {
    const list = map.get(zoneId);
    if (!list?.length) return;
    const bin = list[(Math.max(1, binIdx) - 1) % list.length];
    bin.items.push(item);
    bin.fill = Math.min(1, bin.fill + item.fill);
    if (out) bin.out = true;
  };

  const products = store?.products || [];
  products.forEach((p: any, idx: number) => {
    const units = dealer.stock[p.id] ?? Math.max(2, (idx * 5 + 3) % 18);
    const item = {
      name: formatProductFullName(p),
      sub: `${formatInt(units)} units · on floor`,
      units,
      fill: Math.min(1, units / 24),
      href: `#/products/item/${p.id}`,
      p,
    };
    if (idx % 2 === 0) {
      add('T', idx + 1, item, units <= 0);
    } else if (idx % 3 === 0) {
      add('H', idx + 1, item, units <= 0);
    } else {
      add('S', idx + 1, item, units <= 0);
    }
  });

  // Spare parts and boom kits in Parts Bay
  add('P', 1, {
    name: 'Hydraulic Seals & O-Ring Kits',
    sub: '45 sets · SKU-SP-01',
    units: 45,
    fill: 0.75,
    href: '#/dealers/locations',
    ico: 'layers',
    tone: 'ocean',
  });
  add('P', 3, {
    name: 'Heavy Duty Rotary Blades (7ft)',
    sub: '18 pairs · SKU-BLD-07',
    units: 18,
    fill: 0.6,
    href: '#/dealers/locations',
    ico: 'drop',
    tone: 'teal',
  });
  add('Q', 1, {
    name: 'Pre-Delivery Stage 1 Tractor Inspection',
    sub: '2 units in PDI testing',
    units: 2,
    fill: 0.35,
    href: '#/dealers/locations',
    ico: 'clipCheck',
    tone: 'rose',
  });

  return map;
}

function getDealerStockMetrics(dealer: Dealer) {
  const products = store?.products || [];
  const totalUnits = Object.values(dealer.stock || {}).reduce((s, n) => s + n, 0) || 128;
  const capacity = dealer.capacity || 5000;
  let usedBins = 0;
  let totalBins = 0;
  dealerBinsMap.forEach((bins) => {
    bins.forEach((b) => {
      totalBins++;
      if (b.items.some((it) => it.units > 0)) usedBins++;
    });
  });

  const reservedOrders = (dealer.ordersCount || 12) * 3;

  return {
    units: totalUnits,
    cap: Math.min(1, totalUnits / capacity),
    used: usedBins,
    total: totalBins,
    res: reservedOrders,
  };
}

function updateStatElement(scope: HTMLElement, statKey: string, val: number) {
  const el = queryOne(`[data-stat="${statKey}"] [data-count]`, scope);
  if (el && Number(el.dataset.count) !== val) {
    renderFilterBar(el, val);
  }
}

function updateStatSuffix(scope: HTMLElement, statKey: string, suffix: string) {
  const el = queryOne(`[data-stat="${statKey}"] .stat__suffix`, scope);
  if (el) el.textContent = suffix;
}

// GSAP Meter Fill Animation matching Warehouses
function animateMeterFills(elements: HTMLElement[], delay = 0.35) {
  elements.forEach((el, idx) => {
    const scaleX = Number(/scaleX\(([\d.]+)\)/.exec(el.style.transform)?.[1] ?? 1);
    gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX,
        duration: motionDuration(1),
        delay: motionDuration(delay + Math.min(idx, 14) * 0.05),
        ease: 'power3.inOut',
      }
    );
  });
}

// -------------------------------------------------------------
// 1. SUBTAB: LOCATIONS (Exact Warehouses Layout & Animations)
// -------------------------------------------------------------
function renderLocationsSubtabHTML(): string {
  const dealers = getStoredDealers();
  const currentDealer = dealers.find((d) => d.id === currentDealerId) || dealers[0];
  dealerBinsMap = buildDealerBins(currentDealer);
  const metrics = getDealerStockMetrics(currentDealer);

  const stats = [
    {
      key: 'units',
      icon: 'boxes',
      label: 'Units at dealerships',
      value: metrics.units,
      ico: 'pine',
    },
    {
      key: 'cap',
      icon: 'warehouse',
      label: 'Network capacity used',
      value: metrics.cap,
      fmt: 'pct',
      ico: 'teal',
    },
    {
      key: 'bins',
      icon: 'grid',
      label: 'Showroom bays active',
      value: metrics.used,
      suffix: `of ${metrics.total}`,
      ico: 'ocean',
    },
    {
      key: 'res',
      icon: 'orders',
      label: 'Promised to farmers',
      value: metrics.res,
      suffix: 'units',
      ico: 'ochre',
    },
  ];

  return `
    ${renderPageHeader({
      eyebrow: 'Where every tractor, harvester and machinery shipment sits across authorized dealerships',
      title: 'Dealer Locations',
      actions: `
        <button type="button" class="btn btn--ghost magnetic" id="btn-export-dealer-csv">
          ${renderIcon('download')}Export report
        </button>
        <button type="button" class="btn btn--primary magnetic" id="btn-add-dealer">
          ${renderIcon('plus')}Register dealer
        </button>
      `,
      stats,
    })}

    <!-- Filter chips for dealer approval / status -->
    <div class="dlr-toolbar">
      <div class="dlr-chips">
        <button type="button" class="chip ${currentStatusFilter === 'all' ? 'is-active' : ''}" data-filter-status="all">
          All Dealerships <b data-n="all">${dealers.length}</b>
        </button>
        <button type="button" class="chip ${currentStatusFilter === 'active' ? 'is-active' : ''}" data-filter-status="active">
          Active <b data-n="active">${dealers.filter((d) => d.status === 'active').length}</b>
        </button>
        <button type="button" class="chip ${currentStatusFilter === 'pending' ? 'is-active' : ''}" data-filter-status="pending" style="color:${dealers.some((d) => d.status === 'pending') ? '#b45309' : 'inherit'}">
          Pending Approval <b data-n="pending">${dealers.filter((d) => d.status === 'pending').length}</b>
        </button>
        <button type="button" class="chip ${currentStatusFilter === 'rejected' ? 'is-active' : ''}" data-filter-status="rejected">
          Rejected <b data-n="rejected">${dealers.filter((d) => d.status === 'rejected').length}</b>
        </button>
      </div>
    </div>

    <!-- Dealership Location Selector Cards (.wh-locs) -->
    <div class="wh-locs" data-k="locs" role="group" aria-label="Choose a dealership location"></div>

    <!-- Main Warehouses Grid Layout (.wh-grid) -->
    <div class="wh-grid">
      <div class="wh-main">
        <!-- Yard & Showroom Map Card (.wh-map) -->
        <section class="card wh-map" aria-labelledby="wh-map-t">
          <header class="card__head">
            <div>
              <h2 class="card__title" id="wh-map-t" data-k="map-title">Yard & Showroom Map</h2>
              <p class="card__sub" data-k="map-sub"></p>
            </div>
            <div class="card__tools">
              <div class="legend wh-legend">
                <span><i class="wh-sw wh-sw--0"></i>Empty</span>
                <span><i class="wh-sw wh-sw--low"></i>Running low</span>
                <span><i class="wh-sw wh-sw--1"></i>Part full</span>
                <span><i class="wh-sw wh-sw--2"></i>Full</span>
                <span><i class="wh-sw wh-sw--out"></i>Out</span>
              </div>
            </div>
          </header>
          <div class="wh-zones" data-k="zones"></div>
          <div class="wh-tip" data-k="tip" aria-hidden="true"></div>
        </section>

        <!-- Recent Dealer Stock Movements Card (.wh-moves) -->
        <section class="card wh-moves" aria-labelledby="wh-mv-t">
          <header class="card__head">
            <div>
              <h2 class="card__title" id="wh-mv-t">Recent movements</h2>
              <p class="card__sub">In and out of this dealership</p>
            </div>
          </header>
          <div class="rows wh-mvrows" data-k="moves"></div>
        </section>
      </div>

      <!-- Stock Here Card (.wh-stock) -->
      <section class="card wh-stock" aria-labelledby="wh-st-t">
        <header class="card__head">
          <div>
            <h2 class="card__title" id="wh-st-t">Stock here</h2>
            <p class="card__sub" data-k="stock-sub"></p>
          </div>
        </header>
        <div class="wh-swrap">
          <table class="table wh-stable">
            <thead>
              <tr>
                <th scope="col">Machinery / Equipment</th>
                <th scope="col" class="r">On hand</th>
                <th scope="col" class="r">Reserved</th>
                <th scope="col" class="r">Free</th>
              </tr>
            </thead>
            <tbody data-k="stock"></tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderDealerLocationButtons(): void {
  const locsContainer = kEl('locs');
  if (!locsContainer) return;
  const dealers = getStoredDealers();
  const filtered = dealers.filter((d) =>
    currentStatusFilter === 'all' ? true : d.status === currentStatusFilter
  );

  locsContainer.innerHTML = filtered
    .map((dealer) => {
      const totalUnits = Object.values(dealer.stock || {}).reduce((s, n) => s + n, 0) || 140;
      const capRatio = Math.min(1, totalUnits / (dealer.capacity || 5000));
      const isSelected = dealer.id === currentDealerId;
      const isPending = dealer.status === 'pending';

      return `
        <div role="button" tabindex="0" class="wh-loc" data-loc="${dealer.id}" aria-pressed="${isSelected}" style="--c:var(--pine)" data-lift>
          <span class="wh-loc__top">
            ${renderTag('store', isPending ? 'ochre' : 'pine', 'md')}
            <span class="wh-loc__name">
              <b>${escapeHtml(dealer.name)}</b>
              <small>${escapeHtml(dealer.city)}, ${escapeHtml(dealer.state)} · ${dealer.code}</small>
            </span>
            ${renderIcon('check', 'wh-loc__check')}
          </span>

          <span class="wh-loc__meta">
            <span>${renderIcon('clock')}+91 ${dealer.phone}</span>
            <span class="wh-loc__mgr">${renderAvatar(dealer.id, 'xs')}${escapeHtml(dealer.contactPerson)}</span>
          </span>

          <span class="wh-loc__fig">
            <b class="num">${formatInt(totalUnits)}</b>
            <small>of ${formatInt(dealer.capacity || 5000)} units</small>
            <em class="num">${formatPercent(capRatio)}</em>
          </span>

          <span class="meter">
            <span class="meter__fill" style="--c:var(--pine);transform:scaleX(${Math.max(0.02, capRatio).toFixed(4)})"></span>
          </span>

          <!-- Inline Admin Action Pill -->
          <div class="dlr-loc-extra">
            <span class="dlr-tier dlr-tier--${dealer.pricingTier}">
              ★ ${dealer.pricingTier} (${dealer.discountPct}% Disc)
            </span>
            <div class="dlr-loc-extra__btns">
              ${
                isPending
                  ? `
                  <button type="button" class="btn btn--good btn--xs btn-approve-dlr" data-id="${dealer.id}">Approve</button>
                  <button type="button" class="btn btn--bad btn--xs btn-reject-dlr" data-id="${dealer.id}">Reject</button>
                `
                  : `
                  <button type="button" class="btn btn--ghost btn--xs btn-pricing-dlr" data-id="${dealer.id}">Pricing</button>
                  <button type="button" class="btn btn--ghost btn--xs btn-profile-dlr" data-id="${dealer.id}">Profile</button>
                `
              }
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  initLiftAnimations(locsContainer);
}

function renderDealerZone(zone: DealerZone, bins: DealerBinItem[]): string {
  const cols = zone.bins <= 12 ? zone.bins : Math.ceil(zone.bins / 2);
  const unitsInZone = bins.reduce(
    (acc, b) => acc + b.items.reduce((sum, item) => sum + (item.units || 0), 0),
    0
  );
  const activeBinsCount = bins.filter((b) => b.items.some((it) => it.units > 0)).length;
  const tone = ZONE_KINDS_TONE[zone.kind] || 'pine';

  return `
    <section class="wh-zone${zone.bins >= 16 ? ' is-wide' : ''}" style="--c:var(--${tone});--cols:${cols};--cols-sm:${Math.min(cols, 6)}" aria-label="${escapeHtml(zone.name)}: ${activeBinsCount} of ${zone.bins} bays in use">
      <header class="wh-zone__head">
        <b>${escapeHtml(zone.name)}</b>
        <span class="wh-zone__kind">${escapeHtml(ZONE_KIND_LABELS[zone.kind] || 'Bay')}</span>
        <small>${activeBinsCount}/${zone.bins} bays${unitsInZone ? ` · ${formatInt(unitsInZone)} units` : ''}</small>
      </header>
      <div class="wh-bins">
        ${bins
          .map((b) => {
            const hasItems = b.items.length > 0;
            const state = b.out && !b.items.some((it) => it.units > 0)
              ? 'out'
              : hasItems
              ? b.fill >= 0.66
                ? 'full'
                : b.fill >= 0.25
                ? 'mid'
                : 'low'
              : 'empty';
            const label = hasItems
              ? `${b.code}: ${b.items.map((it) => `${it.name}, ${it.sub}`).join('; ')}`
              : '';

            if (hasItems) {
              return `
                <button type="button" class="wh-bin is-${state}" data-bin="${b.code}" style="--f:${b.fill.toFixed(3)}" aria-label="${escapeHtml(label)}">
                  <span class="wh-bin__fill" style="transform:scaleY(${Math.max(0.06, b.fill).toFixed(3)})"></span>
                  <span class="wh-bin__n">${b.n}</span>
                  ${b.items.length > 1 ? `<i class="wh-bin__multi">${b.items.length}</i>` : ''}
                </button>
              `;
            }
            return `<span class="wh-bin is-empty" aria-hidden="true"><span class="wh-bin__n">${b.n}</span></span>`;
          })
          .join('')}
      </div>
    </section>
  `;
}

function updateDealerMap(): void {
  const dealers = getStoredDealers();
  const currentDealer = dealers.find((d) => d.id === currentDealerId) || dealers[0];
  dealerBinsMap = buildDealerBins(currentDealer);

  const titleEl = kEl('map-title');
  if (titleEl) titleEl.textContent = `${currentDealer.name} · Yard & Bay Map`;

  const metrics = getDealerStockMetrics(currentDealer);
  const subEl = kEl('map-sub');
  if (subEl) {
    subEl.textContent = `${pluralize(DEFAULT_DEALER_ZONES.length, 'zone')} · ${metrics.used} of ${metrics.total} bays in use · ${currentDealer.address}`;
  }

  const zonesEl = kEl('zones');
  if (zonesEl) {
    zonesEl.innerHTML = DEFAULT_DEALER_ZONES.map((z) =>
      renderDealerZone(z, dealerBinsMap.get(z.id) ?? [])
    ).join('');
  }
}

// Bins entrance GSAP animation
function animateDealerBins(delay = 0): void {
  const zonesEl = kEl('zones');
  if (!zonesEl) return;
  const bins = domQueryAll('.wh-bin', zonesEl);
  binEntranceTimeline?.kill();
  if (!bins.length) return;

  const rect = zonesEl.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const distances = bins.map((b) => {
    const r = b.getBoundingClientRect();
    return ((r.left - rect.left) / w) * 0.55 + ((r.top - rect.top) / h) * 0.4;
  });

  binEntranceTimeline = gsap.timeline({
    delay: motionDuration(delay),
  });

  binEntranceTimeline.fromTo(
    bins,
    { opacity: 0, scale: 0.35, y: 10 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: motionDuration(0.55),
      ease: 'back.out(2.2)',
      delay: (i) => motionDuration(distances[i] ?? 0),
      clearProps: 'transform,opacity',
    },
    0
  );

  const fills = domQueryAll('.wh-bin__fill', zonesEl);
  binEntranceTimeline.fromTo(
    fills,
    { scaleY: 0 },
    {
      scaleY: (_, el) => Number(/scaleY\(([\d.]+)\)/.exec(el.style.transform)?.[1] ?? 1),
      duration: motionDuration(0.8),
      ease: 'power3.out',
      delay: (i) => motionDuration(0.15 + (distances[bins.indexOf(fills[i].parentElement as HTMLElement)] ?? 0)),
    },
    0
  );

  animateRows(domQueryAll('.wh-zone__head', zonesEl), {
    y: 8,
    stagger: 0.05,
  });
}

function updateDealerStockTable(animateDismiss = false): void {
  const dealers = getStoredDealers();
  const currentDealer = dealers.find((d) => d.id === currentDealerId) || dealers[0];
  const products = store?.products || [];

  const stockRows = products.map((p: any) => {
    const onHand = currentDealer.stock[p.id] ?? 8;
    const reserved = (currentDealer.ordersCount || 10) % 5;
    const free = Math.max(0, onHand - reserved);
    return { p, onHand, reserved, free };
  });

  const subEl = kEl('stock-sub');
  if (subEl) {
    const total = stockRows.reduce((sum, r) => sum + r.onHand, 0);
    subEl.textContent = `${pluralize(stockRows.length, 'equipment line')} · ${formatInt(total)} units`;
  }

  const tableBody = kEl('stock');
  if (!tableBody) return;

  const html = stockRows.length
    ? stockRows
        .map(({ p, onHand, reserved, free }) => {
          return `
            <tr data-key="${p.id}">
              <td class="a-t">
                <a class="prod" href="#/products/item/${p.id}">
                  ${renderProductThumb(p, 'sm')}
                  <span>
                    <b>${escapeHtml(p.name)}</b>
                    <small>${escapeHtml(p.size)} · <span class="mono">${escapeHtml(p.sku || '')}</span></small>
                  </span>
                </a>
              </td>
              <td class="a-r r"><b class="num">${formatInt(onHand)}</b></td>
              <td class="a-s r"><span class="num ${reserved ? '' : 'wh-dim'}">${reserved ? formatInt(reserved) : '—'}</span></td>
              <td class="a-p r"><b class="num ${free <= 0 ? 'wh-bad' : free <= 3 ? 'wh-warn' : ''}">${formatInt(free)}</b></td>
            </tr>
          `;
        })
        .join('')
    : `<tr><td colspan="4">${renderEmptyState('No machinery in stock', 'Dispatch equipment from Central Depot to stock this showroom.', 'box')}</td></tr>`;

  if (animateDismiss) {
    bindModalDismiss(tableBody, () => {
      tableBody.innerHTML = html;
    });
  } else {
    tableBody.innerHTML = html;
  }
}

function updateDealerRecentMovements(animateDismiss = false): void {
  const dealers = getStoredDealers();
  const currentDealer = dealers.find((d) => d.id === currentDealerId) || dealers[0];
  const movesContainer = kEl('moves');
  if (!movesContainer) return;

  const mockMoves = [
    { name: 'Vels 55HP 4WD Agro Tractor', ref: `DTR-${currentDealer.code}-01`, qty: 4, at: Date.now() - 3600000 * 4 },
    { name: 'Hydraulic Multi-Speed Rotavator (7ft)', ref: `DTR-${currentDealer.code}-02`, qty: 6, at: Date.now() - 3600000 * 18 },
    { name: 'Paddy Multi-Crop Combine Harvester', ref: `SO-FARM-9914`, qty: -1, at: Date.now() - 3600000 * 28 },
    { name: 'Automated 16L Boom Sprayer Kit', ref: `DTR-${currentDealer.code}-03`, qty: 10, at: Date.now() - 3600000 * 52 },
    { name: 'Vels 45HP Compact Utility Tractor', ref: `SO-FARM-9922`, qty: -2, at: Date.now() - 3600000 * 76 },
  ];

  const html = mockMoves
    .map((m) => {
      const isAdd = m.qty >= 0;
      return `
        <div class="row wh-mv" data-key="${m.ref}">
          ${renderTag('truck', isAdd ? 'pine' : 'ocean', 'sm')}
          <span class="row__txt">
            <b>${escapeHtml(m.name)}</b>
            <small>${isAdd ? 'Stock Dispatch Inward' : 'Farmer Delivery Outward'} · <span class="mono">${escapeHtml(m.ref)}</span></small>
          </span>
          <span class="row__end">
            <b class="${isAdd ? 'wh-up' : 'wh-down'}">${isAdd ? '+' : '−'}${formatInt(Math.abs(m.qty))}</b>
            ${formatRelativeTime(m.at)}
          </span>
        </div>
      `;
    })
    .join('');

  if (animateDismiss) {
    bindModalDismiss(movesContainer, () => {
      movesContainer.innerHTML = html;
    });
  } else {
    movesContainer.innerHTML = html;
  }
}

function updateDealerHeaderStats(): void {
  const dealers = getStoredDealers();
  const currentDealer = dealers.find((d) => d.id === currentDealerId) || dealers[0];
  const metrics = getDealerStockMetrics(currentDealer);
  const scope = subEl('locations');
  if (!scope) return;

  updateStatElement(scope, 'units', metrics.units);
  updateStatElement(scope, 'cap', metrics.cap);
  updateStatElement(scope, 'bins', metrics.used);
  updateStatSuffix(scope, 'bins', `of ${metrics.total}`);
  updateStatElement(scope, 'res', metrics.res);
}

// Master animation on entering /dealers/locations
function animateLocationsEntrance(): void {
  const view = subEl('locations');
  if (!view) return;

  animatePageTransition(view);
  animateWobble(domQueryAll('.wh-loc', view), {
    delay: 0.1,
    stagger: 0.08,
  });
  animateMeterFills(domQueryAll('.wh-loc .meter__fill', view), 0.45);
  animateCards(domQueryAll('.wh-grid .card', view), {
    stagger: 0.08,
    delay: 0.25,
  });
  animateDealerBins(0.45);
  animateRows(domQueryAll('.wh-stock tbody tr, .wh-mv', view).slice(0, 12), {
    y: 10,
    stagger: 0.035,
    delay: 0.55,
  });
}

function selectDealerLocation(dealerId: string): void {
  if (dealerId === currentDealerId) return;
  currentDealerId = dealerId;

  domQueryAll('.wh-loc', subEl('locations')).forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.loc === dealerId));
  });

  closeCurrentPopover();
  const binsToHide = domQueryAll('.wh-bin, .wh-zone__head', kEl('zones'));

  const onComplete = () => {
    updateDealerMap();
    updateDealerHeaderStats();
    updateDealerStockTable(false);
    updateDealerRecentMovements(false);
    animateDealerBins(0.05);
    animateRows(domQueryAll('.wh-stock tbody tr, .wh-mv', subEl('locations')).slice(0, 12), {
      y: 10,
      stagger: 0.035,
      delay: 0.1,
    });
  };

  binEntranceTimeline?.kill();
  if (bindMagnetic() || !binsToHide.length) {
    onComplete();
    return;
  }

  gsap.to(binsToHide, {
    opacity: 0,
    scale: 0.6,
    duration: 0.22,
    ease: 'power2.in',
    stagger: { each: 0.003, from: 'end' },
    onComplete,
    overwrite: true,
  });
}

// -------------------------------------------------------------
// 2. SUBTAB: TRANSFERS (Exact Warehouses Layout & Loop Animations)
// -------------------------------------------------------------
function renderTransfersSubtabHTML(): string {
  const transfers = getStoredTransfers();
  const onRoadUnits = transfers
    .filter((t) => t.status === 'dispatched')
    .reduce((sum, t) => sum + (t.totalUnits || 0), 0);
  const plannedCount = transfers.filter((t) => t.status === 'draft').length;
  const receivedUnits = transfers
    .filter((t) => t.status === 'received')
    .reduce((sum, t) => sum + (t.totalUnits || 0), 0);

  return `
    ${renderPageHeader({
      eyebrow: 'Machinery & spare parts dispatches between Vels Central Depot and regional dealerships',
      title: 'Dealer Transfers',
      actions: `
        <button type="button" class="btn btn--primary magnetic" id="btn-new-dealer-transfer">
          ${renderIcon('truck')}Dispatch to dealer
        </button>
      `,
      stats: [
        {
          key: 'road',
          icon: 'truck',
          label: 'On the road',
          value: onRoadUnits,
          suffix: 'units',
          ico: 'ochre',
        },
        {
          key: 'planned',
          icon: 'calendar',
          label: 'Planned dispatches',
          value: plannedCount,
          suffix: 'transfers',
          ico: 'sky',
        },
        {
          key: 'rec',
          icon: 'check',
          label: 'Delivered, 30 days',
          value: receivedUnits,
          suffix: 'units',
          ico: 'sage',
        },
        {
          key: 'hours',
          icon: 'timer',
          label: 'Average transit time',
          value: 18,
          suffix: 'h',
          ico: 'ocean',
        },
      ],
    })}

    <!-- Status filter chips matching Warehouses -->
    <div class="toolbar">
      <div class="chips" data-k="tr-chips" role="group" aria-label="Filter by transfer status">
        <button type="button" class="chip" data-trf="all" aria-pressed="${currentTransferFilter === 'all'}">
          All <b data-n="all">${transfers.length}</b>
        </button>
        <button type="button" class="chip" data-trf="dispatched" aria-pressed="${currentTransferFilter === 'dispatched'}">
          On the road <b data-n="dispatched">${transfers.filter((t) => t.status === 'dispatched').length}</b>
        </button>
        <button type="button" class="chip" data-trf="draft" aria-pressed="${currentTransferFilter === 'draft'}">
          Planned <b data-n="draft">${transfers.filter((t) => t.status === 'draft').length}</b>
        </button>
        <button type="button" class="chip" data-trf="received" aria-pressed="${currentTransferFilter === 'received'}">
          Received <b data-n="received">${transfers.filter((t) => t.status === 'received').length}</b>
        </button>
      </div>
    </div>

    <!-- Active Transfers Cards Grid (.wh-trs) -->
    <div class="wh-trs" data-k="tr-list"></div>
  `;
}

function renderTransferCard(tr: DealerTransfer): string {
  const isInTransit = tr.status === 'dispatched';
  const progressRatio = isInTransit ? 0.62 : 0;
  const products = store?.products || [];

  return `
    <article class="card wh-tr ${isInTransit ? 'is-in-transit' : 'is-planned'}" data-tr="${tr.id}" style="--c:var(--${isInTransit ? 'ochre' : 'sky'})">
      <header class="wh-tr__head">
        <span class="wh-tr__no">
          <b class="mono">${escapeHtml(tr.number)}</b>
          <small>Planned by Dispatch Logistics · ${tr.carrier || 'Express Haul'}</small>
        </span>
        ${isInTransit ? renderPill('On the road', 'ochre', 'truck') : renderPill('Planned', 'sky', 'calendar')}
      </header>

      <!-- Exact Route Drawing from Warehouses (.wh-route) -->
      <div class="wh-route">
        <span class="wh-route__end wh-route__end--from">
          ${renderTag('warehouse', 'pine', 'sm')}
          <span>
            <b>Vels Central DC</b>
            <small>Coimbatore Hub</small>
          </span>
        </span>

        <span class="wh-route__line" aria-hidden="true">
          <span class="wh-route__draw">
            <svg class="wh-route__svg" width="100%" height="12">
              <line x1="4" y1="6" x2="100%" y2="6" class="wh-route__track" />
              <line x1="4" y1="6" x2="100%" y2="6" class="wh-route__dash" />
            </svg>
          </span>
          <span class="wh-route__truck" style="left:${(progressRatio * 100).toFixed(1)}%">
            ${renderIcon('truck')}
          </span>
        </span>

        <span class="wh-route__end wh-route__end--to">
          ${renderTag('store', 'ocean', 'sm')}
          <span>
            <b>${escapeHtml(tr.dealerName)}</b>
            <small>Showroom Bay</small>
          </span>
        </span>
      </div>

      <!-- Line items list -->
      <ul class="wh-tr__lines">
        ${tr.items
          .map((item) => {
            const prod = products.find((p: any) => p.id === item.productId) || products[0];
            return `
              <li>
                <a href="#/products/item/${prod?.id || 'p-01'}">
                  ${prod ? renderProductThumb(prod, 'sm') : ''}
                  <span>
                    <b>${escapeHtml(item.productName)}</b>
                    <small>₹${formatMoneyRound(item.unitPrice)} each</small>
                  </span>
                  <em class="num">× ${formatInt(item.units)}</em>
                </a>
              </li>
            `;
          })
          .join('')}
      </ul>

      <!-- Footer with action buttons -->
      <footer class="wh-tr__foot">
        <span class="wh-tr__eta">
          ${renderIcon('clock')}
          <span>
            <b>${isInTransit ? `Arrives ${tr.expectedAt || 'Tomorrow'}` : `Dispatches ${tr.createdAt}`}</b>
            <small>${pluralize(tr.totalUnits, 'machinery unit')} · ${pluralize(tr.items.length, 'line')}</small>
          </span>
        </span>
        <button type="button" class="btn btn--primary btn--sm btn-step-transfer" data-id="${tr.id}">
          ${isInTransit ? `${renderIcon('check')}Receive Shipment` : `${renderIcon('truck')}Dispatch Now`}
        </button>
      </footer>
    </article>
  `;
}

function updateTransfersList(): void {
  const listEl = kEl('tr-list');
  if (!listEl) return;
  const transfers = getStoredTransfers();
  const filtered = transfers.filter((t) =>
    currentTransferFilter === 'all' ? true : t.status === currentTransferFilter
  );

  const cardsHtml = filtered.filter((t) => t.status !== 'received').map(renderTransferCard).join('');

  // Historical received transfers at bottom matching Warehouses
  const receivedList = transfers.filter((t) => t.status === 'received');
  const historyHtml = receivedList.length
    ? `
      <section class="card wh-histcard" style="grid-column: 1 / -1; margin-top: var(--gap, 16px);">
        <header class="card__head">
          <div>
            <h2 class="card__title">Completed Dealer Deliveries</h2>
            <p class="card__sub">${receivedList.length} shipments safely received into dealership showroom</p>
          </div>
        </header>
        <div class="rows">
          ${receivedList
            .map(
              (t) => `
              <div class="row wh-hist" data-key="h-${t.id}">
                ${renderTag('check', 'sage', 'sm')}
                <span class="row__txt">
                  <b><span class="mono">${t.number}</span> · Vels Central DC ${renderIcon('chevR', 'wh-arrow')} ${t.dealerName}</b>
                  <small>${pluralize(t.totalUnits, 'unit')} · received recently · Carrier: ${t.carrier || 'Express Fleet'}</small>
                </span>
                <span class="wh-hist__thumbs">
                  ${t.items.slice(0, 3).map((it) => `<span class="badge badge--dim">${it.units}x</span>`).join('')}
                </span>
              </div>
            `
            )
            .join('')}
        </div>
      </section>
    `
    : '';

  listEl.innerHTML = (cardsHtml || renderEmptyState('No transfers matching filter', 'Try another status.', 'truck')) + historyHtml;

  // Run the exact SVG loop animation
  startTransferLoopAnimations(subEl('transfers'));
}

// Continuous GSAP loop for truck and dashed road
function startTransferLoopAnimations(scope: HTMLElement | null): void {
  if (!scope) return;
  tweenRegistry.splice(0).forEach((tw) => tw.kill());

  if (!bindMagnetic()) {
    domQueryAll('.wh-tr.is-in-transit .wh-route__dash', scope).forEach((dash) => {
      tweenRegistry.push(
        gsap.fromTo(
          dash,
          { attr: { 'stroke-dashoffset': 0 } },
          {
            attr: { 'stroke-dashoffset': -12 },
            duration: 0.7,
            ease: 'none',
            repeat: -1,
          }
        )
      );
    });

    domQueryAll('.wh-tr.is-in-transit .wh-route__truck .ico', scope).forEach((truckIco) => {
      tweenRegistry.push(
        gsap.to(truckIco, {
          y: -1.5,
          duration: 0.32,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      );
    });
  }
}

function animateTransfersEntrance(): void {
  const view = subEl('transfers');
  if (!view) return;
  animatePageTransition(view);
  animateCards(domQueryAll('.wh-trs .card', view), {
    delay: 0.15,
    stagger: 0.06,
  });
  animateRows(domQueryAll('.toolbar .chip', view), {
    y: 8,
    stagger: 0.04,
    delay: 0.2,
  });
  startTransferLoopAnimations(view);
}

// -------------------------------------------------------------
// 3. SUBTAB: COUNTS (Exact Warehouses Layout & Interactive Drawer)
// -------------------------------------------------------------
function renderCountsSubtabHTML(): string {
  const counts = getStoredCounts();
  const totalAudited = counts.reduce(
    (sum, c) => sum + c.lines.reduce((lsum, l) => lsum + (l.countedUnits ?? l.systemUnits), 0),
    0
  );
  const openCount = counts.filter((c) => c.status !== 'completed').length;
  const discrepancies = counts.reduce((sum, c) => sum + Math.abs(c.varianceUnits || 0), 0);

  return `
    ${renderPageHeader({
      eyebrow: 'Auditing machinery & spare parts on dealer premises against central stock books',
      title: 'Dealer Inventory Counts',
      actions: `
        <button type="button" class="btn btn--primary magnetic" id="btn-schedule-dealer-count">
          ${renderIcon('clipCheck')}Schedule dealer audit
        </button>
      `,
      stats: [
        {
          key: 'items',
          icon: 'clipboard',
          label: 'Items audited',
          value: totalAudited,
          suffix: 'units',
          ico: 'pine',
        },
        {
          key: 'open',
          icon: 'calendar',
          label: 'Audits in progress',
          value: openCount,
          suffix: 'audits',
          ico: 'sky',
        },
        {
          key: 'var',
          icon: 'alert',
          label: 'Net discrepancy',
          value: discrepancies,
          suffix: 'units',
          ico: discrepancies > 0 ? 'rose' : 'sage',
        },
        {
          key: 'acc',
          icon: 'check',
          label: 'Stock accuracy',
          value: 0.994,
          fmt: 'pct',
          ico: 'teal',
        },
      ],
    })}

    <!-- Chips status filter -->
    <div class="toolbar">
      <div class="chips" data-k="ct-chips" role="group" aria-label="Filter cycle counts">
        <button type="button" class="chip" data-ctf="all" aria-pressed="${currentCountFilter === 'all'}">
          All <b data-n="all">${counts.length}</b>
        </button>
        <button type="button" class="chip" data-ctf="in_progress" aria-pressed="${currentCountFilter === 'in_progress'}">
          Counting <b data-n="in_progress">${counts.filter((c) => c.status === 'in_progress').length}</b>
        </button>
        <button type="button" class="chip" data-ctf="scheduled" aria-pressed="${currentCountFilter === 'scheduled'}">
          Scheduled <b data-n="scheduled">${counts.filter((c) => c.status === 'scheduled').length}</b>
        </button>
        <button type="button" class="chip" data-ctf="completed" aria-pressed="${currentCountFilter === 'completed'}">
          Completed <b data-n="completed">${counts.filter((c) => c.status === 'completed').length}</b>
        </button>
      </div>
    </div>

    <!-- Audits table card (.wh-counts) -->
    <div class="card wh-counts" style="margin-top:var(--gap, 16px);">
      <div class="wh-swrap">
        <table class="table wh-ctable">
          <thead>
            <tr>
              <th scope="col">Audit Ref</th>
              <th scope="col">Dealer Location</th>
              <th scope="col">Audit Date</th>
              <th scope="col">Auditor</th>
              <th scope="col" style="min-width:140px">Progress</th>
              <th scope="col" class="r">Variance</th>
              <th scope="col" class="r">Status</th>
            </tr>
          </thead>
          <tbody data-k="ct-rows"></tbody>
        </table>
      </div>
    </div>
  `;
}

function updateCountsTable(): void {
  const tbody = kEl('ct-rows');
  if (!tbody) return;
  const counts = getStoredCounts();
  const filtered = counts.filter((c) =>
    currentCountFilter === 'all' ? true : c.status === currentCountFilter
  );

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7">${renderEmptyState('No counts found', 'Schedule a new dealer stock audit.', 'clipboard')}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const isDone = c.status === 'completed';
      const countedLines = c.lines.filter((l) => l.countedUnits !== undefined).length;
      const progressRatio = c.lines.length ? countedLines / c.lines.length : 1;
      const variance = c.varianceUnits || 0;

      return `
        <tr data-ct="${c.id}" style="cursor:pointer">
          <td><b class="mono">${escapeHtml(c.number)}</b></td>
          <td><b>${escapeHtml(c.dealerName)}</b></td>
          <td><small class="wh-dim">${c.scheduledDate}</small></td>
          <td>
            <span style="display:inline-flex; align-items:center; gap:6px;">
              ${renderAvatar(c.auditorName, 'xs')}
              <span>${escapeHtml(c.auditorName)}</span>
            </span>
          </td>
          <td>
            <div style="display:flex; flex-direction:column; gap:4px">
              <small>${countedLines}/${c.lines.length} lines</small>
              <span class="meter">
                <span class="meter__fill" style="--c:var(--ocean);transform:scaleX(${Math.max(0.04, progressRatio).toFixed(4)})"></span>
              </span>
            </div>
          </td>
          <td class="r">
            <b class="num ${variance === 0 ? 'wh-good' : Math.abs(variance) > 2 ? 'wh-bad' : 'wh-warn'}">
              ${variance > 0 ? '+' : ''}${variance} units
            </b>
          </td>
          <td class="r">
            ${
              isDone
                ? renderPill('Completed', 'sage', 'check')
                : c.status === 'in_progress'
                ? renderPill('In Progress', 'ochre', 'timer')
                : renderPill('Scheduled', 'sky', 'calendar')
            }
          </td>
        </tr>
      `;
    })
    .join('');
}

function animateCountsEntrance(): void {
  const view = subEl('counts');
  if (!view) return;
  animatePageTransition(view);
  animateCards(domQueryAll('.wh-counts', view), { delay: 0.15 });
  animateRows(domQueryAll('.toolbar .chip', view), {
    y: 8,
    stagger: 0.04,
    delay: 0.3,
  });
  animateRows(domQueryAll('.wh-ctable tbody tr', view), {
    y: 10,
    stagger: 0.05,
    delay: 0.35,
  });
  animateMeterFills(domQueryAll('.wh-ctable .meter__fill', view), 0.6);
}

// Drawer Count Sheet (.wh-sheet) matching Warehouses
function renderCountSheetDrawerHTML(count: DealerCount): string {
  const isDone = count.status === 'completed';
  const products = store?.products || [];
  const linesCount = count.lines.length;
  const countedLines = count.lines.filter((l) => l.countedUnits !== undefined).length;
  const matchedLines = count.lines.filter((l) => l.countedUnits === l.systemUnits).length;
  const progressRatio = linesCount ? countedLines / linesCount : 1;
  const netVariance = count.varianceUnits || 0;

  const stepperHtml = (pid: string, val: number, name: string) => `
    <span class="stepper">
      <button type="button" class="ibtn ibtn--sm btn-step-count" data-pid="${pid}" data-step="-1" title="One less">${renderIcon('minus')}</button>
      <input class="stepper__in num count-input" type="number" min="0" value="${val ?? ''}" data-pid="${pid}" aria-label="Counted: ${name}" />
      <button type="button" class="ibtn ibtn--sm btn-step-count" data-pid="${pid}" data-step="1" title="One more">${renderIcon('plus')}</button>
    </span>
  `;

  const rowsHtml = count.lines
    .map((l) => {
      const prod = products.find((p: any) => p.id === l.productId) || products[0];
      const diff = (l.countedUnits ?? l.systemUnits) - l.systemUnits;

      return `
        <div class="row wh-cl" data-line="${l.productId}">
          ${prod ? renderProductThumb(prod, 'md') : ''}
          <span class="row__txt">
            <b>${escapeHtml(l.productName)}</b>
            <small>₹${formatMoneyRound(l.unitPrice)} · <span class="mono">${escapeHtml(l.productId)}</span></small>
          </span>
          <span class="wh-cl__exp" data-exp>
            <small>Expected</small>
            <b class="num">${blindCountRevealed || isDone ? formatInt(l.systemUnits) : '•••'}</b>
          </span>
          <span class="wh-cl__in">
            ${
              isDone
                ? `<span class="wh-cl__got"><small>Counted</small><b class="num">${formatInt(l.countedUnits ?? l.systemUnits)}</b></span>`
                : stepperHtml(l.productId, l.countedUnits ?? l.systemUnits, l.productName)
            }
          </span>
          <span class="wh-cl__var" data-var>
            ${
              diff === 0
                ? `<span class="pill pill--good">${renderIcon('check')}Match</span>`
                : `<span class="pill pill--bad">${diff > 0 ? '+' : ''}${diff}</span>`
            }
          </span>
        </div>
      `;
    })
    .join('');

  return `
    <header class="d-head">
      ${renderTag('clipCheck', isDone ? 'sage' : 'sky')}
      <div>
        <h2><span class="mono">${escapeHtml(count.number)}</span></h2>
        <small>${escapeHtml(count.dealerName)} · Auditor: ${escapeHtml(count.auditorName)}</small>
      </div>
    </header>

    <div class="d-pills">
      ${renderPill(count.status.toUpperCase(), isDone ? 'sage' : 'ochre')}
      ${renderPill(count.scheduledDate, 'faint', 'calendar')}
      ${renderPill(pluralize(linesCount, 'equipment line'), 'faint', 'list')}
    </div>

    ${
      isDone
        ? `
        <div class="d-facts">
          <div><small>Lines matched</small><b class="num">${matchedLines} <span>of ${linesCount}</span></b><span>${formatPercent(linesCount ? matchedLines / linesCount : 1)} accuracy</span></div>
          <div><small>Net variance</small><b class="num ${netVariance === 0 ? 'wh-good' : 'wh-bad'}">${netVariance > 0 ? '+' : ''}${netVariance} <span>units</span></b><span>₹${formatMoneyRound(Math.abs(count.varianceValue || 0))} value</span></div>
          <div><small>Status</small><b class="num wh-good">Audited</b><span>Stock verified</span></div>
        </div>
      `
        : `
        <div class="wh-prog">
          <div class="wh-prog__top">
            <b data-prog-t>${countedLines} of ${pluralize(linesCount, 'line')} counted</b>
            <span data-prog-v class="wh-dim">Net ${netVariance > 0 ? '+' : ''}${netVariance} variance</span>
          </div>
          <span class="meter">
            <span class="meter__fill" data-prog style="--c:var(--ocean);transform:scaleX(${Math.max(0.04, progressRatio).toFixed(4)})"></span>
          </span>
        </div>
      `
    }

    ${
      isDone
        ? ''
        : `
        <label class="wh-reveal">
          <span>
            <b>Show expected quantities</b>
            <small>Blind counting ensures complete audit integrity</small>
          </span>
          <button type="button" class="switch" role="switch" aria-checked="${blindCountRevealed}" id="btn-toggle-reveal" aria-label="Show expected quantities"></button>
        </label>
      `
    }

    <section class="d-sec">
      <h3>Machinery Count Sheet</h3>
      <div class="rows wh-sheet">${rowsHtml}</div>
    </section>

    <div class="d-actions">
      ${
        isDone
          ? `<button type="button" class="btn btn--ghost btn--sm" onclick="navigateTo('/dealers/locations')">${renderIcon('store')}View Dealership</button>`
          : `<button type="button" class="btn btn--primary btn--sm" id="btn-finish-count">${renderIcon('check')}Finish count</button>`
      }
    </div>
  `;
}

function openCountDrawer(countId: string): void {
  const counts = getStoredCounts();
  const count = counts.find((c) => c.id === countId);
  if (!count) return;
  activeDrawerCountId = countId;

  openDrawer(renderCountSheetDrawerHTML(count), {
    label: `Count sheet ${count.number}`,
    wide: true,
    onMount: (drawer) => {
      // Stepper button clicks
      drawer.querySelectorAll('.btn-step-count').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const pid = target.dataset.pid;
          const step = Number(target.dataset.step);
          const line = count.lines.find((l) => l.productId === pid);
          if (line) {
            line.countedUnits = Math.max(0, (line.countedUnits ?? line.systemUnits) + step);
            line.variance = line.countedUnits - line.systemUnits;
            count.varianceUnits = count.lines.reduce((s, l) => s + (l.variance || 0), 0);
            saveStoredCounts(counts);
            refreshCountDrawer(count);
            updateCountsTable();
          }
        });
      });

      // Blind count toggle
      drawer.querySelector('#btn-toggle-reveal')?.addEventListener('click', () => {
        blindCountRevealed = !blindCountRevealed;
        refreshCountDrawer(count);
      });

      // Finish count button
      drawer.querySelector('#btn-finish-count')?.addEventListener('click', () => {
        count.status = 'completed';
        count.completedAt = new Date().toISOString().split('T')[0];
        saveStoredCounts(counts);
        showToast('Dealer count completed and stock reconciled!', { ico: 'check' });
        closeDrawer();
        updateCountsTable();
      });
    },
    onClose: () => {
      activeDrawerCountId = null;
    },
  });

  const drawerInner = queryOne('#drawer .drawer__inner');
  if (drawerInner) {
    animateMeterFills(domQueryAll('[data-prog]', drawerInner), 0.3);
  }
}

function refreshCountDrawer(count: DealerCount): void {
  const drawerInner = queryOne('#drawer .drawer__inner');
  if (!drawerInner) return;
  [...drawerInner.children].forEach((ch) => {
    if (!ch.classList.contains('drawer__close')) ch.remove();
  });
  drawerInner.insertAdjacentHTML('beforeend', renderCountSheetDrawerHTML(count));
}

// -------------------------------------------------------------
// 4. ADMIN MODALS: PRICING & DISCOUNTS, PROFILE & EXPORT
// -------------------------------------------------------------
function showPricingDialog(dealer: Dealer): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;

  modalEl.innerHTML = `
    <div class="dlr-dialog">
      <header class="dlr-dialog__header">
        <h3 class="dlr-dialog__title">Configure Dealer Pricing & Discount</h3>
        <button type="button" class="ibtn ibtn--sm btn-close-modal">${renderIcon('close')}</button>
      </header>
      <div class="dlr-dialog__body">
        <div class="dlr-form-group">
          <label>Dealership</label>
          <input type="text" value="${escapeHtml(dealer.name)} (${dealer.code})" disabled />
        </div>
        <div class="dlr-form-group">
          <label for="modal-tier-select">Pricing Tier</label>
          <select id="modal-tier-select">
            <option value="standard" ${dealer.pricingTier === 'standard' ? 'selected' : ''}>Standard (10% Base Discount)</option>
            <option value="silver" ${dealer.pricingTier === 'silver' ? 'selected' : ''}>Silver (15% Base Discount)</option>
            <option value="gold" ${dealer.pricingTier === 'gold' ? 'selected' : ''}>Gold (20% Base Discount)</option>
            <option value="platinum" ${dealer.pricingTier === 'platinum' ? 'selected' : ''}>Platinum (25% Base Discount)</option>
          </select>
        </div>
        <div class="dlr-form-group">
          <label for="modal-discount-range">Dealer Discount Margin (%)</label>
          <div class="dlr-range-wrap">
            <input type="range" id="modal-discount-range" min="0" max="30" step="1" value="${dealer.discountPct}" />
            <span class="dlr-range-val" id="modal-discount-val">${dealer.discountPct}%</span>
          </div>
        </div>
        <div class="dlr-form-group">
          <label for="modal-credit-limit">Credit Limit (₹)</label>
          <input type="number" id="modal-credit-limit" value="${dealer.creditLimit || 5000000}" step="100000" />
        </div>
      </div>
      <footer class="dlr-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary btn-save-pricing">Save Pricing Policy</button>
      </footer>
    </div>
  `;

  modalEl.showModal();

  const range = modalEl.querySelector('#modal-discount-range') as HTMLInputElement;
  const valSpan = modalEl.querySelector('#modal-discount-val') as HTMLElement;
  range?.addEventListener('input', () => {
    if (valSpan) valSpan.textContent = `${range.value}%`;
  });

  modalEl.querySelectorAll('.btn-close-modal').forEach((btn) => {
    btn.addEventListener('click', () => modalEl.close());
  });

  modalEl.querySelector('.btn-save-pricing')?.addEventListener('click', () => {
    const tier = (modalEl.querySelector('#modal-tier-select') as HTMLSelectElement).value as any;
    const discount = Number(range.value);
    const credit = Number((modalEl.querySelector('#modal-credit-limit') as HTMLInputElement).value);

    const dealers = getStoredDealers();
    const d = dealers.find((item) => item.id === dealer.id);
    if (d) {
      d.pricingTier = tier;
      d.discountPct = discount;
      d.creditLimit = credit;
      saveStoredDealers(dealers);
      showToast(`Pricing updated for ${d.name}!`, { ico: 'check' });
      renderDealerLocationButtons();
    }
    modalEl.close();
  });
}

function showProfileDialog(dealer: Dealer): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;

  modalEl.innerHTML = `
    <div class="dlr-dialog">
      <header class="dlr-dialog__header">
        <h3 class="dlr-dialog__title">Manage Dealer Profile</h3>
        <button type="button" class="ibtn ibtn--sm btn-close-modal">${renderIcon('close')}</button>
      </header>
      <div class="dlr-dialog__body">
        <div class="dlr-form-group">
          <label>Dealership Name</label>
          <input type="text" id="prof-name" value="${escapeHtml(dealer.name)}" />
        </div>
        <div class="dlr-form-group">
          <label>Dealer Code</label>
          <input type="text" id="prof-code" value="${escapeHtml(dealer.code)}" />
        </div>
        <div class="dlr-form-group">
          <label>City & State</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <input type="text" id="prof-city" value="${escapeHtml(dealer.city)}" placeholder="City" />
            <input type="text" id="prof-state" value="${escapeHtml(dealer.state)}" placeholder="State" />
          </div>
        </div>
        <div class="dlr-form-group">
          <label>Full Yard Address</label>
          <input type="text" id="prof-address" value="${escapeHtml(dealer.address)}" />
        </div>
        <div class="dlr-form-group">
          <label>Contact Person & Phone</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <input type="text" id="prof-contact" value="${escapeHtml(dealer.contactPerson)}" placeholder="Person" />
            <input type="text" id="prof-phone" value="${escapeHtml(dealer.phone)}" placeholder="Phone" />
          </div>
        </div>
        <div class="dlr-form-group">
          <label>GSTIN</label>
          <input type="text" id="prof-gstin" value="${escapeHtml(dealer.gstin)}" />
        </div>
        <div class="dlr-form-group">
          <label>Account Status</label>
          <select id="prof-status">
            <option value="active" ${dealer.status === 'active' ? 'selected' : ''}>Active (Operational)</option>
            <option value="pending" ${dealer.status === 'pending' ? 'selected' : ''}>Pending Approval</option>
            <option value="rejected" ${dealer.status === 'rejected' ? 'selected' : ''}>Rejected</option>
            <option value="inactive" ${dealer.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
      <footer class="dlr-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary btn-save-profile">Save Changes</button>
      </footer>
    </div>
  `;

  modalEl.showModal();

  modalEl.querySelectorAll('.btn-close-modal').forEach((btn) => {
    btn.addEventListener('click', () => modalEl.close());
  });

  modalEl.querySelector('.btn-save-profile')?.addEventListener('click', () => {
    const dealers = getStoredDealers();
    const d = dealers.find((item) => item.id === dealer.id);
    if (d) {
      d.name = (modalEl.querySelector('#prof-name') as HTMLInputElement).value;
      d.code = (modalEl.querySelector('#prof-code') as HTMLInputElement).value;
      d.city = (modalEl.querySelector('#prof-city') as HTMLInputElement).value;
      d.state = (modalEl.querySelector('#prof-state') as HTMLInputElement).value;
      d.address = (modalEl.querySelector('#prof-address') as HTMLInputElement).value;
      d.contactPerson = (modalEl.querySelector('#prof-contact') as HTMLInputElement).value;
      d.phone = (modalEl.querySelector('#prof-phone') as HTMLInputElement).value;
      d.gstin = (modalEl.querySelector('#prof-gstin') as HTMLInputElement).value;
      d.status = (modalEl.querySelector('#prof-status') as HTMLSelectElement).value as any;

      saveStoredDealers(dealers);
      showToast('Dealer profile updated!', { ico: 'check' });
      renderDealerLocationButtons();
      updateDealerHeaderStats();
    }
    modalEl.close();
  });
}

function showRegisterDealerDialog(): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;

  modalEl.innerHTML = `
    <div class="dlr-dialog">
      <header class="dlr-dialog__header">
        <h3 class="dlr-dialog__title">Register New Dealership</h3>
        <button type="button" class="ibtn ibtn--sm btn-close-modal">${renderIcon('close')}</button>
      </header>
      <div class="dlr-dialog__body">
        <div class="dlr-form-group">
          <label>Dealership Legal Name</label>
          <input type="text" id="reg-name" placeholder="e.g. Kongu Agri Motors & Implements" required />
        </div>
        <div class="dlr-form-group">
          <label>City & State</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <input type="text" id="reg-city" placeholder="e.g. Erode" required />
            <input type="text" id="reg-state" placeholder="e.g. Tamil Nadu" required />
          </div>
        </div>
        <div class="dlr-form-group">
          <label>Contact Person & Phone</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <input type="text" id="reg-contact" placeholder="Proprietor name" required />
            <input type="text" id="reg-phone" placeholder="+91 98..." required />
          </div>
        </div>
        <div class="dlr-form-group">
          <label>GSTIN</label>
          <input type="text" id="reg-gstin" placeholder="33AAB..." required />
        </div>
        <div class="dlr-form-group">
          <label>Pricing Tier</label>
          <select id="reg-tier">
            <option value="silver">Silver (15% Standard)</option>
            <option value="gold">Gold (20% Premium)</option>
            <option value="platinum">Platinum (25% High Volume)</option>
            <option value="standard">Standard (10% Base)</option>
          </select>
        </div>
      </div>
      <footer class="dlr-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary btn-submit-reg">Submit Registration</button>
      </footer>
    </div>
  `;

  modalEl.showModal();

  modalEl.querySelectorAll('.btn-close-modal').forEach((btn) => {
    btn.addEventListener('click', () => modalEl.close());
  });

  modalEl.querySelector('.btn-submit-reg')?.addEventListener('click', () => {
    const name = (modalEl.querySelector('#reg-name') as HTMLInputElement).value;
    const city = (modalEl.querySelector('#reg-city') as HTMLInputElement).value;
    const state = (modalEl.querySelector('#reg-state') as HTMLInputElement).value;
    const contact = (modalEl.querySelector('#reg-contact') as HTMLInputElement).value;
    const phone = (modalEl.querySelector('#reg-phone') as HTMLInputElement).value;
    const gstin = (modalEl.querySelector('#reg-gstin') as HTMLInputElement).value;
    const tier = (modalEl.querySelector('#reg-tier') as HTMLSelectElement).value as any;

    if (!name || !city) {
      showToast('Please enter dealer name and city', { ico: 'alert' });
      return;
    }

    const dealers = getStoredDealers();
    const newDealer: Dealer = {
      id: `dlr-${Date.now()}`,
      code: `VELS-DLR-${city.slice(0, 2).toUpperCase()}${dealers.length + 1}`,
      name,
      contactPerson: contact || 'Manager',
      phone: phone || '+91 98000 00000',
      email: 'dealer@velsagro.com',
      city,
      state: state || 'Tamil Nadu',
      address: `${city} Main Commercial Road`,
      gstin: gstin || '33AABCV9999F1Z1',
      hubId: 'dc',
      status: 'pending',
      registrationDate: new Date().toISOString().split('T')[0],
      pricingTier: tier,
      discountPct: tier === 'platinum' ? 25 : tier === 'gold' ? 20 : tier === 'silver' ? 15 : 10,
      creditLimit: 5000000,
      creditUsed: 0,
      annualSalesTarget: 10000000,
      salesYTD: 0,
      stock: { 'p-01': 2, 'p-02': 4, 'p-04': 6 },
      ordersCount: 0,
    };

    dealers.unshift(newDealer);
    saveStoredDealers(dealers);
    showToast(`Registration submitted for ${newDealer.name}!`, { ico: 'check' });
    modalEl.close();
    renderDealerLocationButtons();
    updateDealerHeaderStats();
  });
}

function exportDealerReportCSV(): void {
  const dealers = getStoredDealers();
  const headers = [
    'Dealer Code',
    'Dealership Name',
    'City',
    'State',
    'Status',
    'Pricing Tier',
    'Discount %',
    'Credit Limit (INR)',
    'Units on Hand',
    'Sales YTD (INR)',
    'Annual Target (INR)',
  ];

  const rows = dealers.map((d) => [
    `"${d.code}"`,
    `"${d.name.replace(/"/g, '""')}"`,
    `"${d.city}"`,
    `"${d.state}"`,
    `"${d.status.toUpperCase()}"`,
    `"${d.pricingTier.toUpperCase()}"`,
    `"${d.discountPct}%"`,
    `"${d.creditLimit}"`,
    `"${Object.values(d.stock || {}).reduce((s, n) => s + n, 0)}"`,
    `"${d.salesYTD || 0}"`,
    `"${d.annualSalesTarget || 0}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Vels_Agro_Dealer_Report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Dealer Report CSV exported successfully!', { ico: 'check' });
}

// -------------------------------------------------------------
// 5. EVENT LISTENERS AND BINDINGS
// -------------------------------------------------------------
function bindLocationsEvents(): void {
  const view = subEl('locations');
  if (!view) return;

  view.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // 1. Dealer Location selector click
    const locBtn = target.closest('.wh-loc') as HTMLElement;
    if (locBtn && !target.closest('.dlr-loc-extra__btns')) {
      const locId = locBtn.dataset.loc;
      if (locId) selectDealerLocation(locId);
      return;
    }

    // 2. Status chips filter
    const statusChip = target.closest('[data-filter-status]') as HTMLElement;
    if (statusChip) {
      currentStatusFilter = statusChip.dataset.filterStatus || 'all';
      domQueryAll('[data-filter-status]', view).forEach((c) => {
        c.classList.toggle('is-active', c === statusChip);
      });
      renderDealerLocationButtons();
      return;
    }

    // 3. Export CSV button
    if (target.closest('#btn-export-dealer-csv')) {
      exportDealerReportCSV();
      return;
    }

    // 4. Register Dealer button
    if (target.closest('#btn-add-dealer')) {
      showRegisterDealerDialog();
      return;
    }

    // 5. Approve dealer button
    const approveBtn = target.closest('.btn-approve-dlr') as HTMLElement;
    if (approveBtn) {
      const id = approveBtn.dataset.id;
      const dealers = getStoredDealers();
      const d = dealers.find((item) => item.id === id);
      if (d) {
        d.status = 'active';
        d.approvedAt = new Date().toISOString().split('T')[0];
        saveStoredDealers(dealers);
        showToast(`${d.name} approved as Active Dealer!`, { ico: 'check' });
        renderDealerLocationButtons();
        updateDealerHeaderStats();
      }
      return;
    }

    // 6. Reject dealer button
    const rejectBtn = target.closest('.btn-reject-dlr') as HTMLElement;
    if (rejectBtn) {
      const id = rejectBtn.dataset.id;
      const dealers = getStoredDealers();
      const d = dealers.find((item) => item.id === id);
      if (d) {
        d.status = 'rejected';
        saveStoredDealers(dealers);
        showToast(`${d.name} registration rejected.`, { ico: 'alert' });
        renderDealerLocationButtons();
        updateDealerHeaderStats();
      }
      return;
    }

    // 7. Pricing button
    const pricingBtn = target.closest('.btn-pricing-dlr') as HTMLElement;
    if (pricingBtn) {
      const id = pricingBtn.dataset.id;
      const dealer = getStoredDealers().find((item) => item.id === id);
      if (dealer) showPricingDialog(dealer);
      return;
    }

    // 8. Profile button
    const profileBtn = target.closest('.btn-profile-dlr') as HTMLElement;
    if (profileBtn) {
      const id = profileBtn.dataset.id;
      const dealer = getStoredDealers().find((item) => item.id === id);
      if (dealer) showProfileDialog(dealer);
      return;
    }
  });

  // Bin Hover Tooltip in Yard & Bay Map
  const tipEl = kEl('tip');
  view.addEventListener('pointerover', (e) => {
    const binBtn = (e.target as HTMLElement).closest('.wh-bin[data-bin]') as HTMLElement;
    if (!binBtn || !tipEl) return;
    const binCode = binBtn.dataset.bin || '';
    const [zId] = binCode.split('-');
    const binItem = dealerBinsMap.get(zId)?.find((b) => b.code === binCode);
    if (!binItem) return;

    tipEl.innerHTML = `
      <b>Bay ${escapeHtml(binItem.code)}</b>
      ${binItem.items
        .map(
          (it) => `
          <span>
            ${it.p ? renderProductThumb(it.p, 'sm') : renderTag(it.ico || 'drop', it.tone || 'teal', 'sm')}
            <span>
              <em>${escapeHtml(it.name)}</em>
              <small>${escapeHtml(it.sub)}</small>
            </span>
          </span>
        `
        )
        .join('')}
    `;

    const mapRect = binBtn.closest('.wh-map')?.getBoundingClientRect();
    const btnRect = binBtn.getBoundingClientRect();
    if (mapRect) {
      tipEl.style.transform = `translate(${btnRect.left - mapRect.left + 24}px, ${btnRect.top - mapRect.top - 12}px)`;
      tipEl.style.opacity = '1';
    }
  });

  view.addEventListener('pointerout', (e) => {
    const binBtn = (e.target as HTMLElement).closest('.wh-bin[data-bin]');
    if (binBtn && tipEl) {
      tipEl.style.opacity = '0';
    }
  });
}

function bindTransfersEvents(): void {
  const view = subEl('transfers');
  if (!view) return;

  view.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Filter chips
    const chip = target.closest('[data-trf]') as HTMLElement;
    if (chip) {
      currentTransferFilter = chip.dataset.trf || 'all';
      domQueryAll('[data-trf]', view).forEach((c) => {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      updateTransfersList();
      return;
    }

    // Receive / Dispatch action button
    const stepBtn = target.closest('.btn-step-transfer') as HTMLElement;
    if (stepBtn) {
      const id = stepBtn.dataset.id;
      const transfers = getStoredTransfers();
      const tr = transfers.find((item) => item.id === id);
      if (tr) {
        if (tr.status === 'dispatched') {
          tr.status = 'received';
          showToast(`Transfer ${tr.number} received at ${tr.dealerName}!`, { ico: 'check' });
        } else {
          tr.status = 'dispatched';
          showToast(`Transfer ${tr.number} dispatched on the road!`, { ico: 'truck' });
        }
        saveStoredTransfers(transfers);
        updateTransfersList();
      }
      return;
    }

    // New Transfer button
    if (target.closest('#btn-new-dealer-transfer')) {
      showToast('Dispatch scheduler ready — select stock to move.', { ico: 'info' });
    }
  });
}

function bindCountsEvents(): void {
  const view = subEl('counts');
  if (!view) return;

  view.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Chips filter
    const chip = target.closest('[data-ctf]') as HTMLElement;
    if (chip) {
      currentCountFilter = chip.dataset.ctf || 'all';
      domQueryAll('[data-ctf]', view).forEach((c) => {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      updateCountsTable();
      return;
    }

    // Row click opens count drawer
    const row = target.closest('tr[data-ct]') as HTMLElement;
    if (row) {
      const countId = row.dataset.ct;
      if (countId) openCountDrawer(countId);
      return;
    }

    // Schedule new count button
    if (target.closest('#btn-schedule-dealer-count')) {
      const counts = getStoredCounts();
      const newCount: DealerCount = {
        id: `ct-${Date.now()}`,
        number: `VELS-AUD-2026-${String(counts.length + 1).padStart(3, '0')}`,
        dealerId: currentDealerId,
        dealerName: 'Sri Amman Agro Tractors (Salem)',
        scheduledDate: new Date().toISOString().split('T')[0],
        auditorName: 'K. Periyasamy',
        status: 'in_progress',
        lines: [
          { productId: 'p-01', productName: 'Vels 55HP 4WD Agro Tractor', systemUnits: 14, countedUnits: 14, variance: 0, unitPrice: 780000 },
          { productId: 'p-02', productName: 'Hydraulic Multi-Speed Rotavator (7ft)', systemUnits: 18, countedUnits: 17, variance: -1, unitPrice: 115000 },
          { productId: 'p-04', productName: 'Automated 16L Boom Sprayer Kit', systemUnits: 22, countedUnits: 23, variance: 1, unitPrice: 28000 },
        ],
        varianceUnits: 0,
        varianceValue: 0,
      };
      counts.unshift(newCount);
      saveStoredCounts(counts);
      showToast(`Audit sheet ${newCount.number} opened!`, { ico: 'clipboard' });
      updateCountsTable();
      openCountDrawer(newCount.id);
    }
  });
}

// -------------------------------------------------------------
// 6. FEATURE PAGE INTERFACE
// -------------------------------------------------------------
export const page = {
  title: (params?: string[]) => {
    const sub = params?.[0];
    if (sub === 'transfers') return 'Dealer Transfers';
    if (sub === 'counts') return 'Dealer Counts';
    return 'Dealer Locations';
  },

  mount(el: HTMLElement) {
    containerEl = el;
    containerEl.innerHTML = SUBTABS.map((sub) => `<div data-sub="${sub}" hidden></div>`).join('');

    // Mount locations
    const locView = subEl('locations');
    if (locView) {
      locView.innerHTML = renderLocationsSubtabHTML();
      renderDealerLocationButtons();
      updateDealerMap();
      updateDealerStockTable();
      updateDealerRecentMovements();
      bindLocationsEvents();
    }

    // Mount transfers
    const trView = subEl('transfers');
    if (trView) {
      trView.innerHTML = renderTransfersSubtabHTML();
      updateTransfersList();
      bindTransfersEvents();
    }

    // Mount counts
    const ctView = subEl('counts');
    if (ctView) {
      ctView.innerHTML = renderCountsSubtabHTML();
      updateCountsTable();
      bindCountsEvents();
    }
  },

  enter({ params, same }: { params?: string[]; same?: boolean } = {}) {
    const sub = SUBTABS.includes(params?.[0] || '') ? params![0] : 'locations';
    currentSubtab = sub;

    SUBTABS.forEach((s) => {
      const v = subEl(s);
      if (v) v.hidden = s !== sub;
    });

    if (sub === 'locations') {
      if (activeDrawerCountId) closeDrawer();
      renderDealerLocationButtons();
      updateDealerMap();
      updateDealerStockTable();
      updateDealerRecentMovements();
      updateDealerHeaderStats();
      if (!same) animateLocationsEntrance();
    } else if (sub === 'transfers') {
      if (activeDrawerCountId) closeDrawer();
      updateTransfersList();
      if (!same) animateTransfersEntrance();
    } else if (sub === 'counts') {
      updateCountsTable();
      if (!same) animateCountsEntrance();
      if (params?.[1]) {
        openCountDrawer(params[1]);
      } else if (activeDrawerCountId) {
        closeDrawer();
      }
    }
  },

  leave() {
    if (activeDrawerCountId) closeDrawer();
    closeCurrentPopover();
    tweenRegistry.splice(0).forEach((tw) => tw.kill());
    binEntranceTimeline?.kill();
  },
};
