// Vels Agro Enterprise — Courier & Shipment Management Subtab (Section 16)
// Create/Manage Shipments, View AWB/LRs, Assign Courier Partners, GPS Tracking, RTO Monitoring

import { showToast, escapeHtml } from '../../../main';
import {
  INITIAL_SHIPMENTS,
  COURIER_PARTNERS,
  ShipmentRecord,
  CourierPartner,
} from '../shipments-data';
import '../payments-shipments.css';

let shipments: ShipmentRecord[] = [...INITIAL_SHIPMENTS];
let partners: CourierPartner[] = [...COURIER_PARTNERS];
let activeFilter: 'all' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'rto_delay' = 'all';
let searchQuery = '';
let activeContainer: HTMLElement | null = null;

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateKPIs() {
  const activeHighway = shipments.filter(
    (s) => s.status === 'in_transit' || s.status === 'out_for_delivery'
  ).length;

  const deliveredCount = shipments.filter((s) => s.status === 'delivered').length;
  const slaRate = shipments.length > 0
    ? Math.round((deliveredCount / (deliveredCount + shipments.filter((s) => s.status === 'rto_delay').length || 1)) * 100)
    : 100;

  const totalWeightKg = shipments.reduce((sum, s) => sum + s.weightKg, 0);
  const rtoCount = shipments.filter((s) => s.status === 'rto_delay').length;

  return {
    activeHighway,
    slaRate,
    totalWeightTonnes: (totalWeightKg / 1000).toFixed(1),
    rtoCount,
    totalShipments: shipments.length,
  };
}

export function renderShipmentsSubtab(container: HTMLElement): void {
  activeContainer = container;
  container.innerHTML = `
    <div class="ps-container">
      <!-- Sub-header -->
      <div class="ps-header">
        <div class="ps-header__title-group">
          <h2>
            <span>🚚 Courier & Shipment Logistics</span>
            <span class="tag" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:12px; font-weight:700;">Section 16</span>
          </h2>
          <p>Manage heavy freight haulers, generate dispatch challans, track highway AWB/LRs and monitor delivery SLAs.</p>
        </div>
        <div class="ps-header__actions">
          <button type="button" class="btn btn--ghost" id="ps-sync-courier-api-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Sync Courier APIs
          </button>
          <button type="button" class="btn btn--primary" id="ps-create-shipment-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Dispatch Challan
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="ps-kpi-grid">
        ${renderKPIsHtml()}
      </div>

      <!-- Courier Transporter Fleet Strip -->
      <div style="margin-top: 4px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">
          Authorized Logistics & Transporter Fleet Partners
        </div>
        <div class="ps-fleet-strip">
          ${renderFleetCardsHtml()}
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="ps-toolbar">
        <div class="ps-filters" id="ps-shipment-filter-pills">
          ${renderFilterPillsHtml()}
        </div>
        <div class="ps-search-box">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="ps-shipment-search-input" placeholder="Search AWB/LR, Vehicle, Order, Partner..." value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <!-- Main Shipments Table -->
      <div class="ps-table-card">
        <div class="ps-table-wrapper" id="ps-shipments-table-container">
          ${renderTableHtml()}
        </div>
      </div>
    </div>

    <!-- Modals Container -->
    <div id="ps-shipment-modals"></div>
  `;

  bindEvents(container);
}

function renderKPIsHtml(): string {
  const kpi = calculateKPIs();
  return `
    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>Active Highway Dispatches</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="10" x="1" y="3" rx="2"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="7" y1="8" x2="7" y2="8.01"/><line x1="11" y1="8" x2="11" y2="8.01"/></svg>
      </div>
      <div class="ps-kpi-card__value" style="color: #2563eb;">${kpi.activeHighway} In-Transit</div>
      <div class="ps-kpi-card__meta">
        <span class="ps-trend--up">Live GPS linked</span>
        <span>across state corridors</span>
      </div>
    </div>

    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>On-Time Delivery SLA</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
      </div>
      <div class="ps-kpi-card__value" style="color: #059669;">${kpi.slaRate}%</div>
      <div class="ps-kpi-card__meta">
        <span>Target: 95.0% across regional hubs</span>
      </div>
    </div>

    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>Heavy Machinery Freight</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
      <div class="ps-kpi-card__value">${kpi.totalWeightTonnes} Tonnes</div>
      <div class="ps-kpi-card__meta">
        <span>${kpi.totalShipments} consignments on fleet</span>
      </div>
    </div>

    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>RTO & Cargo On-Hold</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="ps-kpi-card__value" style="color: #dc2626;">${kpi.rtoCount} Alert</div>
      <div class="ps-kpi-card__meta">
        <span class="ps-trend--bad">Reverse transit in progress</span>
      </div>
    </div>
  `;
}

function renderFleetCardsHtml(): string {
  return partners
    .map(
      (p) => `
    <div class="ps-partner-card">
      <div class="ps-partner-card__title">
        <span>${escapeHtml(p.name)}</span>
        <span class="ps-api-indicator ${p.apiConnected ? '' : 'ps-api-indicator--off'}">
          <span class="dot"></span>
          ${p.apiConnected ? 'API Live' : 'Manual'}
        </span>
      </div>
      <div class="ps-partner-card__stats">
        <span>${escapeHtml(p.type)}</span>
        <strong style="color: #059669;">${p.slaRate}% SLA</strong>
      </div>
      <div style="font-size: 11px; color: var(--muted); display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 4px; margin-top: 2px;">
        <span>Active Hauls: <strong>${p.activeShipments}</strong></span>
        <span>${escapeHtml(p.phone)}</span>
      </div>
    </div>
  `
    )
    .join('');
}

function renderFilterPillsHtml(): string {
  const counts = {
    all: shipments.length,
    in_transit: shipments.filter((s) => s.status === 'in_transit').length,
    out_for_delivery: shipments.filter((s) => s.status === 'out_for_delivery').length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
    rto_delay: shipments.filter((s) => s.status === 'rto_delay').length,
  };

  return `
    <button type="button" class="ps-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
      All Dispatches <span class="count">${counts.all}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'in_transit' ? 'active' : ''}" data-filter="in_transit">
      🚚 Highway In-Transit <span class="count">${counts.in_transit}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'out_for_delivery' ? 'active' : ''}" data-filter="out_for_delivery">
      🚜 Local Delivery <span class="count">${counts.out_for_delivery}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'delivered' ? 'active' : ''}" data-filter="delivered">
      ✓ Delivered <span class="count">${counts.delivered}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'rto_delay' ? 'active' : ''}" data-filter="rto_delay">
      ⚠️ RTO / On-Hold <span class="count">${counts.rto_delay}</span>
    </button>
  `;
}

function renderTableHtml(): string {
  let filtered = [...shipments];

  if (activeFilter !== 'all') {
    filtered = filtered.filter((s) => s.status === activeFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.shipmentNumber.toLowerCase().includes(q) ||
        s.awbNumber.toLowerCase().includes(q) ||
        s.orderNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.courierPartner.toLowerCase().includes(q) ||
        s.vehicleNumber.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    return `
      <div style="padding: 48px 24px; text-align: center; color: var(--muted);">
        <p style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">No matching shipments found</p>
        <p style="font-size: 13px; margin: 0;">Try adjusting your filter or search keywords.</p>
      </div>
    `;
  }

  return `
    <table class="ps-table">
      <thead>
        <tr>
          <th>AWB / LR Number</th>
          <th>Order Ref</th>
          <th>Customer & Destination</th>
          <th>Transporter Partner</th>
          <th>Vehicle & Driver</th>
          <th>Machinery Weight</th>
          <th>Live Status</th>
          <th style="text-align: right;">Logistics Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filtered
          .map(
            (s) => `
          <tr data-shipment-id="${s.id}">
            <td>
              <strong style="font-family: var(--mono); font-size: 13px; color: var(--primary);">${escapeHtml(s.awbNumber)}</strong>
              <div style="font-size: 11px; color: var(--muted); font-family: var(--mono);">EWB: ${escapeHtml(s.ewayBillNumber)}</div>
            </td>
            <td>
              <a href="#/orders/all" style="font-weight: 700; color: var(--text); font-family: var(--mono);">${escapeHtml(s.orderNumber)}</a>
              <div style="font-size: 11px; color: var(--muted);">${escapeHtml(s.itemsSummary)}</div>
            </td>
            <td>
              <div style="font-weight: 600;">${escapeHtml(s.customerName)}</div>
              <div style="font-size: 12px; color: var(--muted);">📍 ${escapeHtml(s.destination)}</div>
              <div>
                ${
                  s.customerType === 'dealer'
                    ? `<span class="tag tag--dealer" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:10px; font-weight:700;">🏢 Dealer Bulk</span>`
                    : `<span class="tag tag--farmer" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:10px; font-weight:700;">👨‍🌾 Farmer Direct</span>`
                }
              </div>
            </td>
            <td>
              <div style="font-weight: 600;">${escapeHtml(s.courierPartner)}</div>
              <div style="font-size: 11px; color: var(--muted);">${escapeHtml(s.currentLocation)}</div>
            </td>
            <td>
              <strong style="font-family: var(--mono);">${escapeHtml(s.vehicleNumber)}</strong>
              <div style="font-size: 11px; color: var(--muted);">${escapeHtml(s.driverName)} (${escapeHtml(s.driverPhone)})</div>
            </td>
            <td>
              <strong>${(s.weightKg / 1000).toFixed(2)} T</strong>
              <div style="font-size: 11px; color: var(--muted);">${s.weightKg.toLocaleString()} kg</div>
            </td>
            <td>
              ${renderShipmentStatusBadge(s.status)}
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button type="button" class="btn btn--primary btn--sm ps-btn-track-gps" data-id="${s.id}" title="Live GPS & Telemetry">
                Track GPS
              </button>
              <button type="button" class="btn btn--ghost btn--sm ps-btn-update-status" data-id="${s.id}" title="Update Dispatch Status">
                Update
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

function renderShipmentStatusBadge(status: ShipmentRecord['status']): string {
  switch (status) {
    case 'in_transit':
      return `<span class="ps-badge ps-badge--blue">🚚 Highway In-Transit</span>`;
    case 'out_for_delivery':
      return `<span class="ps-badge ps-badge--purple">🚜 Local Delivery</span>`;
    case 'delivered':
      return `<span class="ps-badge ps-badge--green">✓ Delivered</span>`;
    case 'manifested':
      return `<span class="ps-badge ps-badge--amber">📦 Loading / Docket</span>`;
    case 'rto_delay':
      return `<span class="ps-badge ps-badge--red">⚠️ RTO / Cargo Hold</span>`;
    default:
      return `<span class="ps-badge ps-badge--blue">${status}</span>`;
  }
}

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('#ps-shipment-filter-pills .ps-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter as any;
      updateView();
    });
  });

  // Search input
  const searchInput = container.querySelector<HTMLInputElement>('#ps-shipment-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      const tableWrapper = container.querySelector('#ps-shipments-table-container');
      if (tableWrapper) {
        tableWrapper.innerHTML = renderTableHtml();
        bindTableActions(container);
      }
    });
  }

  // Sync Courier APIs
  const syncBtn = container.querySelector('#ps-sync-courier-api-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      const now = Date.now();
      shipments.forEach((s) => {
        if (s.apiSyncSupported) {
          s.lastApiSync = now;
        }
      });
      showToast('Courier API Sync complete: Updated 4 active dockets with GPS live telemetry from VRL, ARC and ABT networks.');
      updateView();
    });
  }

  // Create Shipment Button
  const createBtn = container.querySelector('#ps-create-shipment-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateShipmentModal();
    });
  }

  bindTableActions(container);
}

function bindTableActions(container: HTMLElement): void {
  // Track GPS
  container.querySelectorAll<HTMLButtonElement>('.ps-btn-track-gps').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const shp = shipments.find((s) => s.id === id);
      if (shp) {
        openTrackGpsModal(shp);
      }
    });
  });

  // Update Status
  container.querySelectorAll<HTMLButtonElement>('.ps-btn-update-status').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const shp = shipments.find((s) => s.id === id);
      if (shp) {
        openUpdateShipmentStatusModal(shp);
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderShipmentsSubtab(activeContainer);
}

function openTrackGpsModal(shp: ShipmentRecord): void {
  const modal = document.createElement('dialog');
  modal.className = 'ps-modal';
  modal.innerHTML = `
    <div class="ps-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
        Live Freight Telemetry — ${escapeHtml(shp.awbNumber)}
      </h3>
      <button type="button" class="ps-modal__close" data-close>&times;</button>
    </div>
    <div class="ps-modal__body">
      <!-- Live Map Card -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Current GPS Checkpoint</span>
          ${renderShipmentStatusBadge(shp.status)}
        </div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text);">
          📍 ${escapeHtml(shp.currentLocation)}
        </div>
        <div style="font-size: 12px; color: var(--muted); display: flex; gap: 16px; margin-top: 4px;">
          <span>🚛 Vehicle: <strong style="font-family: var(--mono); color: var(--text);">${escapeHtml(shp.vehicleNumber)}</strong></span>
          <span>👤 Driver: <strong style="color: var(--text);">${escapeHtml(shp.driverName)}</strong></span>
          <span>📞 <a href="tel:${escapeHtml(shp.driverPhone)}" style="color: var(--primary); font-weight: 700;">${escapeHtml(shp.driverPhone)}</a></span>
        </div>
      </div>

      <!-- Quick Info Grid -->
      <div class="ps-form-grid" style="font-size: 13px;">
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Order Reference</strong>
          <span style="font-weight: 700; font-family: var(--mono);">${escapeHtml(shp.orderNumber)}</span>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Consignee / Customer</strong>
          <span style="font-weight: 600;">${escapeHtml(shp.customerName)}</span>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Transporter Partner</strong>
          <span>${escapeHtml(shp.courierPartner)}</span>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">GST E-Way Bill Number</strong>
          <code style="font-family: var(--mono);">${escapeHtml(shp.ewayBillNumber)}</code>
        </div>
      </div>

      <!-- Milestones Stepper -->
      <div style="margin-top: 8px;">
        <h4 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--muted); margin: 0 0 12px 0;">
          Route Milestones & Gateway Logs
        </h4>
        <div class="ps-timeline">
          ${shp.checkpoints
            .map(
              (cp, idx) => `
            <div class="ps-timeline-step ${cp.completed ? 'completed' : 'active'}">
              <div class="ps-timeline-icon">
                ${cp.completed ? '✓' : idx + 1}
              </div>
              <div class="ps-timeline-content">
                <h4>${escapeHtml(cp.title)}</h4>
                <p>📍 ${escapeHtml(cp.location)}</p>
                ${cp.notes ? `<p style="color: var(--text); font-style: italic;">“${escapeHtml(cp.notes)}”</p>` : ''}
                <small>${formatTimestamp(cp.timestamp)}</small>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
    <div class="ps-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Close</button>
      <button type="button" class="btn btn--primary" id="ps-copy-tracking-btn">
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        Copy Tracking Link
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

  const copyBtn = modal.querySelector('#ps-copy-tracking-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(`https://tracking.velsagro.com/track/${shp.awbNumber}`);
      showToast(`Tracking link for ${shp.awbNumber} copied to clipboard!`);
    });
  }
}

function openUpdateShipmentStatusModal(shp: ShipmentRecord): void {
  const modal = document.createElement('dialog');
  modal.className = 'ps-modal';
  modal.innerHTML = `
    <div class="ps-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Update Shipment Status — ${escapeHtml(shp.awbNumber)}
      </h3>
      <button type="button" class="ps-modal__close" data-close>&times;</button>
    </div>
    <div class="ps-modal__body">
      <form id="ps-update-status-form">
        <div class="ps-form-grid">
          <div class="ps-form-group full">
            <label>Consignment Stage / Status *</label>
            <select id="us-status">
              <option value="manifested" ${shp.status === 'manifested' ? 'selected' : ''}>📦 Manifested / Awaiting Loading</option>
              <option value="in_transit" ${shp.status === 'in_transit' ? 'selected' : ''}>🚚 Highway In-Transit</option>
              <option value="out_for_delivery" ${shp.status === 'out_for_delivery' ? 'selected' : ''}>🚜 Local Out for Delivery / Field Demo</option>
              <option value="delivered" ${shp.status === 'delivered' ? 'selected' : ''}>✓ Successfully Delivered & Accepted</option>
              <option value="rto_delay" ${shp.status === 'rto_delay' ? 'selected' : ''}>⚠️ RTO / Cargo On-Hold</option>
            </select>
          </div>
          <div class="ps-form-group full">
            <label>Current Location / Hub *</label>
            <input type="text" id="us-location" value="${escapeHtml(shp.currentLocation)}" required />
          </div>
          <div class="ps-form-group full">
            <label>Add Progress Checkpoint Log Note</label>
            <input type="text" id="us-note" placeholder="Passed checkpost, vehicle inspection passed, etc." />
          </div>
        </div>
      </form>
    </div>
    <div class="ps-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="ps-update-status-form" class="btn btn--primary">
        Save & Broadcast Update
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

  const form = modal.querySelector<HTMLFormElement>('#ps-update-status-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = (modal.querySelector('#us-status') as HTMLSelectElement).value as any;
      const location = (modal.querySelector('#us-location') as HTMLInputElement).value;
      const note = (modal.querySelector('#us-note') as HTMLInputElement).value;

      shp.status = status;
      shp.currentLocation = location;
      if (status === 'delivered') {
        shp.deliveredAt = Date.now();
      }

      if (note.trim()) {
        shp.checkpoints.push({
          title: `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
          location,
          timestamp: Date.now(),
          completed: true,
          notes: note.trim(),
        });
      }

      modal.close();
      modal.remove();
      showToast(`Shipment ${shp.awbNumber} updated to ${status}!`);
      updateView();
    });
  }
}

function openCreateShipmentModal(): void {
  const modal = document.createElement('dialog');
  modal.className = 'ps-modal';
  modal.innerHTML = `
    <div class="ps-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Generate Heavy Dispatch Challan & Gate Pass
      </h3>
      <button type="button" class="ps-modal__close" data-close>&times;</button>
    </div>
    <div class="ps-modal__body">
      <form id="ps-create-shipment-form">
        <div class="ps-form-grid">
          <div class="ps-form-group">
            <label>Order Number *</label>
            <input type="text" id="cs-order" placeholder="#AG-1087" required />
          </div>
          <div class="ps-form-group">
            <label>Customer Name *</label>
            <input type="text" id="cs-customer" placeholder="Balwinder Singh (Farmer)" required />
          </div>
          <div class="ps-form-group">
            <label>Customer Type</label>
            <select id="cs-cust-type">
              <option value="farmer">Farmer Direct</option>
              <option value="dealer">Authorized Dealer</option>
            </select>
          </div>
          <div class="ps-form-group">
            <label>Transporter Partner *</label>
            <select id="cs-partner">
              <option value="VRL Logistics (Heavy Freight)">VRL Logistics (Heavy Freight)</option>
              <option value="ARC Transporters (ODC Cargo)">ARC Transporters (ODC Cargo)</option>
              <option value="ABT Parcel Service">ABT Parcel Service</option>
              <option value="Vels Factory Low-Bed Fleet">Vels Factory Low-Bed Fleet</option>
              <option value="KPN Heavy Haulers">KPN Heavy Haulers</option>
            </select>
          </div>
          <div class="ps-form-group">
            <label>AWB / LR / Bilty Number *</label>
            <input type="text" id="cs-awb" placeholder="VRL-CBE-992144" required />
          </div>
          <div class="ps-form-group">
            <label>Trailer / Truck Registration No *</label>
            <input type="text" id="cs-vehicle" placeholder="TN 38 BX 8812" required />
          </div>
          <div class="ps-form-group">
            <label>Driver Full Name *</label>
            <input type="text" id="cs-driver-name" placeholder="Rangasamy K." required />
          </div>
          <div class="ps-form-group">
            <label>Driver Phone No *</label>
            <input type="tel" id="cs-driver-phone" placeholder="+91 94431 00000" required />
          </div>
          <div class="ps-form-group">
            <label>GST E-Way Bill Number *</label>
            <input type="text" id="cs-ewb" placeholder="EWB-261109921044" required />
          </div>
          <div class="ps-form-group">
            <label>Machinery Weight (kg) *</label>
            <input type="number" id="cs-weight" placeholder="3200" required />
          </div>
          <div class="ps-form-group full">
            <label>Delivery Destination / Farm Yard *</label>
            <input type="text" id="cs-dest" placeholder="Main Yard, Bypass Road, Batala, Punjab" required />
          </div>
          <div class="ps-form-group full">
            <label>Consignment Items Summary *</label>
            <input type="text" id="cs-items" placeholder="1x Vels Bull 55HP 4WD Tractor + 1x Multi-Speed Rotavator" required />
          </div>
        </div>
      </form>
    </div>
    <div class="ps-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="ps-create-shipment-form" class="btn btn--primary">
        Generate Challan & Authorize Gate-Out
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

  const form = modal.querySelector<HTMLFormElement>('#ps-create-shipment-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const order = (modal.querySelector('#cs-order') as HTMLInputElement).value;
      const customer = (modal.querySelector('#cs-customer') as HTMLInputElement).value;
      const custType = (modal.querySelector('#cs-cust-type') as HTMLSelectElement).value as any;
      const partner = (modal.querySelector('#cs-partner') as HTMLSelectElement).value;
      const awb = (modal.querySelector('#cs-awb') as HTMLInputElement).value;
      const vehicle = (modal.querySelector('#cs-vehicle') as HTMLInputElement).value;
      const driverName = (modal.querySelector('#cs-driver-name') as HTMLInputElement).value;
      const driverPhone = (modal.querySelector('#cs-driver-phone') as HTMLInputElement).value;
      const ewb = (modal.querySelector('#cs-ewb') as HTMLInputElement).value;
      const weight = parseFloat((modal.querySelector('#cs-weight') as HTMLInputElement).value);
      const dest = (modal.querySelector('#cs-dest') as HTMLInputElement).value;
      const items = (modal.querySelector('#cs-items') as HTMLInputElement).value;

      const newShp: ShipmentRecord = {
        id: `shp-${Date.now()}`,
        shipmentNumber: `SHP-VELS-2026-0${shipments.length + 40}`,
        orderId: `so-agro-${order.replace(/[^0-9]/g, '')}`,
        orderNumber: order.startsWith('#') ? order : `#${order}`,
        customerId: custType === 'dealer' ? 'dlr-new' : 'farmer-new',
        customerName: customer,
        customerType: custType,
        destination: dest,
        state: 'Tamil Nadu',
        courierPartner: partner,
        partnerCode: 'VRL',
        awbNumber: awb,
        vehicleNumber: vehicle,
        driverName,
        driverPhone,
        ewayBillNumber: ewb,
        status: 'in_transit',
        itemsSummary: items,
        weightKg: weight,
        dispatchedAt: Date.now(),
        estimatedDelivery: Date.now() + 2 * 86400000,
        currentLocation: 'Coimbatore Plant Gate Out — En-route NH Highway',
        apiSyncSupported: true,
        lastApiSync: Date.now(),
        checkpoints: [
          {
            title: 'Factory Gate Out & Commercial Inspection',
            location: 'Vels Agro Plant Yard, Coimbatore',
            timestamp: Date.now(),
            completed: true,
            notes: 'Dispatch challan & Gate Pass authorized',
          },
        ],
      };

      shipments.unshift(newShp);
      modal.close();
      modal.remove();
      showToast(`Dispatch Challan ${newShp.shipmentNumber} generated! AWB: ${awb}`);
      updateView();
    });
  }
}
