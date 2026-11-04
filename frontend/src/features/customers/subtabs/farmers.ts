// Vels Agro Enterprise — Farmer Customer Management Subtab (Section 11)
// Landholdings, Crops, Machinery Portfolios, Purchase History, Accounts & KYC Compliance

import { showToast, escapeHtml } from '../../../main';
import {
  FarmerCustomer,
  getStoredFarmers,
  saveStoredFarmers,
} from '../farmers-data';

let farmers: FarmerCustomer[] = getStoredFarmers();
let activeFilter: 'all' | 'active' | 'kyc' | 'large' | 'small' = 'all';
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
  const totalFarmers = farmers.length;
  const activeCount = farmers.filter((f) => f.isActive).length;
  const kycCount = farmers.filter((f) => f.kycVerified).length;
  const totalAcres = farmers.reduce((sum, f) => sum + f.landHoldingAcres, 0);
  const totalRevenue = farmers.reduce((sum, f) => sum + f.totalSpent, 0);

  return {
    totalFarmers,
    activeCount,
    kycRate: Math.round((kycCount / totalFarmers) * 100),
    totalAcres,
    totalRevenueLakhs: (totalRevenue / 100000).toFixed(2),
  };
}

export function renderFarmersSubtab(container: HTMLElement): void {
  activeContainer = container;
  container.innerHTML = `
    <div class="promo-container">
      <!-- Sub-header -->
      <div class="promo-header">
        <div class="promo-header__title-group">
          <h2>
            <span>👨‍🌾 Farmer Direct Customer Database</span>
            <span class="tag" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:12px; font-weight:700;">Section 11</span>
          </h2>
          <p>Manage verified farmer profiles, agricultural landholdings, crop cycles, tractor purchase histories and revenue tahsildar KYC compliance.</p>
        </div>
        <div class="promo-header__actions">
          <button type="button" class="btn btn--ghost" id="farmer-export-csv-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Farmers CSV
          </button>
          <button type="button" class="btn btn--primary" id="farmer-register-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Register New Farmer
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="promo-kpi-grid">
        ${renderKPIsHtml()}
      </div>

      <!-- Toolbar -->
      <div class="promo-toolbar">
        <div class="promo-filters" id="farmer-filter-pills">
          ${renderFilterPillsHtml()}
        </div>
        <div class="promo-search-box">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="farmer-search-input" placeholder="Search Farmer, District, Crops..." value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <!-- Farmers Table Card -->
      <div class="promo-table-card">
        <div class="promo-table-wrapper" id="farmer-table-container">
          ${renderTableHtml()}
        </div>
      </div>
    </div>

    <!-- Modals Container -->
    <div id="farmer-modals"></div>
  `;

  bindEvents(container);
}

function renderKPIsHtml(): string {
  const kpi = calculateKPIs();
  return `
    <div class="promo-kpi-card">
      <div class="promo-kpi-card__label">
        <span>Verified Farmer Base</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/></svg>
      </div>
      <div class="promo-kpi-card__value" style="color: #059669;">${kpi.totalFarmers} Registered</div>
      <div class="promo-kpi-card__meta">
        <span>${kpi.activeCount} active buying accounts</span>
      </div>
    </div>

    <div class="promo-kpi-card">
      <div class="promo-kpi-card__label">
        <span>Mechanized Land Coverage</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l8-4v18"/></svg>
      </div>
      <div class="promo-kpi-card__value" style="color: #2563eb;">${kpi.totalAcres} Acres</div>
      <div class="promo-kpi-card__meta">
        <span>Sugarcane, Paddy, Cotton & Plantations</span>
      </div>
    </div>

    <div class="promo-kpi-card">
      <div class="promo-kpi-card__label">
        <span>Cumulative Machinery Spend</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div class="promo-kpi-card__value" style="color: #7c3aed;">₹${kpi.totalRevenueLakhs} L</div>
      <div class="promo-kpi-card__meta">
        <span>Lifetime direct farm invoice value</span>
      </div>
    </div>

    <div class="promo-kpi-card">
      <div class="promo-kpi-card__label">
        <span>Revenue KYC Compliance</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div class="promo-kpi-card__value">${kpi.kycRate}%</div>
      <div class="promo-kpi-card__meta">
        <span>Pattadhar Passbook & Aadhaar linked</span>
      </div>
    </div>
  `;
}

function renderFilterPillsHtml(): string {
  const counts = {
    all: farmers.length,
    active: farmers.filter((f) => f.isActive).length,
    kyc: farmers.filter((f) => f.kycVerified).length,
    large: farmers.filter((f) => f.landHoldingAcres >= 25).length,
    small: farmers.filter((f) => f.landHoldingAcres < 25).length,
  };

  return `
    <button type="button" class="promo-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
      All Farmers <span class="count">${counts.all}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'active' ? 'active' : ''}" data-filter="active">
      ✓ Active Accounts <span class="count">${counts.active}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'kyc' ? 'active' : ''}" data-filter="kyc">
      🛡️ KYC Verified <span class="count">${counts.kyc}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'large' ? 'active' : ''}" data-filter="large">
      🚜 Large Holdings (25+ Ac) <span class="count">${counts.large}</span>
    </button>
    <button type="button" class="promo-filter-pill ${activeFilter === 'small' ? 'active' : ''}" data-filter="small">
      🌱 Small / Medium (<25 Ac) <span class="count">${counts.small}</span>
    </button>
  `;
}

function renderTableHtml(): string {
  let filtered = [...farmers];

  if (activeFilter === 'active') {
    filtered = filtered.filter((f) => f.isActive);
  } else if (activeFilter === 'kyc') {
    filtered = filtered.filter((f) => f.kycVerified);
  } else if (activeFilter === 'large') {
    filtered = filtered.filter((f) => f.landHoldingAcres >= 25);
  } else if (activeFilter === 'small') {
    filtered = filtered.filter((f) => f.landHoldingAcres < 25);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q) ||
        f.primaryCrops.some((c) => c.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    return `
      <div style="padding: 48px 24px; text-align: center; color: var(--muted);">
        <p style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">No matching farmer records</p>
        <p style="font-size: 13px; margin: 0;">Try adjusting your search keywords.</p>
      </div>
    `;
  }

  return `
    <table class="promo-table">
      <thead>
        <tr>
          <th>Farmer Profile & Location</th>
          <th>Landholding & Crops</th>
          <th>Machinery Owned</th>
          <th>Lifetime Spend</th>
          <th>KYC / Patta Record</th>
          <th>Account Active</th>
          <th style="text-align: right;">Farmer Action</th>
        </tr>
      </thead>
      <tbody>
        ${filtered
          .map((f) => {
            const initials = f.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('');
            return `
            <tr data-farmer-id="${f.id}">
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 34px; height: 34px; border-radius: 50%; background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #047857; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${escapeHtml(initials)}
                  </div>
                  <div>
                    <strong style="color: var(--text); font-size: 13px;">${escapeHtml(f.name)}</strong>
                    <div style="font-size: 11px; color: var(--muted);">${escapeHtml(f.village)}, ${escapeHtml(f.district)}</div>
                    <div style="font-size: 11px; color: var(--muted);"><a href="tel:${escapeHtml(f.phone)}" style="color: var(--primary); font-weight: 600;">${escapeHtml(f.phone)}</a></div>
                  </div>
                </div>
              </td>
              <td>
                <span class="tag" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:800; font-size:11px;">
                  🌾 ${f.landHoldingAcres} Acres
                </span>
                <div style="font-size: 11px; color: var(--muted); margin-top: 3px; max-width: 200px;">
                  ${f.primaryCrops.join(', ')}
                </div>
              </td>
              <td>
                ${f.machineryOwned
                  .map(
                    (m) =>
                      `<div style="font-size: 11px; margin-bottom: 2px;"><span class="tag" style="background:var(--surface-2); font-size:10px;">🚜 ${escapeHtml(m)}</span></div>`
                  )
                  .join('')}
              </td>
              <td>
                <strong style="font-size: 14px; font-feature-settings: 'tnum';">₹${f.totalSpent.toLocaleString('en-IN')}</strong>
                <div style="font-size: 11px; color: var(--muted);"><a href="#/orders/all" style="color: var(--primary);">${f.ordersCount} tractor orders</a></div>
              </td>
              <td>
                ${
                  f.kycVerified
                    ? `<span class="ps-recon-pill ps-recon--yes" style="font-size: 10px;">✓ KYC Verified</span>`
                    : `<span class="ps-recon-pill ps-recon--no" style="font-size: 10px;">⏳ Pending Tahsildar</span>`
                }
                <div style="font-size: 11px; font-family: var(--mono); color: var(--muted); margin-top: 2px;">
                  ${escapeHtml(f.pattadharPassbookNo || 'No Passbook')}
                </div>
              </td>
              <td>
                <label class="promo-switch">
                  <input type="checkbox" class="farmer-toggle-active" data-id="${f.id}" ${f.isActive ? 'checked' : ''} />
                  <span class="promo-slider"></span>
                </label>
              </td>
              <td style="text-align: right; white-space: nowrap;">
                <button type="button" class="btn btn--ghost btn--sm farmer-btn-view-profile" data-id="${f.id}" title="View Full Farmer Dossier">
                  Profile
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

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('#farmer-filter-pills .promo-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter as any;
      updateView();
    });
  });

  // Search input
  const searchInput = container.querySelector<HTMLInputElement>('#farmer-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      const tableWrapper = container.querySelector('#farmer-table-container');
      if (tableWrapper) {
        tableWrapper.innerHTML = renderTableHtml();
        bindTableActions(container);
      }
    });
  }

  // Export CSV
  const exportBtn = container.querySelector('#farmer-export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportFarmersCsv();
    });
  }

  // Register New Farmer Button
  const registerBtn = container.querySelector('#farmer-register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      openRegisterFarmerModal();
    });
  }

  bindTableActions(container);
}

function bindTableActions(container: HTMLElement): void {
  // Toggle Active
  container.querySelectorAll<HTMLInputElement>('.farmer-toggle-active').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.id;
      const f = farmers.find((item) => item.id === id);
      if (f) {
        f.isActive = checkbox.checked;
        saveStoredFarmers(farmers);
        showToast(`Farmer account for ${f.name} is now ${f.isActive ? 'Active' : 'Deactivated'}.`);
      }
    });
  });

  // View Profile
  container.querySelectorAll<HTMLButtonElement>('.farmer-btn-view-profile').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const f = farmers.find((item) => item.id === id);
      if (f) {
        openFarmerProfileModal(f);
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderFarmersSubtab(activeContainer);
}

function exportFarmersCsv(): void {
  const headers = ['Farmer Name', 'Phone', 'Village', 'District', 'State', 'Landholding (Acres)', 'Soil Type', 'Primary Crops', 'Machinery Owned', 'Total Spent (INR)', 'Orders Count', 'KYC Verified', 'Patta Passbook No'];
  const rows = farmers.map((f) => [
    `"${f.name}"`,
    f.phone,
    `"${f.village}"`,
    f.district,
    f.state,
    f.landHoldingAcres,
    `"${f.soilType}"`,
    `"${f.primaryCrops.join(', ')}"`,
    `"${f.machineryOwned.join(', ')}"`,
    f.totalSpent,
    f.ordersCount,
    f.kycVerified ? 'YES' : 'NO',
    f.pattadharPassbookNo || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Vels_Agro_Farmers_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Farmers Directory exported to CSV.');
}

function openFarmerProfileModal(f: FarmerCustomer): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/></svg>
        Farmer Dossier — ${escapeHtml(f.name)}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <!-- Farmer Quick Card -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #ecfdf5; border: 2px solid #a7f3d0; color: #047857; font-weight: 800; font-size: 15px; display: flex; align-items: center; justify-content: center;">
            ${escapeHtml(f.name.slice(0, 2).toUpperCase())}
          </div>
          <div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--text);">${escapeHtml(f.name)}</h4>
            <div style="font-size: 12px; color: var(--muted);">${escapeHtml(f.village)}, ${escapeHtml(f.district)}, ${escapeHtml(f.state)}</div>
            <div style="font-size: 12px; margin-top: 2px;"><a href="tel:${escapeHtml(f.phone)}" style="color: var(--primary); font-weight: 700;">📞 ${escapeHtml(f.phone)}</a></div>
          </div>
        </div>
        <div style="text-align: right;">
          ${
            f.kycVerified
              ? `<span class="tag tag--farmer" style="font-size: 11px; font-weight: 700;">🛡️ Verified KYC</span>`
              : `<span class="tag" style="background:#fef3c7; color:#b45309; font-size: 11px;">⏳ Pending KYC</span>`
          }
          <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Registered: ${formatTimestamp(f.registeredDate)}</div>
        </div>
      </div>

      <!-- Land & Crops Specs -->
      <div class="promo-form-grid" style="font-size: 13px;">
        <div class="promo-field">
          <label>Total Agricultural Holding</label>
          <strong style="color: var(--primary); font-size: 15px;">🌾 ${f.landHoldingAcres} Acres</strong>
        </div>
        <div class="promo-field">
          <label>Soil Profile</label>
          <span>${escapeHtml(f.soilType)}</span>
        </div>
        <div class="promo-field full">
          <label>Crops Cultivated</label>
          <div>
            ${f.primaryCrops
              .map(
                (c) => `<span class="tag" style="background:#ecfdf5; color:#047857; margin-right: 4px; font-weight: 700;">${escapeHtml(c)}</span>`
              )
              .join('')}
          </div>
        </div>
        <div class="promo-field">
          <label>Pattadhar Passbook No</label>
          <code style="font-family: var(--mono);">${escapeHtml(f.pattadharPassbookNo || 'Not Provided')}</code>
        </div>
        <div class="promo-field">
          <label>Kisan Credit Card (KCC)</label>
          <code style="font-family: var(--mono);">${escapeHtml(f.kisanCreditCardNo || 'Not Linked')}</code>
        </div>
        <div class="promo-field full">
          <label>Machinery Assets Owned on Farm</label>
          <div>
            ${f.machineryOwned
              .map(
                (m) => `<span class="tag" style="background:var(--surface-2); margin-right: 4px;">🚜 ${escapeHtml(m)}</span>`
              )
              .join('')}
          </div>
        </div>
        <div class="promo-field full">
          <label>Direct Purchases & Invoices</label>
          <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>Total Farm Purchases: <strong style="color: #059669;">₹${f.totalSpent.toLocaleString('en-IN')}</strong> (${f.ordersCount} orders)</span>
            <a href="#/orders/all" style="color: var(--primary); font-weight: 700; font-size: 12px;">View Orders & GST Invoices &rarr;</a>
          </div>
        </div>
        <div class="promo-field full">
          <label>Agronomist & Field Notes</label>
          <p style="margin: 0; font-size: 12px; color: var(--muted); line-height: 1.4;">${escapeHtml(f.notes)}</p>
        </div>
      </div>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Close</button>
      <button type="button" class="btn btn--primary" id="farmer-send-quote-btn">
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Send Tractor Quotation
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

  const quoteBtn = modal.querySelector('#farmer-send-quote-btn');
  if (quoteBtn) {
    quoteBtn.addEventListener('click', () => {
      modal.close();
      modal.remove();
      showToast(`Quotation link sent to ${f.name} at ${f.phone}!`);
    });
  }
}

function openRegisterFarmerModal(): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Register Farmer Direct Account
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <form id="farmer-register-form">
        <div class="promo-form-grid">
          <div class="promo-field">
            <label>Farmer Full Name *</label>
            <input type="text" id="rf-name" placeholder="Thangavelu K." required />
          </div>
          <div class="promo-field">
            <label>Mobile Number (WhatsApp) *</label>
            <input type="tel" id="rf-phone" placeholder="+91 94431 00000" required />
          </div>
          <div class="promo-field">
            <label>Village / Revenue Block *</label>
            <input type="text" id="rf-village" placeholder="Kodumudi, Erode" required />
          </div>
          <div class="promo-field">
            <label>District & State *</label>
            <input type="text" id="rf-district" placeholder="Erode, Tamil Nadu" required />
          </div>
          <div class="promo-field">
            <label>Total Land Holding (Acres) *</label>
            <input type="number" id="rf-acres" placeholder="20" step="0.5" required />
          </div>
          <div class="promo-field">
            <label>Dominant Soil Type</label>
            <input type="text" id="rf-soil" placeholder="Red Loam / Clay Soil" />
          </div>
          <div class="promo-field full">
            <label>Primary Crops (Comma separated) *</label>
            <input type="text" id="rf-crops" placeholder="Turmeric, Sugarcane, Banana" required />
          </div>
          <div class="promo-field">
            <label>Pattadhar Passbook No</label>
            <input type="text" id="rf-patta" placeholder="PATTA-ERD-4412" />
          </div>
          <div class="promo-field">
            <label>Kisan Credit Card (KCC) No</label>
            <input type="text" id="rf-kcc" placeholder="KCC-SBI-991024" />
          </div>
          <div class="promo-field full">
            <label>Machinery Currently Inquiring / Owned</label>
            <input type="text" id="rf-machinery" placeholder="Vels Bull 45HP Tractor, 7ft Rotavator" />
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="farmer-register-form" class="btn btn--primary">
        Register Farmer & Issue Dossier
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

  const form = modal.querySelector<HTMLFormElement>('#farmer-register-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (modal.querySelector('#rf-name') as HTMLInputElement).value.trim();
      const phone = (modal.querySelector('#rf-phone') as HTMLInputElement).value.trim();
      const village = (modal.querySelector('#rf-village') as HTMLInputElement).value.trim();
      const district = (modal.querySelector('#rf-district') as HTMLInputElement).value.trim();
      const acres = parseFloat((modal.querySelector('#rf-acres') as HTMLInputElement).value);
      const soil = (modal.querySelector('#rf-soil') as HTMLInputElement).value.trim() || 'Alluvial Clay';
      const crops = (modal.querySelector('#rf-crops') as HTMLInputElement).value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const patta = (modal.querySelector('#rf-patta') as HTMLInputElement).value.trim();
      const kcc = (modal.querySelector('#rf-kcc') as HTMLInputElement).value.trim();
      const machinery = (modal.querySelector('#rf-machinery') as HTMLInputElement).value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const newFarmer: FarmerCustomer = {
        id: `c-farmer-${Date.now()}`,
        name,
        phone,
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        village,
        district,
        state: 'Tamil Nadu',
        landHoldingAcres: acres,
        primaryCrops: crops.length > 0 ? crops : ['Sugarcane'],
        machineryOwned: machinery.length > 0 ? machinery : ['Power Tiller'],
        kisanCreditCardNo: kcc || undefined,
        pattadharPassbookNo: patta || undefined,
        ordersCount: 0,
        totalSpent: 0,
        isActive: true,
        kycVerified: !!patta,
        registeredDate: Date.now(),
        soilType: soil,
        notes: 'Newly registered farmer direct customer; scheduled for field survey.',
      };

      farmers.unshift(newFarmer);
      saveStoredFarmers(farmers);
      modal.close();
      modal.remove();
      showToast(`Farmer ${name} registered successfully with ${acres} acres holding!`);
      updateView();
    });
  }
}
