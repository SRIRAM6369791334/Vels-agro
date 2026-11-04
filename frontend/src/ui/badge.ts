import { queryOne, domQueryAll } from '../utils/dom';
import { getStore, getLowStockProducts, getPendingOrdersToShip } from '../core/store';
import { animatePop } from '../core/motion';

let lastUnreadNoticeCount = -1;

export function updateNotificationBadges(): void {
  const store = getStore();
  if (!store) return;

  const btnBell = queryOne<HTMLButtonElement>('#btn-bell');
  let badge = queryOne<HTMLElement>('#bell-badge');

  const unreadNotices = store.notices ? store.notices.filter((n) => !n.read).length : 0;

  if (unreadNotices === 0) {
    if (badge) {
      badge.remove();
    }
    btnBell?.setAttribute('aria-label', 'Notifications');
  } else {
    if (!badge && btnBell) {
      badge = document.createElement('span');
      badge.className = 'dot-badge';
      badge.id = 'bell-badge';
      btnBell.appendChild(badge);
    }
    if (badge) {
      badge.hidden = false;
      badge.textContent = String(unreadNotices);
      if (lastUnreadNoticeCount >= 0 && unreadNotices > lastUnreadNoticeCount) {
        animatePop(badge, { from: 0.2 });
      }
    }
    btnBell?.setAttribute('aria-label', `Notifications, ${unreadNotices} unread`);
  }
  lastUnreadNoticeCount = unreadNotices;

  // Sidebar counters
  const lowStockCount = getLowStockProducts().length;
  const ordersToShipCount = getPendingOrdersToShip().length;

  const counts: Record<string, { count: number; label: string; desc: string }> = {
    products: { count: lowStockCount, label: 'Products', desc: 'low on stock' },
    orders: { count: ordersToShipCount, label: 'Orders', desc: 'orders to ship' },
  };

  Object.entries(counts).forEach(([key, info]) => {
    domQueryAll(`[data-count="${key}"], [data-pill-count="${key}"]`).forEach((el) => {
      el.textContent = info.count ? String(info.count) : '';
    });
    const navItem = queryOne(`.nav__track > a[data-route="${key}"]`);
    if (navItem) {
      navItem.setAttribute(
        'aria-label',
        info.count ? `${info.label}, ${info.count} ${info.desc}` : info.label
      );
    }
  });
}
