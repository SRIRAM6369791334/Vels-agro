// Vels Agro Enterprise — Product & Category-wise Discounts Subtab (Section 17)
// Configure Machinery Price Slashes, Category Rebates & Government Agro Subsidy Linkages

import { showToast, escapeHtml } from '../../../main';
import {
  ProductCategoryDiscount,
  getStoredDiscounts,
  saveStoredDiscounts,
} from '../promotions-data';
import '../promotions.css';

let discounts: ProductCategoryDiscount[] = getStoredDiscounts();
let activeFilter: 'all' | 'products' | 'categories' | 'subsidy' = 'all';
let searchQuery = '';
let activeContainer: HTMLElement | null = null;

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function renderDiscountsSubtab(container: HTMLElement): void {
  activeContainer = container;
  container.innerHTML = `
    <div class="promo-container">
      <!-- Sub-header -->
      <div class="promo-header">
        <div class="promo-header__title-group">
          <h2>
            <span>🚜 Product & Category Discount Schemes</span>
            <span class="tag" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:12px; font-weight:700;">Section 17.2</span>
          </h2>
          <p>Configure direct MRP slashes, category-wide pre-monsoon discounts and link State/Central agricultural mechanization subsidies.</p>
        </div>
        <div class="promo-header__actions">
          <button type="button" class="btn btn--primary" id="promo-new-discount-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Discount Scheme
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="promo-kpi-grid">
        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Active Discount Rules</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #059669;">${discounts.filter((d) => d.isActive).length} Live</div>
          <div class="promo-kpi-card__meta">
            <span>Automated price deduction on catalog</span>
          </div>
        </div>

        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Linked Govt Subsidies</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #2563eb;">3 Schemes</div>
          <div class="promo-kpi-card__meta">
            <span>TN SMAM, NFSM & Krishi Yantra</span>
          </div>
        </div>

        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Highest Tractor Price Slash</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #d97706;">₹1.20 L</div>
          <div class="promo-kpi-card__meta">
            <span>On Multi-Crop Combine Harvester</span>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="promo-toolbar">
        <div class="promo-filters" id="promo-discount-filter-pills">
          <button type="button" class="promo-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
            All Schemes <span class="count">${discounts.length}</span>
          </button>
          <button type="button" class="promo-filter-pill ${activeFilter === 'products' ? 'active' : ''}" data-filter="products">
            🚜 Product-Specific <span class="count">${discounts.filter((d) => d.targetType === 'product').length}</span>
          </button>
          <button type="button" class="promo-filter-pill ${activeFilter === 'categories' ? 'active' : ''}" data-filter="categories">
            📁 Category-Wide <span class="count">${discounts.filter((d) => d.targetType === 'category').length}</span>
          </button>
          <button type="button" class="promo-filter-pill ${activeFilter === 'subsidy' ? 'active' : ''}" data-filter="subsidy">
            🏛️ Govt Subsidies <span class="count">${discounts.filter((d) => !!d.subsidyScheme).length}</span>
          </button>
        </div>
        <div class="promo-search-box">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="promo-discount-search-input" placeholder="Search Campaign, Machinery, Scheme..." value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <!-- Table Card -->
      <div class="promo-table-card">
        <div class="promo-table-wrapper" id="promo-discounts-table-container">
          ${renderTableHtml()}
        </div>
      </div>
    </div>

    <!-- Modals Container -->
    <div id="promo-discount-modals"></div>
  `;

  bindEvents(container);
}

function renderTableHtml(): string {
  let filtered = [...discounts];

  if (activeFilter === 'products') {
    filtered = filtered.filter((d) => d.targetType === 'product');
  } else if (activeFilter === 'categories') {
    filtered = filtered.filter((d) => d.targetType === 'category');
  } else if (activeFilter === 'subsidy') {
    filtered = filtered.filter((d) => !!d.subsidyScheme);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.targetName.toLowerCase().includes(q) ||
        (d.subsidyScheme && d.subsidyScheme.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    return `
      <div style="padding: 48px 24px; text-align: center; color: var(--muted);">
        <p style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">No matching discount schemes</p>
        <p style="font-size: 13px; margin: 0;">Try adjusting your search keywords.</p>
      </div>
    `;
  }

  return `
    <table class="promo-table">
      <thead>
        <tr>
          <th>Scheme Title & Badge</th>
          <th>Target Machinery / Category</th>
          <th>Discount Rebate</th>
          <th>Govt Subsidy Linkage</th>
          <th>Validity Window</th>
          <th>Active</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${filtered
          .map(
            (d) => `
          <tr data-discount-id="${d.id}">
            <td>
              <div style="font-weight: 700; color: var(--text);">${escapeHtml(d.title)}</div>
              <div style="margin-top: 4px;">
                <span class="tag" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:11px; font-weight:700;">
                  🏷️ ${escapeHtml(d.badgeText)}
                </span>
              </div>
            </td>
            <td>
              <div style="font-weight: 600;">${escapeHtml(d.targetName)}</div>
              <div>
                ${
                  d.targetType === 'product'
                    ? `<span class="tag" style="background:#e0f2fe; color:#0369a1; font-size:10px;">Specific Product</span>`
                    : `<span class="tag" style="background:#f3e8ff; color:#7e22ce; font-size:10px;">Entire Category</span>`
                }
              </div>
            </td>
            <td>
              <strong style="color: #059669; font-size: 14px; font-feature-settings: 'tnum';">
                ₹${d.flatDiscountINR.toLocaleString('en-IN')} Flat
              </strong>
              <div style="font-size: 11px; color: var(--muted);">${d.discountPct}% Net Slash</div>
            </td>
            <td>
              ${
                d.subsidyScheme
                  ? `<div style="font-size: 12px; font-weight: 600; color: #1e40af;">🏛️ ${escapeHtml(d.subsidyScheme)}</div>`
                  : `<span style="font-size: 12px; color: var(--muted);">Direct Factory Promotion</span>`
              }
            </td>
            <td>
              <div style="font-size: 12px; white-space: nowrap;">${formatTimestamp(d.validFrom)} &ndash; ${formatTimestamp(d.validUntil)}</div>
            </td>
            <td>
              <label class="promo-switch">
                <input type="checkbox" class="promo-toggle-discount-active" data-id="${d.id}" ${d.isActive ? 'checked' : ''} />
                <span class="promo-slider"></span>
              </label>
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button type="button" class="btn btn--ghost btn--sm promo-btn-edit-discount" data-id="${d.id}">
                Edit
              </button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('#promo-discount-filter-pills .promo-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter as any;
      updateView();
    });
  });

  // Search
  const searchInput = container.querySelector<HTMLInputElement>('#promo-discount-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      const tableWrapper = container.querySelector('#promo-discounts-table-container');
      if (tableWrapper) {
        tableWrapper.innerHTML = renderTableHtml();
        bindTableActions(container);
      }
    });
  }

  // Create Button
  const createBtn = container.querySelector('#promo-new-discount-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openDiscountModal();
    });
  }

  bindTableActions(container);
}

function bindTableActions(container: HTMLElement): void {
  // Toggle
  container.querySelectorAll<HTMLInputElement>('.promo-toggle-discount-active').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.id;
      const d = discounts.find((item) => item.id === id);
      if (d) {
        d.isActive = checkbox.checked;
        saveStoredDiscounts(discounts);
        showToast(`Discount rule "${d.title}" is now ${d.isActive ? 'Active' : 'Disabled'}.`);
      }
    });
  });

  // Edit
  container.querySelectorAll<HTMLButtonElement>('.promo-btn-edit-discount').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const d = discounts.find((item) => item.id === id);
      if (d) {
        openDiscountModal(d);
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderDiscountsSubtab(activeContainer);
}

function openDiscountModal(existing?: ProductCategoryDiscount): void {
  const isEdit = !!existing;
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/></svg>
        ${isEdit ? `Edit Discount — ${escapeHtml(existing.title)}` : 'Create Machinery Discount Scheme'}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <form id="promo-discount-form">
        <div class="promo-form-grid">
          <div class="promo-field full">
            <label>Campaign / Scheme Title *</label>
            <input type="text" id="df-title" value="${existing ? escapeHtml(existing.title) : ''}" placeholder="Vels Bull 55HP Festive Cashback Slash" required />
          </div>
          <div class="promo-field">
            <label>Discount Target Level *</label>
            <select id="df-target-type">
              <option value="product" ${existing?.targetType === 'product' ? 'selected' : ''}>Single Machinery Model</option>
              <option value="category" ${existing?.targetType === 'category' ? 'selected' : ''}>Entire Category / Implements</option>
            </select>
          </div>
          <div class="promo-field">
            <label>Target Machinery / Category Name *</label>
            <input type="text" id="df-target-name" value="${existing ? escapeHtml(existing.targetName) : ''}" placeholder="Vels Bull 45HP Tractor" required />
          </div>
          <div class="promo-field">
            <label>Flat Cash Discount (₹) *</label>
            <input type="number" id="df-flat" value="${existing ? existing.flatDiscountINR : ''}" placeholder="35000" required />
          </div>
          <div class="promo-field">
            <label>Estimated Percentage (%) *</label>
            <input type="number" id="df-pct" value="${existing ? existing.discountPct : ''}" placeholder="6.5" step="0.1" required />
          </div>
          <div class="promo-field full">
            <label>Storefront Badge Text (Shows on Product Card) *</label>
            <input type="text" id="df-badge" value="${existing ? escapeHtml(existing.badgeText) : ''}" placeholder="₹35,000 Off Pongal Special" required />
          </div>
          <div class="promo-field full">
            <label>Associated Govt Subsidy Yojna (Optional)</label>
            <input type="text" id="df-subsidy" value="${existing?.subsidyScheme ? escapeHtml(existing.subsidyScheme) : ''}" placeholder="Tamil Nadu SMAM Agro Subsidy Portal Link" />
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="promo-discount-form" class="btn btn--primary">
        ${isEdit ? 'Save Changes' : 'Activate Discount Rule'}
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.showModal();

  modal.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', () => {
      modal.close();
      modal.remove();
    });
  });

  const form = modal.querySelector<HTMLFormElement>('#promo-discount-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (modal.querySelector('#df-title') as HTMLInputElement).value.trim();
      const targetType = (modal.querySelector('#df-target-type') as HTMLSelectElement).value as any;
      const targetName = (modal.querySelector('#df-target-name') as HTMLInputElement).value.trim();
      const flat = parseFloat((modal.querySelector('#df-flat') as HTMLInputElement).value);
      const pct = parseFloat((modal.querySelector('#df-pct') as HTMLInputElement).value);
      const badge = (modal.querySelector('#df-badge') as HTMLInputElement).value.trim();
      const subsidy = (modal.querySelector('#df-subsidy') as HTMLInputElement).value.trim();

      if (isEdit && existing) {
        existing.title = title;
        existing.targetType = targetType;
        existing.targetName = targetName;
        existing.flatDiscountINR = flat;
        existing.discountPct = pct;
        existing.badgeText = badge;
        existing.subsidyScheme = subsidy || undefined;
        showToast(`Discount rule "${title}" updated.`);
      } else {
        const newDisc: ProductCategoryDiscount = {
          id: `disc-${Date.now()}`,
          title,
          targetType,
          targetId: `target-${Date.now()}`,
          targetName,
          flatDiscountINR: flat,
          discountPct: pct,
          badgeText: badge,
          subsidyScheme: subsidy || undefined,
          validFrom: Date.now(),
          validUntil: Date.now() + 45 * 86400000,
          isActive: true,
          minQty: 1,
        };
        discounts.unshift(newDisc);
        showToast(`Discount scheme "${title}" activated!`);
      }

      saveStoredDiscounts(discounts);
      modal.close();
      modal.remove();
      updateView();
    });
  }
}
