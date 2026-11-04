import { findCustomerById } from '../../../core/store';
import { playHaptic, animatePulse, gsap } from '../../../core/motion';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import {
  formatDate,
  formatRelativeTime,
  formatMoneyRound,
  formatInt,
  pluralize,
} from '../../../utils/formatters';
import { renderIcon } from '../../../utils/icons';
import {
  renderAvatar,
  renderOrderStatusBadge,
  renderProductThumb,
  renderEmptyState,
  getOrderTotal,
  findBatchByLotNumber,
  openDrawer,
  closeDrawer,
  showToast,
  bindModalDismiss,
  animatePop,
  openNewOrderModal,
} from '../../../main';
import { renderColumnBarChart } from '../../../shared/widgets/charts';
import type { Customer, CustomerMetrics } from '../../../types/customer';
import {
  calculateCustomerMetrics,
  getCustomerTopProducts,
  generateMonthlyBucketTimestamps,
} from '../services/customer-metrics';
import { renderCustomerTagBadge } from './stockist-card';

const MAX_RECENT_DRAWER_ORDERS = 6;
let activeDrawerState: { id: string; el: HTMLElement; chart: any } | null = null;

const getDrawerElement = () => domQuery<HTMLDialogElement>('#drawer');

export function executeWhenDrawerReady(callback: () => void): void {
  const drawerEl = getDrawerElement();
  if (drawerEl && drawerEl.dataset.closing) {
    gsap.delayedCall(0.26, () => executeWhenDrawerReady(callback));
  } else {
    callback();
  }
}

export function renderDrawerRecentOrders(metrics: CustomerMetrics): string {
  if (metrics.orders.length) {
    return (
      metrics.orders
        .slice(0, MAX_RECENT_DRAWER_ORDERS)
        .map(
          (order: any) =>
            `<a class="row cd-ord" href="#/orders/all/${order.id}" data-key="${order.id}">
              <span class="row__txt">
                <b class="mono">${escapeHtml(order.number)}</b>
                <small>${escapeHtml(formatDate(order.createdAt, true))} · ${pluralize(findBatchByLotNumber(order), 'unit')}</small>
              </span>
              ${renderOrderStatusBadge(order.status)}
              <b class="cd-ord__tot">${formatMoneyRound(getOrderTotal(order))}</b>
            </a>`
        )
        .join('') +
      (metrics.orders.length > MAX_RECENT_DRAWER_ORDERS
        ? `<p class="cd-more">${pluralize(metrics.orders.length - MAX_RECENT_DRAWER_ORDERS, 'older order')} — <a href="#/orders/all">see the order book</a></p>`
        : '')
    );
  }
  return renderEmptyState('No orders yet', 'Their first order will show up here.', 'orders');
}

export function renderCustomerDrawerHtml(customer: Customer): string {
  const metrics = calculateCustomerMetrics(customer);
  const topProducts = getCustomerTopProducts(metrics);
  const isStockist = customer.kind === 'stockist';

  return `<header class="d-head">
    ${renderAvatar(customer.id, 'lg')}
    <div>
      <h2>${escapeHtml(customer.name)}</h2>
      <small>${isStockist ? `${escapeHtml(customer.contact ?? '')} · Stockist` : 'Shopper'} · ${escapeHtml(customer.city)}, ${escapeHtml(customer.region ?? '')}</small>
    </div>
  </header>
  <div class="d-pills">
    ${customer.tags.map(renderCustomerTagBadge).join('')}
    <span class="tag" style="--c:var(--slate)">Since ${escapeHtml(formatDate(customer.since ?? Date.now(), true))}</span>
  </div>
  <div class="cd-contact">
    <a class="cd-ch" href="mailto:${escapeHtml(customer.email)}">
      ${renderIcon('mail')}
      <span><small>Email</small><b>${escapeHtml(customer.email)}</b></span>
    </a>
    ${
      customer.phone
        ? `<a class="cd-ch" href="tel:${escapeHtml(customer.phone.replace(/[^\d+]/g, ''))}">
            ${renderIcon('phone')}
            <span><small>Phone</small><b>${escapeHtml(customer.phone)}</b></span>
          </a>`
        : ''
    }
    <span class="cd-ch">
      ${renderIcon('map')}
      <span><small>${isStockist ? 'Ships to' : 'Lives in'}</small><b>${escapeHtml(customer.city)}, ${escapeHtml(customer.region ?? '')}</b></span>
    </span>
  </div>
  <div class="d-facts" data-ds="facts">
    <div>
      <small>Orders</small>
      <b class="num" data-cf="n">${formatInt(metrics.n)}</b>
      <span>${metrics.orders.length - metrics.n ? `${metrics.orders.length - metrics.n} cancelled` : 'none cancelled'}</span>
    </div>
    <div>
      <small>Revenue</small>
      <b class="num" data-cf="rev">${formatMoneyRound(metrics.revenue)}</b>
      <span>${metrics.unpaid ? `${formatMoneyRound(metrics.unpaid)} unpaid` : 'All paid'}</span>
    </div>
    <div>
      <small>Average order</small>
      <b class="num">${formatMoneyRound(metrics.avg)}</b>
      <span>${isStockist ? 'Wholesale prices' : 'Retail prices'}</span>
    </div>
    <div>
      <small>Last order</small>
      <b>${escapeHtml(metrics.last ? formatRelativeTime(metrics.last) : '—')}</b>
      <span>${metrics.last ? escapeHtml(formatDate(metrics.last, true)) : 'Hasn’t ordered yet'}</span>
    </div>
  </div>
  <section class="d-sec">
    <h3>Monthly spend</h3>
    <div class="cd-bars" data-ds="bars"></div>
  </section>
  <section class="d-sec">
    <h3>Orders</h3>
    <div class="rows" data-ds="orders">${renderDrawerRecentOrders(metrics)}</div>
  </section>
  ${
    topProducts.length
      ? `<section class="d-sec">
          <h3>Buys most</h3>
          <div class="cd-top">
            ${topProducts
              .map(
                ({ p, u }) =>
                  `<a class="cd-prod" href="#/products/item/${p.id}">
                    ${renderProductThumb(p, 'lg')}
                    <b>${escapeHtml(p.name)}</b>
                    <small>${escapeHtml(p.size)} · ${pluralize(u, 'unit')}</small>
                  </a>`
              )
              .join('')}
          </div>
        </section>`
      : ''
  }
  <section class="d-sec">
    <h3>Note</h3>
    ${customer.note ? `<p class="note">${renderIcon('note')}<span>${escapeHtml(customer.note)}</span></p>` : '<p class="cd-nonote">No note on this account yet.</p>'}
  </section>
  <footer class="d-actions">
    <button type="button" class="btn btn--primary" data-do="order">${renderIcon('plus')}New order</button>
    <a class="btn btn--ghost" href="mailto:${escapeHtml(customer.email)}">${renderIcon('mail')}Email ${escapeHtml(isStockist ? ((customer.contact ?? '').split(' ')[0] ?? '') : (customer.name.split(' ')[0] ?? ''))}</a>
  </footer>`;
}

export function openCustomerProfileDrawer(customerId: string, activeSubtab: string): void {
  const customer = findCustomerById(customerId);
  const routePrefix = `#/customers/${activeSubtab}`;

  if (!customer) {
    showToast('That customer isn’t on file', { ico: 'alert' });
    history.replaceState(null, '', routePrefix);
    return;
  }

  const drawerEl = getDrawerElement();
  if (activeDrawerState?.id === customerId && drawerEl?.open && !drawerEl?.dataset.closing) {
    return;
  }

  executeWhenDrawerReady(() => {
    const { el } = openDrawer(renderCustomerDrawerHtml(customer), {
      label: customer.name,
      onClose: () => {
        if (activeDrawerState?.id === customerId) {
          activeDrawerState = null;
        }
        if (
          location.pathname.startsWith(`/customers/${activeSubtab}/${customerId}`) ||
          location.hash.startsWith(`${routePrefix}/${customerId}`)
        ) {
          history.replaceState(null, '', routePrefix);
        }
      },
    });

    const monthBuckets = generateMonthlyBucketTimestamps(6);
    const metrics = calculateCustomerMetrics(customer);
    const chart = renderColumnBarChart(domQuery('[data-ds="bars"]', el), {
      labels: monthBuckets.map((ts) =>
        new Date(ts).toLocaleDateString('en-US', {
          month: 'short',
        })
      ),
      values: metrics.monthly,
      format: formatMoneyRound,
      tone: customer.kind === 'stockist' ? 'pine' : 'sky',
      label: `Monthly spend of ${customer.name}`,
      highlight: 5,
    });
    chart.play(0.3);

    activeDrawerState = {
      id: customerId,
      el,
      chart,
    };

    animatePop(domQueryAll('.cd-prod .thumb', el), {
      from: 0.5,
      delay: 0.35,
      stagger: 0.07,
    });

    el.addEventListener('click', (evt) => {
      const orderBtn = (evt.target as HTMLElement).closest<HTMLElement>('[data-do="order"]');
      if (orderBtn) {
        playHaptic(orderBtn);
        openNewOrderModal(
          { customerId },
          orderBtn,
          (order: any) => {
            (window as any).navigateTo?.(`/orders/all/${order.id}`);
          }
        );
      }
    });
  });
}

export function refreshActiveDrawer(): void {
  const drawerEl = getDrawerElement();
  if (!activeDrawerState || !drawerEl?.open) {
    return;
  }

  const customer = findCustomerById(activeDrawerState.id);
  if (!customer) {
    closeDrawer();
    return;
  }

  const metrics = calculateCustomerMetrics(customer);
  const ordersContainer = queryOne<HTMLElement>('[data-ds="orders"]', activeDrawerState.el);
  if (ordersContainer) {
    bindModalDismiss(ordersContainer, () => {
      ordersContainer.innerHTML = renderDrawerRecentOrders(metrics);
    });
  }

  const countBadge = queryOne<HTMLElement>('[data-cf="n"]', activeDrawerState.el);
  const revBadge = queryOne<HTMLElement>('[data-cf="rev"]', activeDrawerState.el);

  if (countBadge && countBadge.textContent !== formatInt(metrics.n)) {
    countBadge.textContent = formatInt(metrics.n);
    animatePulse(countBadge);
  }
  if (revBadge && revBadge.textContent !== formatMoneyRound(metrics.revenue)) {
    revBadge.textContent = formatMoneyRound(metrics.revenue);
    animatePulse(revBadge);
  }

  activeDrawerState.chart?.update(metrics.monthly);
}

export function closeActiveCustomerDrawer(): void {
  const drawerEl = getDrawerElement();
  if (activeDrawerState && drawerEl?.open) {
    closeDrawer();
  }
}
