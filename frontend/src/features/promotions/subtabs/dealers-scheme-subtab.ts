// Vels Agro Enterprise — Dealer Special Schemes Subtab (Section 17)
// Volume Rebates, Extended Credit Windows, Freight Waivers & Dealership Incentives

import { showToast, escapeHtml } from '../../../main';
import {
  DealerSpecialScheme,
  getStoredDealerSchemes,
  saveStoredDealerSchemes,
} from '../promotions-data';
import '../promotions.css';

let schemes: DealerSpecialScheme[] = getStoredDealerSchemes();
let activeTier: 'all' | 'platinum' | 'gold' | 'silver' = 'all';
let activeContainer: HTMLElement | null = null;

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function renderDealerSchemesSubtab(container: HTMLElement): void {
  activeContainer = container;
  container.innerHTML = `
    <div class="promo-container">
      <!-- Sub-header -->
      <div class="promo-header">
        <div class="promo-header__title-group">
          <h2>
            <span>🏢 Dealer-Specific Special Schemes</span>
            <span class="tag" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:12px; font-weight:700;">Section 17.3</span>
          </h2>
          <p>Incentivize dealership wholesale stock replenishment with tiered volume rebates, 45-day credit line extensions and free trailer freight.</p>
        </div>
        <div class="promo-header__actions">
          <button type="button" class="btn btn--primary" id="promo-new-scheme-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Dealer Scheme
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="promo-kpi-grid">
        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Active Dealership Schemes</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #059669;">${schemes.filter((s) => s.status === 'active').length} Active</div>
          <div class="promo-kpi-card__meta">
            <span>Enrolled across network tiers</span>
          </div>
        </div>

        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Max Additional Margin Rebate</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #2563eb;">+4.5% Extra</div>
          <div class="promo-kpi-card__meta">
            <span>On top of baseline wholesale discount</span>
          </div>
        </div>

        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Credit Extension Privilege</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #7c3aed;">45 Days</div>
          <div class="promo-kpi-card__meta">
            <span>Extended from regular 30-day revolving line</span>
          </div>
        </div>
      </div>

      <!-- Tier Filters Toolbar -->
      <div class="promo-toolbar">
        <div class="promo-filters" id="promo-scheme-filter-pills">
          <button type="button" class="promo-filter-pill ${activeTier === 'all' ? 'active' : ''}" data-tier="all">
            All Dealership Schemes <span class="count">${schemes.length}</span>
          </button>
          <button type="button" class="promo-filter-pill ${activeTier === 'platinum' ? 'active' : ''}" data-tier="platinum">
            ⭐ Platinum Tier (${schemes.filter((s) => s.tier === 'platinum').length})
          </button>
          <button type="button" class="promo-filter-pill ${activeTier === 'gold' ? 'active' : ''}" data-tier="gold">
            🥇 Gold Tier (${schemes.filter((s) => s.tier === 'gold').length})
          </button>
          <button type="button" class="promo-filter-pill ${activeTier === 'silver' ? 'active' : ''}" data-tier="silver">
            🥈 Silver Tier (${schemes.filter((s) => s.tier === 'silver').length})
          </button>
        </div>
      </div>

      <!-- Scheme Cards Grid -->
      <div class="promo-schemes-grid" id="promo-schemes-grid">
        ${renderSchemesHtml()}
      </div>
    </div>

    <!-- Modals Container -->
    <div id="promo-scheme-modals"></div>
  `;

  bindEvents(container);
}

function renderSchemesHtml(): string {
  let filtered = [...schemes];
  if (activeTier !== 'all') {
    filtered = filtered.filter((s) => s.tier === activeTier);
  }

  return filtered
    .map(
      (s) => `
    <div class="promo-scheme-card" data-scheme-id="${s.id}">
      <div class="promo-scheme-card__header">
        <span class="promo-scheme-card__tier tier--${s.tier}">
          ${s.tier.toUpperCase()} TIER ONLY
        </span>
        ${
          s.status === 'active'
            ? `<span class="tag tag--farmer" style="font-size: 10px; font-weight: 700;">● Active</span>`
            : `<span class="tag" style="background:#fee2e2; color:#b91c1c; font-size: 10px; font-weight: 700;">● Expired</span>`
        }
      </div>

      <div style="font-size: 16px; font-weight: 700; color: var(--text);">
        ${escapeHtml(s.title)}
      </div>

      <!-- Perks Strip -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
        <div>
          <span style="color: var(--muted); display: block;">Min Volume Req:</span>
          <strong>${s.minUnits}+ Units Chassis/Implements</strong>
        </div>
        <div>
          <span style="color: var(--muted); display: block;">Extra Margin Rebate:</span>
          <strong style="color: #059669;">+${s.additionalDiscountPct}% Additional</strong>
        </div>
        <div>
          <span style="color: var(--muted); display: block;">Revolving Credit:</span>
          <strong>${30 + s.creditPeriodExtensionDays} Days Line</strong>
        </div>
        <div>
          <span style="color: var(--muted); display: block;">Heavy Trailer Freight:</span>
          <strong>${s.freeFreightIncluded ? '✓ 100% Free' : 'Standard'}</strong>
        </div>
      </div>

      <p style="font-size: 12px; color: var(--muted); margin: 0; line-height: 1.4;">
        ${escapeHtml(s.termsNote)}
      </p>

      <div style="border-top: 1px solid var(--border); padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--muted);">
        <span>Eligible: <strong>${s.eligibleDealersCount} Authorized Dealers</strong></span>
        <span>Valid until: <strong>${formatTimestamp(s.validUntil)}</strong></span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;">
        <button type="button" class="btn btn--ghost btn--sm promo-btn-edit-scheme" data-id="${s.id}">
          Edit Scheme
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('#promo-scheme-filter-pills .promo-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTier = btn.dataset.tier as any;
      updateView();
    });
  });

  // Create Button
  const createBtn = container.querySelector('#promo-new-scheme-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openSchemeModal();
    });
  }

  // Edit Button
  container.querySelectorAll<HTMLButtonElement>('.promo-btn-edit-scheme').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const s = schemes.find((item) => item.id === id);
      if (s) {
        openSchemeModal(s);
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderDealerSchemesSubtab(activeContainer);
}

function openSchemeModal(existing?: DealerSpecialScheme): void {
  const isEdit = !!existing;
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l8-4v18M13 10h4v11"/></svg>
        ${isEdit ? `Edit Scheme — ${escapeHtml(existing.title)}` : 'Create Dealer Incentive Scheme'}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <form id="promo-scheme-form">
        <div class="promo-form-grid">
          <div class="promo-field full">
            <label>Scheme Title *</label>
            <input type="text" id="sf-title" value="${existing ? escapeHtml(existing.title) : ''}" placeholder="Platinum Dealer Q3 Festive Bulk Rebate" required />
          </div>
          <div class="promo-field">
            <label>Target Dealership Tier *</label>
            <select id="sf-tier">
              <option value="platinum" ${existing?.tier === 'platinum' ? 'selected' : ''}>Platinum Dealers Only</option>
              <option value="gold" ${existing?.tier === 'gold' ? 'selected' : ''}>Gold Tier Dealers</option>
              <option value="silver" ${existing?.tier === 'silver' ? 'selected' : ''}>Silver Tier Dealers</option>
              <option value="all" ${existing?.tier === 'all' ? 'selected' : ''}>All Authorized Dealers</option>
            </select>
          </div>
          <div class="promo-field">
            <label>Minimum Order Volume (Units) *</label>
            <input type="number" id="sf-units" value="${existing ? existing.minUnits : '5'}" required />
          </div>
          <div class="promo-field">
            <label>Additional Margin Rebate (%) *</label>
            <input type="number" id="sf-rebate" value="${existing ? existing.additionalDiscountPct : '4.0'}" step="0.1" required />
          </div>
          <div class="promo-field">
            <label>Credit Extension Days *</label>
            <input type="number" id="sf-credit" value="${existing ? existing.creditPeriodExtensionDays : '15'}" placeholder="15" required />
          </div>
          <div class="promo-field">
            <label>Free Heavy Freight Incurred by Factory?</label>
            <select id="sf-freight">
              <option value="yes" ${existing?.freeFreightIncluded ? 'selected' : ''}>Yes, Free Trailer Delivery (VRL/Fleet)</option>
              <option value="no" ${existing && !existing.freeFreightIncluded ? 'selected' : ''}>No, Standard Transporter Billing</option>
            </select>
          </div>
          <div class="promo-field">
            <label>Eligible Network Dealers</label>
            <input type="number" id="sf-count" value="${existing ? existing.eligibleDealersCount : '6'}" required />
          </div>
          <div class="promo-field full">
            <label>Commercial Terms & Notes</label>
            <textarea id="sf-terms" rows="2" placeholder="Rebate credit note auto-generated upon vehicle loading and PDI signature signoff">${existing ? escapeHtml(existing.termsNote) : ''}</textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="promo-scheme-form" class="btn btn--primary">
        ${isEdit ? 'Save Changes' : 'Publish Scheme'}
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

  const form = modal.querySelector<HTMLFormElement>('#promo-scheme-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (modal.querySelector('#sf-title') as HTMLInputElement).value.trim();
      const tier = (modal.querySelector('#sf-tier') as HTMLSelectElement).value as any;
      const units = parseInt((modal.querySelector('#sf-units') as HTMLInputElement).value, 10);
      const rebate = parseFloat((modal.querySelector('#sf-rebate') as HTMLInputElement).value);
      const credit = parseInt((modal.querySelector('#sf-credit') as HTMLInputElement).value, 10);
      const freight = (modal.querySelector('#sf-freight') as HTMLSelectElement).value === 'yes';
      const count = parseInt((modal.querySelector('#sf-count') as HTMLInputElement).value, 10);
      const terms = (modal.querySelector('#sf-terms') as HTMLTextAreaElement).value.trim();

      if (isEdit && existing) {
        existing.title = title;
        existing.tier = tier;
        existing.minUnits = units;
        existing.additionalDiscountPct = rebate;
        existing.creditPeriodExtensionDays = credit;
        existing.freeFreightIncluded = freight;
        existing.eligibleDealersCount = count;
        existing.termsNote = terms;
        showToast(`Dealer Scheme "${title}" updated.`);
      } else {
        const newScheme: DealerSpecialScheme = {
          id: `ds-${Date.now()}`,
          title,
          tier,
          minUnits: units,
          additionalDiscountPct: rebate,
          creditPeriodExtensionDays: credit,
          freeFreightIncluded: freight,
          eligibleDealersCount: count,
          validUntil: Date.now() + 60 * 86400000,
          status: 'active',
          termsNote: terms,
        };
        schemes.unshift(newScheme);
        showToast(`Dealer incentive scheme "${title}" activated!`);
      }

      saveStoredDealerSchemes(schemes);
      modal.close();
      modal.remove();
      updateView();
    });
  }
}
