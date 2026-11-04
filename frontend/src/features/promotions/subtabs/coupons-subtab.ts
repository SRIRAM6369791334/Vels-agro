// Vels Agro Enterprise — Coupon Codes Management Subtab (Section 17)
// Create, edit, toggle and audit coupon codes with usage limits

import { showToast, escapeHtml } from '../../../main';
import {
  CouponCode,
  getStoredCoupons,
  saveStoredCoupons,
} from '../promotions-data';
import '../promotions.css';

let coupons: CouponCode[] = getStoredCoupons();
let activeFilter: 'all' | 'active' | 'inactive' | 'farmers' | 'dealers' = 'all';
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

function calculateKPIs() {
  const activeCount = coupons.filter((c) => c.isActive && c.endDate > Date.now()).length;
  const totalRedeemed = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const totalSavingsEstimated = coupons.reduce(
    (sum, c) => sum + c.usedCount * (c.discountType === 'flat' ? c.discountValue : 8000),
    0
  );

  return {
    activeCount,
    totalRedeemed,
    totalSavingsEstimated: (totalSavingsEstimated / 100000).toFixed(2),
    totalCoupons: coupons.length,
  };
}

export function renderCouponsSubtab(container: HTMLElement): void {
  activeContainer = container;
  container.innerHTML = `
    <div class="promo-container">
      <!-- Sub-header -->
      <div class="promo-header">
        <div class="promo-header__title-group">
          <h2>
            <span>🎟️ Coupon Codes Management</span>
            <span class="tag" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:12px; font-weight:700;">Section 17.1</span>
          </h2>
          <p>Create agricultural promotional vouchers, set minimum booking values, configure farmer/dealer targeting and track redemption quotas.</p>
        </div>
        <div class="promo-header__actions">
          <button type="button" class="btn btn--primary" id="promo-new-coupon-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Coupon Code
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="promo-kpi-grid">
        ${renderKPIsHtml()}
      </div>

      <!-- Toolbar -->
      <div class="promo-toolbar">
        <div class="promo-filters" id="promo-coupon-filter-pills">
          ${renderFilterPillsHtml()}
        </div>
        <div class="promo-search-box">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="promo-coupon-search-input" placeholder="Search Coupon Code, Description..." value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <!-- Coupons Table -->
      <div class="promo-table-card">
        <div class="promo-table-wrapper" id="promo-coupons-table-container">
          ${renderTableHtml()}
        </div>
      </div>
    </div>

    <!-- Modals Container -->
    <div id="promo-coupon-modals"></div>
  `;

  bindEvents(container);
}

function renderKPIsHtml(): string {
  const kpi = calculateKPIs();
  return `
    <div class="promo-kpi-card">
      <div class="promo-kpi-card__label">
        <span>Active Promotional Coupons</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
      </div>
      <div class="promo-kpi-card__value" style="color: #059669;">${kpi.activeCount} Live</div>
      <div class="promo-kpi-card__meta">
        <span>${kpi.totalCoupons} configured in catalog</span>
      </div>
    </div>

    <div class="promo-kpi-card">
      <div class="promo-kpi-card__label">
        <span>Total Redemptions</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div class="promo-kpi-card__value" style="color: #2563eb;">${kpi.totalRedeemed} Claims</div>
      <div class="promo-kpi-card__meta">
        <span class="ps-trend--up">Across online & dealership bookings</span>
      </div>
    </div>

    <div class="promo-kpi-card">
      <div class="promo-kpi-card__label">
        <span>Total Farmer / Dealer Savings</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div class="promo-kpi-card__value">₹${kpi.totalSavingsEstimated} Lakhs</div>
      <div class="promo-kpi-card__meta">
        <span>Estimated incentive subsidy impact</span>
      </div>
    </div>
  `;
}

function renderFilterPillsHtml(): string {
  const counts = {
    all: coupons.length,
    active: coupons.filter((c) => c.isActive && c.endDate > Date.now()).length,
    inactive: coupons.filter((c) => !c.isActive || c.endDate <= Date.now()).length,
    farmers: coupons.filter((c) => c.applicableTo === 'farmers_only').length,
    dealers: coupons.filter((c) => c.applicableTo === 'dealers_only').length,
  };

  return `
    <button type="button" class="promo-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
      All Vouchers <span class="count">${counts.all}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'active' ? 'active' : ''}" data-filter="active">
      ✓ Live & Active <span class="count">${counts.active}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'inactive' ? 'active' : ''}" data-filter="inactive">
      ⏸ Inactive / Expired <span class="count">${counts.inactive}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'farmers' ? 'active' : ''}" data-filter="farmers">
      👨‍🌾 Farmer Direct <span class="count">${counts.farmers}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'dealers' ? 'active' : ''}" data-filter="dealers">
      🏢 Dealer Bulk <span class="count">${counts.dealers}</span>
    </button>
  `;
}

function renderTableHtml(): string {
  let filtered = [...coupons];

  if (activeFilter === 'active') {
    filtered = filtered.filter((c) => c.isActive && c.endDate > Date.now());
  } else if (activeFilter === 'inactive') {
    filtered = filtered.filter((c) => !c.isActive || c.endDate <= Date.now());
  } else if (activeFilter === 'farmers') {
    filtered = filtered.filter((c) => c.applicableTo === 'farmers_only');
  } else if (activeFilter === 'dealers') {
    filtered = filtered.filter((c) => c.applicableTo === 'dealers_only');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    return `
      <div style="padding: 48px 24px; text-align: center; color: var(--muted);">
        <p style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">No matching coupon codes</p>
        <p style="font-size: 13px; margin: 0;">Try adjusting your filter or search query.</p>
      </div>
    `;
  }

  return `
    <table class="promo-table">
      <thead>
        <tr>
          <th>Coupon Code</th>
          <th>Discount Value</th>
          <th>Eligibility / Target</th>
          <th>Min Order Value</th>
          <th>Redemption Usage</th>
          <th>Validity Period</th>
          <th>Active Status</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${filtered
          .map((c) => {
            const isExpired = c.endDate < Date.now();
            const pctUsed = Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100));
            return `
            <tr data-coupon-id="${c.id}">
              <td>
                <span class="promo-coupon-badge promo-btn-copy-code" data-code="${escapeHtml(c.code)}" title="Click to copy code">
                  ${escapeHtml(c.code)}
                  <svg class="ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </span>
                <div style="font-size: 12px; font-weight: 600; margin-top: 4px;">${escapeHtml(c.title)}</div>
                <div style="font-size: 11px; color: var(--muted); max-width: 280px;">${escapeHtml(c.description)}</div>
              </td>
              <td>
                <strong style="font-size: 15px; color: #059669; font-feature-settings: 'tnum';">
                  ${c.discountType === 'flat' ? `₹${c.discountValue.toLocaleString('en-IN')}` : `${c.discountValue}% Off`}
                </strong>
                ${c.maxDiscount ? `<div style="font-size: 11px; color: var(--muted);">Cap: ₹${c.maxDiscount.toLocaleString('en-IN')}</div>` : ''}
              </td>
              <td>
                ${renderApplicableBadge(c.applicableTo, c.categoryTarget)}
              </td>
              <td>
                <strong style="font-feature-settings: 'tnum';">₹${c.minOrderValue.toLocaleString('en-IN')}</strong>
              </td>
              <td style="min-width: 130px;">
                <div style="font-size: 12px; font-weight: 600; display: flex; justify-content: space-between;">
                  <span>${c.usedCount} / ${c.usageLimit}</span>
                  <span style="color: var(--muted);">${pctUsed}%</span>
                </div>
                <div class="promo-progress">
                  <div class="promo-progress__bar" style="width: ${pctUsed}%; ${pctUsed > 80 ? 'background: #f59e0b;' : ''}"></div>
                </div>
              </td>
              <td>
                <div style="font-size: 12px; white-space: nowrap;">${formatTimestamp(c.startDate)} &ndash; ${formatTimestamp(c.endDate)}</div>
                ${
                  isExpired
                    ? `<span style="font-size: 10px; color: #dc2626; font-weight: 700;">● EXPIRED</span>`
                    : `<span style="font-size: 10px; color: #059669; font-weight: 700;">● ACTIVE</span>`
                }
              </td>
              <td>
                <label class="promo-switch">
                  <input type="checkbox" class="promo-toggle-active" data-id="${c.id}" ${c.isActive ? 'checked' : ''} />
                  <span class="promo-slider"></span>
                </label>
              </td>
              <td style="text-align: right; white-space: nowrap;">
                <button type="button" class="btn btn--ghost btn--sm promo-btn-edit-coupon" data-id="${c.id}">
                  Edit
                </button>
              </td>
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

function renderApplicableBadge(target: CouponCode['applicableTo'], cat?: string): string {
  switch (target) {
    case 'farmers_only':
      return `<span class="tag tag--farmer" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:10px; font-weight:700;">👨‍🌾 Farmers Only</span>`;
    case 'dealers_only':
      return `<span class="tag tag--dealer" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:10px; font-weight:700;">🏢 Dealers Only</span>`;
    case 'specific_category':
      return `<span class="tag" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:10px; font-weight:700;">🏷️ ${escapeHtml(cat || 'Category')}</span>`;
    default:
      return `<span class="tag" style="background:#f3f4f6; color:#374151; border:1px solid #e5e7eb; font-size:10px; font-weight:700;">Universal</span>`;
  }
}

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('#promo-coupon-filter-pills .promo-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter as any;
      updateView();
    });
  });

  // Search
  const searchInput = container.querySelector<HTMLInputElement>('#promo-coupon-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      const tableWrapper = container.querySelector('#promo-coupons-table-container');
      if (tableWrapper) {
        tableWrapper.innerHTML = renderTableHtml();
        bindTableActions(container);
      }
    });
  }

  // Copy code pill
  container.querySelectorAll<HTMLElement>('.promo-btn-copy-code').forEach((el) => {
    el.addEventListener('click', () => {
      const code = el.dataset.code;
      if (code) {
        navigator.clipboard.writeText(code);
        showToast(`Coupon code ${code} copied to clipboard!`);
      }
    });
  });

  // New Coupon Button
  const newBtn = container.querySelector('#promo-new-coupon-btn');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      openCouponModal();
    });
  }

  bindTableActions(container);
}

function bindTableActions(container: HTMLElement): void {
  // Toggle Active
  container.querySelectorAll<HTMLInputElement>('.promo-toggle-active').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.id;
      const c = coupons.find((item) => item.id === id);
      if (c) {
        c.isActive = checkbox.checked;
        saveStoredCoupons(coupons);
        showToast(`Coupon ${c.code} is now ${c.isActive ? 'Active' : 'Disabled'}.`);
      }
    });
  });

  // Edit Button
  container.querySelectorAll<HTMLButtonElement>('.promo-btn-edit-coupon').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const c = coupons.find((item) => item.id === id);
      if (c) {
        openCouponModal(c);
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderCouponsSubtab(activeContainer);
}

function openCouponModal(existing?: CouponCode): void {
  const isEdit = !!existing;
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        ${isEdit ? `Edit Coupon — ${escapeHtml(existing.code)}` : 'Create Agricultural Coupon Code'}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <form id="promo-coupon-form">
        <div class="promo-form-grid">
          <div class="promo-field">
            <label>Coupon Code * (e.g. KISAN5000)</label>
            <input type="text" id="cf-code" value="${existing ? escapeHtml(existing.code) : ''}" placeholder="PONGAL2026" required style="font-family: var(--mono); text-transform: uppercase;" />
          </div>
          <div class="promo-field">
            <label>Discount Type *</label>
            <select id="cf-type">
              <option value="flat" ${existing?.discountType === 'flat' ? 'selected' : ''}>Flat Cash Discount (₹)</option>
              <option value="percentage" ${existing?.discountType === 'percentage' ? 'selected' : ''}>Percentage Discount (%)</option>
            </select>
          </div>
          <div class="promo-field">
            <label>Discount Value *</label>
            <input type="number" id="cf-val" value="${existing ? existing.discountValue : ''}" placeholder="5000" required />
          </div>
          <div class="promo-field">
            <label>Min Order Value (₹) *</label>
            <input type="number" id="cf-min" value="${existing ? existing.minOrderValue : '50000'}" required />
          </div>
          <div class="promo-field">
            <label>Audience / Target *</label>
            <select id="cf-target">
              <option value="all" ${existing?.applicableTo === 'all' ? 'selected' : ''}>Universal (All Customers)</option>
              <option value="farmers_only" ${existing?.applicableTo === 'farmers_only' ? 'selected' : ''}>Farmer Direct Only</option>
              <option value="dealers_only" ${existing?.applicableTo === 'dealers_only' ? 'selected' : ''}>Authorized Dealers Only</option>
            </select>
          </div>
          <div class="promo-field">
            <label>Total Usage Limit *</label>
            <input type="number" id="cf-limit" value="${existing ? existing.usageLimit : '100'}" required />
          </div>
          <div class="promo-field full">
            <label>Campaign Title *</label>
            <input type="text" id="cf-title" value="${existing ? escapeHtml(existing.title) : ''}" placeholder="Harvest Festival Special Subsidy Voucher" required />
          </div>
          <div class="promo-field full">
            <label>Terms & Description</label>
            <textarea id="cf-desc" rows="2" placeholder="Instant booking rebate applied during tractor or rotavator checkout">${existing ? escapeHtml(existing.description) : ''}</textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="promo-coupon-form" class="btn btn--primary">
        ${isEdit ? 'Save Changes' : 'Publish Coupon Code'}
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

  const form = modal.querySelector<HTMLFormElement>('#promo-coupon-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (modal.querySelector('#cf-code') as HTMLInputElement).value.toUpperCase().trim();
      const type = (modal.querySelector('#cf-type') as HTMLSelectElement).value as any;
      const val = parseFloat((modal.querySelector('#cf-val') as HTMLInputElement).value);
      const min = parseFloat((modal.querySelector('#cf-min') as HTMLInputElement).value);
      const target = (modal.querySelector('#cf-target') as HTMLSelectElement).value as any;
      const limit = parseInt((modal.querySelector('#cf-limit') as HTMLInputElement).value, 10);
      const title = (modal.querySelector('#cf-title') as HTMLInputElement).value.trim();
      const desc = (modal.querySelector('#cf-desc') as HTMLTextAreaElement).value.trim();

      if (isEdit && existing) {
        existing.code = code;
        existing.discountType = type;
        existing.discountValue = val;
        existing.minOrderValue = min;
        existing.applicableTo = target;
        existing.usageLimit = limit;
        existing.title = title;
        existing.description = desc;
        showToast(`Coupon ${code} updated successfully.`);
      } else {
        const newCoupon: CouponCode = {
          id: `cpn-${Date.now()}`,
          code,
          title,
          description: desc,
          discountType: type,
          discountValue: val,
          minOrderValue: min,
          applicableTo: target,
          startDate: Date.now(),
          endDate: Date.now() + 60 * 86400000,
          usageLimit: limit,
          usedCount: 0,
          isActive: true,
        };
        coupons.unshift(newCoupon);
        showToast(`Coupon ${code} created and live for customer checkout!`);
      }

      saveStoredCoupons(coupons);
      modal.close();
      modal.remove();
      updateView();
    });
  }
}
