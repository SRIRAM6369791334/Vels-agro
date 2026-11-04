import {
  store,
  addNotification,
  notifyStoreSubscribers,
  getLowStockProducts,
  getLowStockMaterials,
} from '../../../core/store';
import { animateCards, animateRows, playHaptic, gsap } from '../../../core/motion';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import { renderIcon } from '../../../utils/icons';
import {
  renderPageHeader,
  renderTag,
  renderSegmentedControl,
  initSegmentedControl,
  renderEmptyState,
  showToast,
  getExpiringBatches,
  getActiveOrders,
  bindModalDismiss,
  animatePageTransition,
} from '../../../main';
import { NotificationAlertDef } from '../../../types/settings';
import { triggerSavedBadge, SAVED_BADGE_HTML } from '../components/form-controls';

export const ALERT_DEFS: NotificationAlertDef[] = [
  {
    key: 'lowStock',
    title: 'Low stock',
    text: () => {
      const lowCount = getLowStockProducts().length + getLowStockMaterials().length;
      return `When a product’s free stock at the DC reaches its reorder point. ${lowCount} items are low right now.`;
    },
    ico: 'alert',
    tone: 'ochre',
  },
  {
    key: 'expiry',
    title: 'Lots near expiry',
    text: () =>
      `When a released lot comes inside ${store.settings.prefs.expiryWarnDays} days of its expiry date.`,
    ico: 'calX',
    tone: 'teal',
  },
  {
    key: 'orders',
    title: 'New orders',
    text: () => 'Every wholesale order, and online orders over ₹100.',
    ico: 'orders',
    tone: 'sky',
  },
  {
    key: 'poUpdates',
    title: 'Purchase orders',
    text: () => 'When a supplier ships, part-ships or a delivery is late.',
    ico: 'truck',
    tone: 'ocean',
  },
  {
    key: 'returns',
    title: 'Returns',
    text: () => 'When a customer asks to send something back.',
    ico: 'return',
    tone: 'rose',
  },
];

let activeAlertsFilter = 'all';

export function renderSwitchButton(key: string, checked: boolean, label: string): string {
  return `<button type="button" class="switch" role="switch" aria-checked="${checked}" aria-label="${escapeHtml(label)}" data-n="${key}"></button>`;
}

export function renderNotificationsSubtab(): string {
  const notify = store.settings.notify;
  const me = store.settings.me;

  const times = ['06:00', '06:30', '07:00', '07:30', '08:00', '09:00'];
  const timeOptionsHtml = times
    .map((timeStr) => {
      const date = new Date(2026, 0, 1, Number(timeStr.slice(0, 2)), Number(timeStr.slice(3)));
      const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `<option value="${timeStr}"${(notify.digestAt ?? '07:00') === timeStr ? ' selected' : ''}>${timeFormatted}</option>`;
    })
    .join('');

  return `${renderPageHeader({
    eyebrow: 'What Vels tells you, and where',
    title: 'Notifications',
    actions: `<button type="button" class="btn btn--ghost" data-k="nt-test">${renderIcon('bell')}Send a test</button>`,
  })}
  <div class="st-grid st-grid--notif">
    <section class="card" aria-labelledby="nt-a-t">
      <header class="card__head"><div><h2 class="card__title" id="nt-a-t">Alerts</h2><p class="card__sub" data-k="nt-sub"></p></div>
        <div class="card__tools">${renderSegmentedControl(
          'Show alerts',
          [
            ['all', 'All'],
            ['on', 'On'],
            ['off', 'Off'],
          ],
          activeAlertsFilter,
          'st-seg-nf'
        )}</div></header>
      <div class="st-nlist" data-k="nt-list"></div>
    </section>
    <div class="st-stack">
      <section class="card" aria-labelledby="nt-c-t">
        <header class="card__head"><div><h2 class="card__title" id="nt-c-t">Where they go</h2><p class="card__sub">${escapeHtml(me.email)}</p></div></header>
        <div class="st-nlist">
          <div class="st-nrow" data-row="email">${renderTag('mail', 'sky', 'sm')}<span class="st-nrow__txt"><b>Email</b><small>To ${escapeHtml(me.email)}</small></span>${SAVED_BADGE_HTML}${renderSwitchButton('email', notify.email, 'Email notifications')}</div>
          <div class="st-nrow" data-row="push">${renderTag('mobile', 'pine', 'sm')}<span class="st-nrow__txt"><b>Push</b><small>On the iPhone with Vels installed</small></span>${SAVED_BADGE_HTML}${renderSwitchButton('push', notify.push, 'Push notifications')}</div>
        </div>
      </section>
      <section class="card st-digest" aria-labelledby="nt-d-t">
        <header class="card__head"><div><h2 class="card__title" id="nt-d-t">Morning digest</h2><p class="card__sub">One email instead of many</p></div></header>
        <div class="st-nrow" data-row="digest">${renderTag('sun', 'ochre', 'sm')}<span class="st-nrow__txt"><b>Send a digest</b><small>Weekdays, before the first pick</small></span>${SAVED_BADGE_HTML}${renderSwitchButton('digest', notify.digest, 'Morning digest')}</div>
        <label class="st-digest__at" data-k="nt-at-row"><span>Arrives at</span><select class="select" data-k="nt-at">${timeOptionsHtml}</select></label>
        <div class="st-digest__prev" data-k="nt-prev"></div>
      </section>
    </div>
  </div>`;
}

export function renderAlertsList(container: HTMLElement, withDismiss = false): void {
  const notify = store.settings.notify;
  const filtered = ALERT_DEFS.filter((def) =>
    activeAlertsFilter === 'all' ? true : activeAlertsFilter === 'on' ? (notify as any)[def.key] : !(notify as any)[def.key]
  );

  const rowsHtml = filtered.length
    ? filtered
        .map(
          (def) =>
            `<div class="st-nrow" data-key="${def.key}" data-row="${def.key}">${renderTag(def.ico, def.tone, 'sm')}<span class="st-nrow__txt"><b>${escapeHtml(def.title)}</b><small>${escapeHtml(def.text())}</small></span>${SAVED_BADGE_HTML}${renderSwitchButton(def.key, (notify as any)[def.key], def.title)}</div>`
        )
        .join('')
    : renderEmptyState(
        activeAlertsFilter === 'on' ? 'Every alert is off' : 'Every alert is on',
        activeAlertsFilter === 'on'
          ? 'Vels won’t tell you about anything. Turn on the ones you need.'
          : 'Nothing is muted. Turn off what you don’t need to hear.',
        'bell',
        '<button type="button" class="btn btn--ghost btn--sm" data-k="nt-all">Show all alerts</button>'
      );

  const listEl = queryOne<HTMLElement>('[data-k="nt-list"]', container);
  if (listEl) {
    if (withDismiss) {
      bindModalDismiss(listEl, () => {
        listEl.innerHTML = rowsHtml;
      });
    } else {
      listEl.innerHTML = rowsHtml;
    }
  }

  const onCount = ALERT_DEFS.filter((def) => (notify as any)[def.key]).length;
  const subEl = queryOne<HTMLElement>('[data-k="nt-sub"]', container);
  if (subEl) {
    subEl.textContent = `${onCount} of ${ALERT_DEFS.length} on${!notify.email && !notify.push ? ' — but no channel is on, so nothing arrives' : ''}`;
  }
}

export function updateDigestSection(container: HTMLElement): void {
  const notify = store.settings.notify;
  const atRow = queryOne<HTMLElement>('[data-k="nt-at-row"]', container);
  if (atRow) atRow.classList.toggle('is-off', !notify.digest);

  const atSelect = queryOne<HTMLSelectElement>('[data-k="nt-at"]', container);
  if (atSelect) atSelect.disabled = !notify.digest;

  const lowCount = getLowStockProducts().length + getLowStockMaterials().length;
  const expiryCount = getExpiringBatches().length;
  const activeOrdersCount = getActiveOrders().length;

  const previewItems: [string, string, number][] = [
    ['alert', 'items running low', lowCount],
    ['calX', 'lots near expiry', expiryCount],
    ['truck', 'orders to ship', activeOrdersCount],
  ];

  const prevEl = queryOne<HTMLElement>('[data-k="nt-prev"]', container);
  if (prevEl) {
    prevEl.innerHTML = notify.digest
      ? `<small>Tomorrow’s would say</small>${previewItems.map(([ico, label, cnt]) => `<span>${renderIcon(ico)}<b class="num">${cnt}</b> ${escapeHtml(label)}</span>`).join('')}`
      : `<small>${renderIcon('pause')}Digest is off — alerts arrive one at a time.</small>`;
  }
}

export function initNotificationsSubtab(container: HTMLElement, isCurrentSubtab: () => boolean): void {
  renderAlertsList(container, false);
  updateDigestSection(container);

  const filterCtrl = domQuery('.st-seg-nf', container);
  if (filterCtrl) {
    initSegmentedControl(filterCtrl, (val) => {
      activeAlertsFilter = val;
      renderAlertsList(container, true);
    });
  }

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const switchBtn = target.closest<HTMLButtonElement>('[data-n]');
    if (switchBtn) {
      const key = switchBtn.dataset.n as string;
      const currentVal = !!(store.settings.notify as any)[key];
      const newVal = !currentVal;
      (store.settings.notify as any)[key] = newVal;
      switchBtn.setAttribute('aria-checked', String(newVal));

      notifyStoreSubscribers('settings');
      triggerSavedBadge(switchBtn.closest('.st-nrow'));

      if (key === 'digest') {
        updateDigestSection(container);
      } else if (['email', 'push'].includes(key)) {
        renderAlertsList(container, false);
      } else {
        const subEl = queryOne<HTMLElement>('[data-k="nt-sub"]', container);
        const onCount = ALERT_DEFS.filter((def) => (store.settings.notify as any)[def.key]).length;
        if (subEl) subEl.textContent = `${onCount} of ${ALERT_DEFS.length} on`;

        if (activeAlertsFilter !== 'all') {
          setTimeout(() => {
            if (isCurrentSubtab()) {
              renderAlertsList(container, true);
            }
          }, 650);
        }
      }
      return;
    }

    if (target.closest('[data-k="nt-all"]')) {
      domQueryAll('.st-seg-nf .seg__btn', container)[0]?.click();
      return;
    }

    const testBtn = target.closest<HTMLElement>('[data-k="nt-test"]');
    if (testBtn) {
      playHaptic(testBtn);
      const notify = store.settings.notify;
      if (!notify.push && !notify.email) {
        showToast('Turn on email or push first — there’s nowhere to send it', { ico: 'alert' });
        return;
      }

      addNotification(
        'stock',
        'Test alert — this is how Vels tells you something needs a hand',
        '/settings/notifications'
      );
      notifyStoreSubscribers('notices');

      const dest = `${notify.push ? ' to your iPhone' : ''}${notify.push && notify.email ? ' and' : ''}${notify.email ? ` to ${store.settings.me.email}` : ''}`;
      showToast(`Test sent${dest} — and to the bell`, { ico: 'bell' });
    }
  });

  const atSelect = queryOne<HTMLSelectElement>('[data-k="nt-at"]', container);
  if (atSelect) {
    atSelect.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      store.settings.notify.digestAt = val;
      notifyStoreSubscribers('settings');
      triggerSavedBadge(domQuery('.st-digest [data-row="digest"]', container));
      const text = atSelect.selectedOptions[0]?.textContent ?? '';
      showToast(`Digest arrives at ${text}`, { ico: 'clock' });
    });
  }
}

export function animateNotificationsSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.08 }), 0.1)
    .add(animateRows(domQueryAll('.st-nrow', container), { x: 10, y: 0, stagger: 0.04 }), 0.3)
    .add(animateRows(domQueryAll('.st-digest__prev > *', container), { y: 6, stagger: 0.05 }), 0.6);
}
