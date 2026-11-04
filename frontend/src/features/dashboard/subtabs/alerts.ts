import {
  store,
  findProductById,
  findCustomerById,
  findMemberById,
  getLowStockProducts,
  getOutOfStockProducts,
  getLowStockMaterials,
  getAvailableStock,
} from '../../../core/store';
import {
  gsap,
  animateTitle,
  animateCards,
  animateRows,
  playHaptic,
  morphReplace,
} from '../../../core/motion';
import { queryOne, domQueryAll, escapeHtml } from '../../../utils/dom';
import {
  formatInt,
  formatDate,
  formatRelativeTime,
  formatRelativeDay,
  pluralize,
  daysUntilExpiry,
} from '../../../utils/formatters';
import { ORDER_STATUS_META } from '../../../core/constants';
import {
  getExpiringBatches,
  getActiveOrders,
  getActiveOrdersForLocation,
  getMaterialOnOrder,
} from '../services/dashboard-metrics';
import {
  renderTag,
  renderPill,
  renderAvatar,
  renderProductThumb,
  renderOrderStatusBadge,
  renderEmptyState,
  renderIcon,
  formatProductFullName,
  renderSegmentedControl,
  initSegmentedControl,
  openMakeBatchModal,
  openMoveStockModal,
  openNewPoModal,
  openQuickCreateModal,
  showToast,
  releaseBatch,
  updateBatchStatus,
  getOrderTotal,
  getDraftPoSupplierIds,
} from '../../../main';

let currentFilter = 'all';

export function renderAlertsSubtab(): string {
  return `
    <header class="head">
      <div class="head__lead">
        <div class="head__text">
          <p class="head__eyebrow">What wants a decision today</p>
          <h1 class="head__title" tabindex="-1">Alerts</h1>
        </div>
      </div>
      <div class="head__actions">
        ${renderSegmentedControl(
          'Show',
          [
            ['all', 'All'],
            ['stock', 'Stock'],
            ['expiry', 'Expiry & QA'],
            ['orders', 'Orders'],
          ],
          currentFilter
        )}
      </div>
    </header>
    <div class="db-alerts" data-k="al-groups"></div>
  `;
}

export function initAlertsSubtab(container: HTMLElement): void {
  container.innerHTML = renderAlertsSubtab();

  const segEl = queryOne<HTMLElement>('.seg', container);
  if (segEl) {
    initSegmentedControl(segEl, (val) => {
      currentFilter = val;
      updateAlertsGroups(container, true);
    });
  }

  container.addEventListener('click', (e) => {
    const actBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-do]');
    if (!actBtn) return;
    playHaptic(actBtn);
    const [action, param] = (actBtn.dataset.do ?? '').split(':');

    if (action === 'batch') {
      openMakeBatchModal(param, actBtn);
    } else if (action === 'move') {
      openMoveStockModal({ from: 'dc', to: 'shop', productId: param }, actBtn);
    } else if (action === 'movein') {
      openMoveStockModal({ from: 'shop', to: 'dc', productId: param }, actBtn);
    } else if (action === 'po') {
      openNewPoModal({ materialId: param }, actBtn);
    } else if (action === 'reorder') {
      const drafted = getDraftPoSupplierIds();
      showToast(
        drafted.length
          ? `Drafted ${pluralize(drafted.length, 'purchase order')}`
          : 'Everything low is already on order',
        { ico: 'truck' }
      );
    } else if (action === 'release') {
      releaseBatch(param);
    } else if (action === 'hold') {
      openQuickCreateModal({
        title: 'Put lot on hold',
        sub: 'Its units come off sale until it is released.',
        from: actBtn,
        submit: 'Hold lot',
        fields: [
          {
            name: 'note',
            label: 'Reason',
            wide: true,
            required: true,
            placeholder: 'Selling at the studio as a sample',
            value: 'Near expiry — moving to sample stock',
          },
        ],
        onSubmit: (vals) => {
          updateBatchStatus(param, vals.note);
        },
      });
    }
  });
}

export function updateAlertsGroups(container: HTMLElement, isAnimate = false): void {
  const outOfStock = getOutOfStockProducts();
  const lowProducts = getLowStockProducts().filter((p: any) => !outOfStock.includes(p));
  const lowMaterials = getLowStockMaterials();
  const expiring = getExpiringBatches();
  const qaBatches = (store.batches ?? []).filter((b: any) => b.status === 'quarantine');
  const activeOrders = getActiveOrders();
  const overdueOrders = activeOrders.filter((o: any) => o.shipBy < Date.now());

  const actionBtn = (action: string, label: string, icon: string, btnClass = 'btn--ghost') =>
    `<button type="button" class="btn ${btnClass} btn--xs" data-do="${action}">${renderIcon(icon)}${escapeHtml(label)}</button>`;

  const groups = [
    {
      key: 'out',
      tab: 'stock',
      title: 'Out of stock',
      tone: 'rose',
      ico: 'box',
      items: outOfStock.map((prod: any) => {
        const qaCount = (store.batches ?? [])
          .filter((b: any) => b.productId === prod.id && b.status === 'quarantine')
          .reduce((acc: number, b: any) => acc + b.qty, 0);
        const promised = getActiveOrdersForLocation(prod.id, 'dc');
        return `<div class="row al-item" data-key="o-${prod.id}">
          ${renderProductThumb(prod, 'md')}
          <span class="row__txt">
            <b>${escapeHtml(formatProductFullName(prod))}</b>
            <small>${prod.stock?.dc ?? 0} at the DC${promised ? ` · ${promised} promised to orders` : ''} · ${prod.stock?.shop ?? 0} at the shop · ${qaCount || 'none'} in QA</small>
          </span>
          <span class="al-acts">
            ${actionBtn(`batch:${prod.id}`, 'Make a batch', 'flask', 'btn--primary')}
            ${(prod.stock?.shop ?? 0) > 0 ? actionBtn(`movein:${prod.id}`, 'Pull from shop', 'swap') : ''}
          </span>
        </div>`;
      }),
    },
    {
      key: 'low',
      tab: 'stock',
      title: 'Running low',
      tone: 'ochre',
      ico: 'alert',
      items: lowProducts.map((prod: any) => {
        const freeStock = getAvailableStock(prod, 'dc');
        return `<div class="row al-item" data-key="l-${prod.id}">
          ${renderProductThumb(prod, 'md')}
          <span class="row__txt">
            <b>${escapeHtml(formatProductFullName(prod))}</b>
            <small>${freeStock} free · reorder at ${prod.reorderAt} · makes ${prod.reorderQty} a run</small>
          </span>
          <span class="al-acts">
            ${actionBtn(`batch:${prod.id}`, 'Make a batch', 'flask', 'btn--soft')}
          </span>
        </div>`;
      }),
    },
    {
      key: 'mat',
      tab: 'stock',
      title: 'Materials to reorder',
      tone: 'ochre',
      ico: 'drop',
      items: lowMaterials.map((mat: any) => {
        const onOrder = getMaterialOnOrder(mat.id);
        return `<div class="row al-item" data-key="m-${mat.id}">
          ${renderTag('drop', 'ochre')}
          <span class="row__txt">
            <b>${escapeHtml(mat.name)}</b>
            <small>${mat.onHand} ${mat.unit} on hand · reorder at ${mat.reorderAt}${onOrder ? ` · <b>${formatInt(onOrder)} on order</b>` : ''}</small>
          </span>
          <span class="al-acts">
            ${onOrder ? renderPill('On order', 'sky') : actionBtn(`po:${mat.id}`, 'Order', 'cart', 'btn--soft')}
          </span>
        </div>`;
      }),
    },
    {
      key: 'exp',
      tab: 'expiry',
      title: 'Expiring soon',
      tone: 'teal',
      ico: 'calX',
      items: expiring.map((batch: any) => {
        const prod = findProductById(batch.productId);
        const days = daysUntilExpiry(batch);
        return `<div class="row al-item" data-key="e-${batch.id}">
          ${renderProductThumb(prod, 'md')}
          <span class="row__txt">
            <b>${escapeHtml(formatProductFullName(prod))} <span class="mono al-lot">${escapeHtml(batch.lot)}</span></b>
            <small>${batch.left} left · expires ${formatDate(batch.expiresAt, true)} (${days <= 0 ? 'expired' : `in ${pluralize(days, 'day')}`})</small>
          </span>
          <span class="al-acts">
            ${actionBtn(`move:${prod?.id}`, 'Sell at the shop', 'store', 'btn--soft')}
            ${actionBtn(`hold:${batch.id}`, 'Hold', 'pause')}
          </span>
        </div>`;
      }),
    },
    {
      key: 'qa',
      tab: 'expiry',
      title: 'Waiting on QA',
      tone: 'ocean',
      ico: 'flask',
      items: qaBatches.map((batch: any) => {
        const prod = findProductById(batch.productId);
        const chemist = findMemberById(batch.chemistId);
        return `<div class="row al-item" data-key="q-${batch.id}">
          ${renderProductThumb(prod, 'md')}
          <span class="row__txt">
            <b>${escapeHtml(formatProductFullName(prod))} <span class="mono al-lot">${escapeHtml(batch.lot)}</span></b>
            <small>${batch.qty} units · made ${formatRelativeTime(batch.madeAt)} by ${escapeHtml(chemist?.name ?? '')}${batch.note ? ` · ${escapeHtml(batch.note)}` : ''}</small>
          </span>
          <span class="al-acts">
            ${actionBtn(`release:${batch.id}`, 'Release', 'shield', 'btn--primary')}
          </span>
        </div>`;
      }),
    },
    {
      key: 'late',
      tab: 'orders',
      title: 'Late to ship',
      tone: 'rose',
      ico: 'clock',
      items: overdueOrders.map((ord: any) => {
        const cust = findCustomerById(ord.customerId);
        return `<a class="row al-item" href="/orders/all/${ord.id}" data-key="t-${ord.id}">
          ${renderAvatar(ord.customerId, 'md')}
          <span class="row__txt">
            <b>${escapeHtml(cust?.name ?? '')}</b>
            <small><span class="mono">${ord.number}</span> · due ${formatRelativeTime(ord.shipBy)} · ${(ORDER_STATUS_META as any)[ord.status]?.name ?? ord.status}</small>
          </span>
          ${renderIcon('chevR', 'row__go')}
        </a>`;
      }),
    },
    {
      key: 'pend',
      tab: 'orders',
      title: 'Waiting to ship',
      tone: 'sky',
      ico: 'hourglass',
      items: activeOrders
        .filter((o: any) => !overdueOrders.includes(o))
        .slice(0, 8)
        .map((ord: any) => {
          const cust = findCustomerById(ord.customerId);
          return `<a class="row al-item" href="/orders/all/${ord.id}" data-key="p-${ord.id}">
            ${renderAvatar(ord.customerId, 'md')}
            <span class="row__txt">
              <b>${escapeHtml(cust?.name ?? '')}</b>
              <small><span class="mono">${ord.number}</span> · ship by ${formatRelativeDay(ord.shipBy).toLowerCase()} · ${formatInt(getOrderTotal(ord))}</small>
            </span>
            ${renderOrderStatusBadge(ord.status)}
          </a>`;
        }),
    },
  ].filter((g) => (currentFilter === 'all' || g.tab === currentFilter) && g.items.length);

  const html = groups.length
    ? groups
        .map(
          (g) => `<section class="card al-group" data-key="g-${g.key}" style="--c:var(--${g.tone})" aria-labelledby="alg-${g.key}">
            <header class="card__head">
              <h2 class="card__title" id="alg-${g.key}">${renderTag(g.ico, g.tone, 'sm')}${escapeHtml(g.title)} <span class="al-n">${g.items.length}</span></h2>
              ${g.key === 'mat' && lowMaterials.some((m: any) => !getMaterialOnOrder(m.id)) ? `<div class="card__tools">${actionBtn('reorder', 'Draft every reorder', 'truck', 'btn--primary')}</div>` : ''}
            </header>
            <div class="rows">${g.items.join('')}</div>
          </section>`
        )
        .join('')
    : `<section class="card">${renderEmptyState('All clear', 'Nothing here wants a decision right now. New alerts appear as stock moves.', 'shield')}</section>`;

  const groupsEl = queryOne<HTMLElement>('[data-k="al-groups"]', container);
  if (!groupsEl) return;

  if (isAnimate) {
    morphReplace(groupsEl, () => {
      groupsEl.innerHTML = html;
    });
  } else {
    groupsEl.innerHTML = html;
  }
}

export function animateAlertsSubtab(container: HTMLElement): void {
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
      animateCards(domQueryAll('.al-group, .db-alerts > .card', container), {
        stagger: 0.08,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll('.al-item', container).slice(0, 14), {
        y: 10,
        stagger: 0.035,
      }),
      0.3
    );
}
