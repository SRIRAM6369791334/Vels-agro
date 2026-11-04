import { store, findMemberById, findProductById, findLocationById } from '../../../core/store';
import {
  gsap,
  motionDuration,
  animateTitle,
  animateCards,
  animateRows,
  playHaptic,
  morphReplace,
} from '../../../core/motion';
import { domQuery, queryOne, domQueryAll, escapeHtml } from '../../../utils/dom';
import {
  formatInt,
  formatTime,
  formatRelativeTime,
  formatRelativeDay,
} from '../../../utils/formatters';
import { STOCK_MOVE_REASON_NAMES } from '../../../core/constants';
import {
  renderTag,
  renderAvatar,
  renderProductThumb,
  renderEmptyState,
  renderIcon,
  formatProductFullName,
} from '../../../main';

let currentKind = 'all';
let searchQuery = '';
let displayLimit = 24;

const KIND_FILTERS: [string, string, string[]][] = [
  ['all', 'Everything', []],
  ['stock', 'Stock', ['stock', 'count']],
  ['ship', 'Orders & shipping', ['order', 'ship', 'return']],
  ['batch', 'Batches', ['batch']],
  ['po', 'Purchasing', ['po']],
  ['transfer', 'Transfers', ['transfer']],
  ['team', 'Team', ['team', 'note']],
];

const ACTIVITY_KIND_META: Record<string, [string, string]> = {
  stock: ['box', 'pine'],
  ship: ['truck', 'teal'],
  order: ['orders', 'sky'],
  return: ['return', 'ocean'],
  po: ['cart', 'ochre'],
  batch: ['flask', 'ocean'],
  transfer: ['swap', 'teal'],
  count: ['clipCheck', 'sage'],
  team: ['users', 'slate'],
  note: ['note', 'slate'],
};

export function renderActivitySubtab(): string {
  return `
    <header class="head">
      <div class="head__lead">
        <div class="head__text">
          <p class="head__eyebrow">Everything that happened in the stockroom</p>
          <h1 class="head__title" tabindex="-1">Activity</h1>
        </div>
      </div>
      <div class="head__actions">
        <a class="btn btn--ghost" href="/dashboard/overview">${renderIcon('back')}Overview</a>
      </div>
    </header>
    <div class="db-actgrid">
      <section class="card" aria-label="Activity log">
        <div class="toolbar">
          <div class="chips" data-k="a-kinds">
            ${KIND_FILTERS.map(
              ([k, label]) =>
                `<button type="button" class="chip" data-kind="${k}" aria-pressed="${k === currentKind}">${escapeHtml(label)}</button>`
            ).join('')}
          </div>
          <span class="toolbar__spacer"></span>
          <label class="search">
            ${renderIcon('search')}
            <input type="search" placeholder="Search activity…" aria-label="Search activity" data-k="a-q" />
          </label>
        </div>
        <div class="tl" data-k="a-list"></div>
        <div class="db-more">
          <button type="button" class="btn btn--ghost btn--sm" data-k="a-more">Show more</button>
        </div>
      </section>
      <aside class="db-actside">
        <section class="card" aria-labelledby="mv-t">
          <header class="card__head">
            <div>
              <h2 class="card__title" id="mv-t">Last 7 days</h2>
              <p class="card__sub">Finished goods, in units</p>
            </div>
          </header>
          <div class="db-flow" data-k="flow"></div>
        </section>
        <section class="card" aria-labelledby="led-t">
          <header class="card__head">
            <div>
              <h2 class="card__title" id="led-t">Stock ledger</h2>
              <p class="card__sub">The latest movements</p>
            </div>
          </header>
          <div class="rows db-ledger" data-k="ledger"></div>
        </section>
      </aside>
    </div>
  `;
}

export function initActivitySubtab(container: HTMLElement): void {
  container.innerHTML = renderActivitySubtab();

  const kindsEl = queryOne('[data-k="a-kinds"]', container);
  kindsEl?.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-kind]');
    if (!chip) return;
    playHaptic(chip);
    currentKind = chip.dataset.kind ?? 'all';
    displayLimit = 24;
    domQueryAll<HTMLButtonElement>('[data-kind]', kindsEl).forEach((b) =>
      b.setAttribute('aria-pressed', String(b === chip))
    );
    updateActivityList(container, true);
  });

  const searchInput = queryOne<HTMLInputElement>('[data-k="a-q"]', container);
  searchInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    displayLimit = 24;
    updateActivityList(container, true);
  });

  const moreBtn = queryOne<HTMLButtonElement>('[data-k="a-more"]', container);
  moreBtn?.addEventListener('click', () => {
    displayLimit += 24;
    updateActivityList(container, true);
  });
}

export function updateActivityList(container: HTMLElement, isAnimate = false): void {
  const allowedKinds = KIND_FILTERS.find(([k]) => k === currentKind)?.[2] ?? [];
  const q = searchQuery.trim().toLowerCase();

  const filtered = (store.activity ?? []).filter((a: any) => {
    const kindMatch = !allowedKinds.length || allowedKinds.includes(a.kind);
    const memberName = findMemberById(a.who)?.name ?? '';
    const textMatch =
      !q || `${a.title} ${a.text} ${memberName}`.toLowerCase().includes(q);
    return kindMatch && textMatch;
  });

  const visibleItems = filtered.slice(0, displayLimit);
  let lastDay = '';
  const html = visibleItems.length
    ? visibleItems
        .map((item: any) => {
          const dayLabel = formatRelativeDay(item.at);
          const dayHeader =
            dayLabel === lastDay
              ? ''
              : `<h3 class="tl__day" data-key="d-${dayLabel}">${escapeHtml(dayLabel)}</h3>`;
          lastDay = dayLabel;
          const [ico, tone] = ACTIVITY_KIND_META[item.kind] ?? ['clock', 'slate'];
          const actorName =
            findMemberById(item.who)?.name ?? (item.who === 'web' ? 'Online store' : '');
          return `${dayHeader}<a class="tl__item" href="${item.href ?? '/dashboard/activity'}" data-key="${item.id}">
            ${renderTag(ico, tone, 'sm')}
            <span class="tl__txt">
              <b>${escapeHtml(item.title)}</b>
              <span>${escapeHtml(item.text)}</span>
              <small>${renderAvatar(item.who, 'xs')}${escapeHtml(actorName)} · ${formatTime(item.at)}</small>
            </span>
          </a>`;
        })
        .join('')
    : renderEmptyState('No activity matches', 'Try another filter or clear the search.', 'search');

  const listEl = queryOne<HTMLElement>('[data-k="a-list"]', container);
  if (!listEl) return;

  if (isAnimate) {
    morphReplace(listEl, () => {
      listEl.innerHTML = html;
    });
  } else {
    listEl.innerHTML = html;
  }

  const moreBtn = queryOne<HTMLButtonElement>('[data-k="a-more"]', container);
  if (moreBtn) {
    moreBtn.hidden = filtered.length <= displayLimit;
  }
}

export function updateStockLedger(container: HTMLElement): void {
  const ledgerEl = queryOne('[data-k="ledger"]', container);
  if (ledgerEl) {
    ledgerEl.innerHTML = (store.moves ?? [])
      .slice(0, 9)
      .map((m: any) => {
        const prod = findProductById(m.itemId);
        const name = prod
          ? formatProductFullName(prod)
          : (store.materials?.find((mat: any) => mat.id === m.itemId)?.name ?? m.itemId);
        const loc = findLocationById(m.locId);
        const reasonName = (STOCK_MOVE_REASON_NAMES as any)[m.kind] ?? m.kind;
        return `<div class="row db-ledger__row">
          ${prod ? renderProductThumb(prod, 'sm') : renderTag('drop', 'ocean', 'sm')}
          <span class="row__txt">
            <b>${escapeHtml(name)}</b>
            <small>${escapeHtml(reasonName)} · <span class="mono">${escapeHtml(m.ref)}</span> · ${escapeHtml(loc?.name ?? '')}</small>
          </span>
          <span class="row__end">
            <b class="${m.qty >= 0 ? 'is-up' : 'is-down'}">${m.qty >= 0 ? '+' : '−'}${formatInt(Math.abs(m.qty))}</b>
            ${formatRelativeTime(m.at)}
          </span>
        </div>`;
      })
      .join('');
  }

  const since = Date.now() - 7 * 86400000;
  const recentMoves = (store.moves ?? []).filter(
    (m: any) => m.at >= since && findProductById(m.itemId)
  );

  const sumMoves = (predicate: (kind: string) => boolean, sign: number) =>
    recentMoves
      .filter((m: any) => predicate(m.kind) && Math.sign(m.qty) === sign)
      .reduce((acc: number, m: any) => acc + Math.abs(m.qty), 0);

  const flows: [string, number, string][] = [
    ['Released from QA', sumMoves((k) => k === 'production', 1), 'ocean'],
    ['Shipped to customers', sumMoves((k) => k === 'sale', -1), 'pine'],
    ['Moved between sites', sumMoves((k) => k === 'transfer', 1), 'teal'],
    ['Returned to shelf', sumMoves((k) => k === 'return', 1), 'sky'],
    [
      'Adjusted or counted',
      sumMoves((k) => k === 'adjust' || k === 'count', -1) +
        sumMoves((k) => k === 'adjust' || k === 'count', 1),
      'ochre',
    ],
  ];

  const maxVal = Math.max(1, ...flows.map((f) => f[1]));
  const flowEl = queryOne('[data-k="flow"]', container);
  if (flowEl) {
    flowEl.innerHTML = flows
      .map(
        ([title, qty, tone]) =>
          `<div class="db-flow__row">
            <span>${escapeHtml(title)}</span>
            <b class="num">${formatInt(qty)}</b>
            <span class="meter">
              <span class="meter__fill" data-to="${Math.max(0.02, qty / maxVal)}" style="--c:var(--${tone});transform:scaleX(${Math.max(0.02, qty / maxVal)})"></span>
            </span>
          </div>`
      )
      .join('');
  }
}

export function animateActivitySubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animateTitle(queryOne('.head__title', container)), 0)
    .add(
      animateRows(domQueryAll('.head__eyebrow, .head__actions > *', container), {
        y: 8,
      }),
      0.05
    )
    .add(
      animateCards(domQueryAll('.card', container), {
        stagger: 0.08,
      }),
      0.1
    )
    .add(
      animateRows(domQueryAll('.tl__item, .tl__day', container).slice(0, 16), {
        y: 12,
        stagger: 0.035,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll('.db-ledger__row', container), {
        x: 10,
        y: 0,
        stagger: 0.04,
      }),
      0.4
    );

  gsap.fromTo(
    domQueryAll('.db-flow .meter__fill', container),
    { scaleX: 0 },
    {
      scaleX: (_i, el: HTMLElement) => Number(el.dataset.to ?? 1),
      duration: motionDuration(1),
      stagger: motionDuration(0.08),
      delay: motionDuration(0.4),
      ease: 'power3.inOut',
    }
  );
}
