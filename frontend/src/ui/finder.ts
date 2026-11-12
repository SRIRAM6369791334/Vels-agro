import { gsap, motionDuration, animateRows } from '../core/motion';
import { closeCurrentPopover } from './popover';
import { domQuery, queryOne, domQueryAll, escapeHtml } from '../utils/dom';
import { renderIcon } from '../utils/icons';
import { SearchResult } from '../types/common';
import { getStore } from '../core/store';
import { navigateTo } from '../core/router';

let activeSelectedIndex = 0;
let currentResults: SearchResult[] = [];

export function querySearchIndex(query: string): SearchResult[] {
  const store = getStore();
  const qClean = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  const matches = (...fields: (string | undefined | null)[]) => {
    if (!qClean) return true;
    return fields.some((f) => f && f.toLowerCase().includes(qClean));
  };

  // 1. Pages / Navigation
  const pages: { label: string; meta: string; href: string }[] = [
    { label: 'Dashboard', meta: 'Overview, analytics & KPIs', href: '/dashboard/overview' },
    { label: 'Categories', meta: 'Machinery categories, sub-categories & compatibility matrix', href: '/categories/list' },
    { label: 'Products', meta: 'Catalog & formulation BOMs', href: '/products/catalog' },
    { label: 'Orders', meta: 'Sales orders & Kanban board', href: '/orders/board' },
    { label: 'Purchasing', meta: 'Purchase orders, suppliers & raw materials', href: '/purchasing/orders' },
    { label: 'Warehouses', meta: 'Locations, transfers & cycle counts', href: '/warehouses/locations' },
    { label: 'Dealers', meta: 'Dealer network, registrations, pricing & inventory', href: '/dealers/locations' },
    { label: 'Analytics', meta: 'Reports, revenue & stock velocity', href: '/analytics/overview' },
    { label: 'Customers', meta: 'Stockists, retail shoppers & RFM ledger', href: '/customers/stockists' },
    { label: 'Settings', meta: 'Account, team roles, billing & alerts', href: '/settings/account' },
    { label: 'Help center', meta: 'Knowledge base, shortcuts & tickets', href: '/help/center' },
  ];

  pages
    .filter((p) => matches(p.label, p.meta))
    .slice(0, 3)
    .forEach((p) => {
      results.push({
        group: 'Pages',
        label: p.label,
        meta: p.meta,
        href: p.href,
        lead: `<span class="lead">${renderIcon('sidebar')}</span>`,
      });
    });

  if (!store) return results;

  // 2. Products
  store.products
    .filter((p) => matches(p.name, p.sku, p.category))
    .slice(0, 4)
    .forEach((p) => {
      results.push({
        group: 'Products',
        label: p.name,
        meta: `${p.size} · ${p.sku ?? ''} · ₹${p.price}`,
        href: `/products/item/${p.id}`,
        lead: `<span class="lead">${renderIcon('box')}</span>`,
      });
    });

  // 3. Batches
  store.batches
    .filter((b) => matches(b.lot, b.status))
    .slice(0, 3)
    .forEach((b) => {
      const prod = store.products.find((p) => p.id === b.productId);
      results.push({
        group: 'Batches',
        label: `Lot ${b.lot}`,
        meta: `${prod?.name ?? ''} · ${b.status} · ${b.left} left`,
        href: `/products/batches/${b.id}`,
        lead: `<span class="lead">${renderIcon('cal')}</span>`,
      });
    });

  // 4. Orders
  store.orders
    .filter((o) => matches(o.number, o.status, o.carrier))
    .slice(0, 3)
    .forEach((o) => {
      const cust = store.customers.find((c) => c.id === o.customerId);
      results.push({
        group: 'Orders',
        label: o.number,
        meta: `${cust?.name ?? ''} · ${o.status} · ₹${o.lines.reduce((acc, l) => acc + l.qty * l.price, 0)}`,
        href: `/orders/all/${o.id}`,
        lead: `<span class="lead">${renderIcon('orders')}</span>`,
      });
    });

  // 5. Customers
  store.customers
    .filter((c) => matches(c.name, c.email, c.city))
    .slice(0, 3)
    .forEach((c) => {
      results.push({
        group: 'Customers',
        label: c.name,
        meta: `${c.kind === 'stockist' ? 'Stockist' : 'Shopper'} · ${c.city}`,
        href: `/customers/${c.kind === 'stockist' ? 'stockists' : 'shoppers'}/${c.id}`,
        lead: `<span class="lead">${renderIcon('users')}</span>`,
      });
    });

  // 6. Suppliers
  store.suppliers
    .filter((s) => matches(s.name, s.contact, s.country))
    .slice(0, 3)
    .forEach((s) => {
      results.push({
        group: 'Suppliers',
        label: s.name,
        meta: `${s.contact} · ${s.country}`,
        href: `/purchasing/suppliers/${s.id}`,
        lead: `<span class="lead">${renderIcon('cart')}</span>`,
      });
    });

  // 7. Materials
  store.materials
    .filter((m) => matches(m.name, m.code, m.sku))
    .slice(0, 3)
    .forEach((m) => {
      results.push({
        group: 'Materials',
        label: m.name,
        meta: `${m.code ?? m.sku ?? ''} · ${m.onHand} ${m.unit}`,
        href: `/purchasing/materials/${m.id}`,
        lead: `<span class="lead">${renderIcon('drop')}</span>`,
      });
    });

  return results;
}

function highlightMatch(text: string, query: string): string {
  if (!query) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return escapeHtml(text);
  return `${escapeHtml(text.slice(0, idx))}<mark>${escapeHtml(text.slice(idx, idx + query.length))}</mark>${escapeHtml(text.slice(idx + query.length))}`;
}

export function renderFinderList(query: string, dialog: HTMLDialogElement): void {
  const listEl = dialog.querySelector<HTMLUListElement>('#finder-list');
  const inputEl = dialog.querySelector<HTMLInputElement>('#finder-q');
  if (!listEl) return;

  currentResults = querySearchIndex(query);
  activeSelectedIndex = Math.min(activeSelectedIndex, Math.max(0, currentResults.length - 1));

  if (!currentResults.length) {
    listEl.innerHTML = `
      <li class="empty" role="presentation">
        ${renderIcon('search')}
        <p class="empty__title">Nothing matches “${escapeHtml(query)}”</p>
        <p class="empty__text">Try a product, a SKU, a lot number, an order, a customer or a supplier.</p>
      </li>
    `;
    inputEl?.removeAttribute('aria-activedescendant');
    return;
  }

  let currentGroup = '';
  listEl.innerHTML = currentResults
    .map((item, idx) => {
      const groupHeader =
        item.group === currentGroup
          ? ''
          : `<li class="finder__group" role="presentation">${escapeHtml(item.group)}</li>`;
      currentGroup = item.group;
      const isSelected = idx === activeSelectedIndex;
      return `
        ${groupHeader}
        <li class="finder__opt" role="option" id="fo-${idx}" aria-selected="${isSelected}" data-i="${idx}">
          ${item.lead}
          <span>
            <b>${highlightMatch(item.label, query)}</b>
            <small>${escapeHtml(item.meta)}</small>
          </span>
          <span class="go">${renderIcon('chevR')}</span>
        </li>
      `;
    })
    .join('');

  inputEl?.setAttribute('aria-activedescendant', `fo-${activeSelectedIndex}`);
}

export function openFinder(): void {
  const dialog = queryOne<HTMLDialogElement>('#finder');
  if (!dialog || dialog.open) return;

  closeCurrentPopover(true);

  const input = dialog.querySelector<HTMLInputElement>('#finder-q');
  if (input) input.value = '';
  activeSelectedIndex = 0;

  renderFinderList('', dialog);
  dialog.showModal();

  // Scrim overlay activation
  const scrim = queryOne<HTMLElement>('.scrim');
  if (scrim) {
    gsap.killTweensOf(scrim);
    gsap.to(scrim, { autoAlpha: 1, duration: motionDuration(0.05) });
  }

  gsap.fromTo(
    dialog,
    { opacity: 0, y: -14, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: motionDuration(0.38),
      ease: 'back.out(1.6)',
      clearProps: 'transform',
    }
  );

  const opts = Array.from(dialog.querySelectorAll<HTMLElement>('.finder__opt'));
  animateRows(opts, { y: 8, stagger: 0.025 });

  input?.focus();
}

export function closeFinder(): void {
  const dialog = queryOne<HTMLDialogElement>('#finder');
  if (!dialog || !dialog.open) return;

  dialog.dataset.closing = '1';

  // Scrim overlay dismissal
  const scrim = queryOne<HTMLElement>('.scrim');
  if (scrim) {
    gsap.killTweensOf(scrim);
    gsap.to(scrim, { autoAlpha: 0, duration: motionDuration(0.2) });
  }

  gsap.to(dialog, {
    opacity: 0,
    y: -8,
    duration: motionDuration(0.2),
    ease: 'power2.in',
    onComplete: () => {
      delete dialog.dataset.closing;
      dialog.close();
      gsap.set(dialog, { clearProps: 'all' });
    },
  });
}

export function selectFinderItem(index: number): void {
  const item = currentResults[index];
  if (item) {
    closeFinder();
    navigateTo(item.href);
  }
}

export function initFinder(): void {
  const dialog = queryOne<HTMLDialogElement>('#finder');
  const input = queryOne<HTMLInputElement>('#finder-q');
  const list = queryOne<HTMLUListElement>('#finder-list');
  const btnFind = queryOne<HTMLButtonElement>('#btn-find');
  const scrim = queryOne<HTMLElement>('.scrim');

  if (!dialog || !input || !list) return;

  btnFind?.addEventListener('click', () => {
    openFinder();
  });

  input.addEventListener('input', () => {
    activeSelectedIndex = 0;
    renderFinderList(input.value, dialog);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const count = currentResults.length;
      if (count > 0) {
        activeSelectedIndex = (activeSelectedIndex + (e.key === 'ArrowDown' ? 1 : -1) + count) % count;
        renderFinderList(input.value, dialog);
        const activeOpt = dialog.querySelector(`#fo-${activeSelectedIndex}`);
        activeOpt?.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectFinderItem(activeSelectedIndex);
    }
  });

  list.addEventListener('click', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>('.finder__opt');
    if (opt && opt.dataset.i !== undefined) {
      selectFinderItem(Number(opt.dataset.i));
    }
  });

  list.addEventListener('pointermove', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>('.finder__opt');
    if (opt && opt.dataset.i !== undefined) {
      const idx = Number(opt.dataset.i);
      if (idx !== activeSelectedIndex) {
        activeSelectedIndex = idx;
        list.querySelectorAll('.finder__opt').forEach((el) => {
          el.setAttribute('aria-selected', String(el === opt));
        });
        input.setAttribute('aria-activedescendant', opt.id);
      }
    }
  });

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeFinder();
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeFinder();
    }
  });

  if (scrim) {
    scrim.addEventListener('click', () => {
      if (dialog.open) {
        closeFinder();
      }
    });
  }

  // Global keyboard shortcut Control+K / Meta+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog.open) {
        closeFinder();
      } else {
        openFinder();
      }
    }
  });
}
