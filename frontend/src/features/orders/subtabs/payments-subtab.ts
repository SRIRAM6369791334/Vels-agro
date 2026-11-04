// Vels Agro Enterprise — Payment Management Subtab (Section 15)
// View Transactions, Payment Status, Gateway IDs, Refunds & Bank Reconciliation

import { formatMoney, showToast, escapeHtml } from '../../../main';
import { INITIAL_TRANSACTIONS, INITIAL_REFUNDS, PaymentTransaction, RefundRecord } from '../payments-data';
import '../payments-shipments.css';

let transactions: PaymentTransaction[] = [...INITIAL_TRANSACTIONS];
let refunds: RefundRecord[] = [...INITIAL_REFUNDS];
let activeFilter: 'all' | 'successful' | 'pending' | 'failed' | 'refunds' = 'all';
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
  const totalCollected = transactions
    .filter((t) => t.status === 'successful')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = refunds
    .reduce((sum, r) => sum + r.amount, 0);

  const successCount = transactions.filter((t) => t.status === 'successful').length;
  const settlementRate = transactions.length > 0
    ? Math.round((successCount / transactions.length) * 100)
    : 100;

  return {
    totalCollected,
    pendingAmount,
    totalRefunded,
    settlementRate,
    totalTxns: transactions.length,
    failedCount: transactions.filter((t) => t.status === 'failed').length,
    pendingCount: transactions.filter((t) => t.status === 'pending').length,
  };
}

export function renderPaymentsSubtab(container: HTMLElement): void {
  activeContainer = container;
  container.innerHTML = `
    <div class="ps-container">
      <!-- Sub-header -->
      <div class="ps-header">
        <div class="ps-header__title-group">
          <h2>
            <span>💳 Payment Management & Audit</span>
            <span class="tag" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:12px; font-weight:700;">Section 15</span>
          </h2>
          <p>Reconcile commercial transactions, track bank UTRs, monitor customer refunds and verify gateway settlements.</p>
        </div>
        <div class="ps-header__actions">
          <button type="button" class="btn btn--ghost" id="ps-reconcile-all-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Reconcile All Accounts
          </button>
          <button type="button" class="btn btn--ghost" id="ps-export-csv-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Ledger CSV
          </button>
          <button type="button" class="btn btn--primary" id="ps-new-payment-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Record Manual Receipt
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="ps-kpi-grid" id="ps-kpis">
        ${renderKPIsHtml()}
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="ps-toolbar">
        <div class="ps-filters" id="ps-filter-pills">
          ${renderFilterPillsHtml()}
        </div>
        <div class="ps-search-box">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="ps-search-input" placeholder="Search Txn ID, Order, UTR, Customer..." value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <!-- Main Ledger Table -->
      <div class="ps-table-card">
        <div class="ps-table-wrapper" id="ps-table-container">
          ${renderTableHtml()}
        </div>
      </div>

      <!-- Refunds Section -->
      ${renderRefundsSectionHtml()}
    </div>

    <!-- Modals Container -->
    <div id="ps-modals"></div>
  `;

  bindEvents(container);
}

function renderKPIsHtml(): string {
  const kpi = calculateKPIs();
  return `
    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>Total Collected Revenue</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div class="ps-kpi-card__value" style="color: #059669;">₹${(kpi.totalCollected / 100000).toFixed(2)} L</div>
      <div class="ps-kpi-card__meta">
        <span class="ps-trend--up">↑ +18.4%</span>
        <span>vs last fiscal month</span>
      </div>
    </div>

    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>Settlement Success Rate</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div class="ps-kpi-card__value">${kpi.settlementRate}%</div>
      <div class="ps-kpi-card__meta">
        <span>${kpi.totalTxns - kpi.failedCount} cleared / ${kpi.totalTxns} gateway attempts</span>
      </div>
    </div>

    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>Pending Bank Clearance</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="ps-kpi-card__value" style="color: #d97706;">₹${kpi.pendingAmount.toLocaleString('en-IN')}</div>
      <div class="ps-kpi-card__meta">
        <span class="ps-trend--warn">● ${kpi.pendingCount} demand draft in T+1 transit</span>
      </div>
    </div>

    <div class="ps-kpi-card">
      <div class="ps-kpi-card__label">
        <span>Active Refunds & Credit Notes</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      </div>
      <div class="ps-kpi-card__value" style="color: #7c3aed;">₹${kpi.totalRefunded.toLocaleString('en-IN')}</div>
      <div class="ps-kpi-card__meta">
        <span>${refunds.length} warranty / cancellation adjustments</span>
      </div>
    </div>
  `;
}

function renderFilterPillsHtml(): string {
  const counts = {
    all: transactions.length,
    successful: transactions.filter((t) => t.status === 'successful').length,
    pending: transactions.filter((t) => t.status === 'pending').length,
    failed: transactions.filter((t) => t.status === 'failed').length,
    refunds: refunds.length,
  };

  return `
    <button type="button" class="ps-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
      All Transactions <span class="count">${counts.all}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'successful' ? 'active' : ''}" data-filter="successful">
      ✓ Settled <span class="count">${counts.successful}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
      ⏳ In Clearance <span class="count">${counts.pending}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'failed' ? 'active' : ''}" data-filter="failed">
      ✕ Failed / Timed out <span class="count">${counts.failed}</span>
    </button>
    <button type="button" class="ps-filter-pill ${activeFilter === 'refunds' ? 'active' : ''}" data-filter="refunds">
      ↺ Refunds & RMA <span class="count">${counts.refunds}</span>
    </button>
  `;
}

function renderTableHtml(): string {
  let filtered = [...transactions];

  if (activeFilter === 'successful') {
    filtered = filtered.filter((t) => t.status === 'successful');
  } else if (activeFilter === 'pending') {
    filtered = filtered.filter((t) => t.status === 'pending');
  } else if (activeFilter === 'failed') {
    filtered = filtered.filter((t) => t.status === 'failed');
  } else if (activeFilter === 'refunds') {
    return `<div style="padding: 24px; text-align: center; color: var(--muted);">See the Refunds & Warranty Adjustments table below.</div>`;
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.txnNumber.toLowerCase().includes(q) ||
        t.orderNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.bankRef.toLowerCase().includes(q) ||
        t.gateway.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    return `
      <div style="padding: 48px 24px; text-align: center; color: var(--muted);">
        <p style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">No matching transactions found</p>
        <p style="font-size: 13px; margin: 0;">Try adjusting your search query or status filter.</p>
      </div>
    `;
  }

  return `
    <table class="ps-table">
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Order Ref</th>
          <th>Customer & Channel</th>
          <th>Amount</th>
          <th>Mode & Gateway</th>
          <th>Bank UTR / Ref</th>
          <th>Status</th>
          <th>Reconciliation</th>
          <th style="text-align: right;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filtered
          .map(
            (t) => `
          <tr data-txn-id="${t.id}">
            <td>
              <strong style="font-family: var(--mono); font-size: 13px;">${escapeHtml(t.txnNumber)}</strong>
              <div style="font-size: 11px; color: var(--muted);">${formatTimestamp(t.createdAt)}</div>
            </td>
            <td>
              <a href="#/orders/all" style="font-weight: 700; color: var(--primary); font-family: var(--mono);">${escapeHtml(t.orderNumber)}</a>
            </td>
            <td>
              <div style="font-weight: 600;">${escapeHtml(t.customerName)}</div>
              <div>
                ${
                  t.customerType === 'dealer'
                    ? `<span class="tag tag--dealer" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:10px; font-weight:700;">🏢 Dealer Bulk</span>`
                    : `<span class="tag tag--farmer" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:10px; font-weight:700;">👨‍🌾 Farmer Direct</span>`
                }
              </div>
            </td>
            <td>
              <strong style="font-size: 14px; font-feature-settings: 'tnum';">₹${t.amount.toLocaleString('en-IN')}</strong>
            </td>
            <td>
              <div style="font-weight: 600;">${escapeHtml(t.paymentMode)}</div>
              <div style="font-size: 11px; color: var(--muted);">${escapeHtml(t.gateway)}</div>
            </td>
            <td>
              <code style="font-size: 11px; padding: 2px 6px; background: var(--surface-2); border-radius: 4px; border: 1px solid var(--border);">${escapeHtml(t.bankRef)}</code>
              ${t.failureReason ? `<div style="font-size: 11px; color: #dc2626; max-width: 200px; margin-top: 4px;">⚠️ ${escapeHtml(t.failureReason)}</div>` : ''}
            </td>
            <td>
              ${renderStatusBadge(t.status)}
            </td>
            <td>
              ${
                t.isReconciled
                  ? `<span class="ps-recon-pill ps-recon--yes">✓ Reconciled</span>`
                  : `<span class="ps-recon-pill ps-recon--no">⏳ Unreconciled</span>`
              }
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button type="button" class="btn btn--ghost btn--sm ps-btn-view-txn" data-id="${t.id}" title="View Details">
                Details
              </button>
              ${
                !t.isReconciled && t.status === 'successful'
                  ? `<button type="button" class="btn btn--ghost btn--sm ps-btn-recon-single" data-id="${t.id}" title="Match Bank Statement" style="color:#059669;">Reconcile</button>`
                  : ''
              }
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderStatusBadge(status: PaymentTransaction['status']): string {
  switch (status) {
    case 'successful':
      return `<span class="ps-badge ps-badge--green">✓ Settled</span>`;
    case 'pending':
      return `<span class="ps-badge ps-badge--amber">⏳ In Clearance</span>`;
    case 'failed':
      return `<span class="ps-badge ps-badge--red">✕ Failed</span>`;
    case 'refunded':
      return `<span class="ps-badge ps-badge--purple">↺ Refunded</span>`;
  }
}

function renderRefundsSectionHtml(): string {
  return `
    <div style="margin-top: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px;">
          <span>🔄 Warranty Refunds & Dealer Credit Notes</span>
          <span class="tag" style="background:#f3e8ff; color:#7e22ce; font-size:11px;">${refunds.length} Records</span>
        </h3>
        <span style="font-size: 12px; color: var(--muted);">Automated reconciliation with RMA returns</span>
      </div>

      <div class="ps-table-card">
        <div class="ps-table-wrapper">
          <table class="ps-table">
            <thead>
              <tr>
                <th>Refund Ref</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Refund Amount</th>
                <th>Reason</th>
                <th>Mode & Voucher</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${refunds
                .map(
                  (r) => `
                <tr>
                  <td><strong style="font-family: var(--mono);">${escapeHtml(r.refundNumber)}</strong></td>
                  <td><a href="#/orders/all" style="font-weight: 700; color: var(--primary); font-family: var(--mono);">${escapeHtml(r.orderNumber)}</a></td>
                  <td><strong>${escapeHtml(r.customerName)}</strong></td>
                  <td><strong style="color: #7c3aed; font-feature-settings: 'tnum';">₹${r.amount.toLocaleString('en-IN')}</strong></td>
                  <td style="max-width: 280px; font-size: 12px;">${escapeHtml(r.reason)}</td>
                  <td>
                    <div><strong>${escapeHtml(r.mode)}</strong></div>
                    <code style="font-size: 11px;">${escapeHtml(r.utrNumber || 'Pending Issuance')}</code>
                  </td>
                  <td>
                    ${
                      r.status === 'processed'
                        ? `<span class="ps-badge ps-badge--green">✓ Settled</span>`
                        : `<span class="ps-badge ps-badge--amber">⏳ Pending Approval</span>`
                    }
                  </td>
                  <td style="text-align: right;">
                    ${
                      r.status === 'pending_approval'
                        ? `<button type="button" class="btn btn--primary btn--sm ps-btn-approve-refund" data-id="${r.id}">Approve Refund</button>`
                        : `<span style="font-size: 12px; color: #059669; font-weight: 600;">Disbursed</span>`
                    }
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('.ps-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter as any;
      updateView();
    });
  });

  // Search input
  const searchInput = container.querySelector<HTMLInputElement>('#ps-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      const tableWrapper = container.querySelector('#ps-table-container');
      if (tableWrapper) {
        tableWrapper.innerHTML = renderTableHtml();
        bindTableActions(container);
      }
    });
  }

  // Reconcile All Accounts
  const reconAllBtn = container.querySelector('#ps-reconcile-all-btn');
  if (reconAllBtn) {
    reconAllBtn.addEventListener('click', () => {
      let count = 0;
      transactions.forEach((t) => {
        if (!t.isReconciled && t.status === 'successful') {
          t.isReconciled = true;
          count++;
        }
      });
      showToast(`Bank Reconciliation Complete: ${count} transactions matched with SBI/HDFC settlement records.`);
      updateView();
    });
  }

  // Export CSV
  const exportBtn = container.querySelector('#ps-export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportTransactionsCsv();
    });
  }

  // Record Manual Payment
  const newPayBtn = container.querySelector('#ps-new-payment-btn');
  if (newPayBtn) {
    newPayBtn.addEventListener('click', () => {
      openRecordPaymentModal();
    });
  }

  // Approve Refund
  container.querySelectorAll<HTMLButtonElement>('.ps-btn-approve-refund').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const ref = refunds.find((r) => r.id === id);
      if (ref) {
        ref.status = 'processed';
        ref.utrNumber = `UTR-SBIN-${Date.now().toString().slice(-8)}`;
        ref.processedAt = Date.now();
        showToast(`Refund ${ref.refundNumber} approved! Transferred ₹${ref.amount.toLocaleString('en-IN')} via ${ref.utrNumber}`);
        updateView();
      }
    });
  });

  bindTableActions(container);
}

function bindTableActions(container: HTMLElement): void {
  // View Details
  container.querySelectorAll<HTMLButtonElement>('.ps-btn-view-txn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const txn = transactions.find((t) => t.id === id);
      if (txn) {
        openTxnDetailsModal(txn);
      }
    });
  });

  // Reconcile single
  container.querySelectorAll<HTMLButtonElement>('.ps-btn-recon-single').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const txn = transactions.find((t) => t.id === id);
      if (txn) {
        txn.isReconciled = true;
        showToast(`Transaction ${txn.txnNumber} reconciled against bank statement.`);
        updateView();
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderPaymentsSubtab(activeContainer);
}

function exportTransactionsCsv(): void {
  const headers = ['Transaction ID', 'Order Ref', 'Customer', 'Customer Type', 'Amount (INR)', 'Payment Mode', 'Gateway', 'Bank UTR', 'Status', 'Reconciled', 'Date'];
  const rows = transactions.map((t) => [
    t.txnNumber,
    t.orderNumber,
    `"${t.customerName.replace(/"/g, '""')}"`,
    t.customerType,
    t.amount,
    t.paymentMode,
    t.gateway,
    t.bankRef,
    t.status,
    t.isReconciled ? 'YES' : 'NO',
    new Date(t.createdAt).toISOString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Vels_Agro_Payment_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Payment Ledger exported to CSV.');
}

function openTxnDetailsModal(txn: PaymentTransaction): void {
  const modal = document.createElement('dialog');
  modal.className = 'ps-modal';
  modal.innerHTML = `
    <div class="ps-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        Transaction Details — ${escapeHtml(txn.txnNumber)}
      </h3>
      <button type="button" class="ps-modal__close" data-close>&times;</button>
    </div>
    <div class="ps-modal__body">
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 12px; color: var(--muted); text-transform: uppercase; font-weight: 600;">Remittance Amount</span>
          <div style="font-size: 24px; font-weight: 800; color: #059669; font-feature-settings: 'tnum';">₹${txn.amount.toLocaleString('en-IN')}</div>
        </div>
        <div style="text-align: right;">
          <div>${renderStatusBadge(txn.status)}</div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">${txn.isReconciled ? '✓ Bank Reconciled' : '⏳ Awaiting Statement Verification'}</div>
        </div>
      </div>

      <div class="ps-form-grid" style="font-size: 13px;">
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Order Number</strong>
          <span style="font-weight: 700; font-family: var(--mono);">${escapeHtml(txn.orderNumber)}</span>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Customer Name</strong>
          <span style="font-weight: 600;">${escapeHtml(txn.customerName)}</span>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Payment Method</strong>
          <span>${escapeHtml(txn.paymentMode)}</span>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Banking Partner / Gateway</strong>
          <span>${escapeHtml(txn.gateway)}</span>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Bank UTR / Transaction Reference</strong>
          <code style="font-weight: 700;">${escapeHtml(txn.bankRef)}</code>
        </div>
        <div>
          <strong style="color: var(--muted); font-size: 11px; display: block; text-transform: uppercase;">Date & Time</strong>
          <span>${formatTimestamp(txn.createdAt)}</span>
        </div>
      </div>

      ${
        txn.notes
          ? `
        <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-size: 12px;">
          <strong style="color: var(--muted); display: block; margin-bottom: 4px;">Commercial Notes & Purpose:</strong>
          ${escapeHtml(txn.notes)}
        </div>
      `
          : ''
      }

      ${
        txn.failureReason
          ? `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; font-size: 12px; color: #991b1b;">
          <strong>Failure Diagnostic:</strong> ${escapeHtml(txn.failureReason)}
        </div>
      `
          : ''
      }
    </div>
    <div class="ps-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Close</button>
      <button type="button" class="btn btn--primary" id="ps-print-voucher-btn">
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        Print Commercial Voucher
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

  const printBtn = modal.querySelector('#ps-print-voucher-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function openRecordPaymentModal(): void {
  const modal = document.createElement('dialog');
  modal.className = 'ps-modal';
  modal.innerHTML = `
    <div class="ps-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Record Manual Commercial Receipt
      </h3>
      <button type="button" class="ps-modal__close" data-close>&times;</button>
    </div>
    <div class="ps-modal__body">
      <form id="ps-record-payment-form">
        <div class="ps-form-grid">
          <div class="ps-form-group">
            <label>Order Number *</label>
            <input type="text" id="mf-order" placeholder="#AG-1085" required />
          </div>
          <div class="ps-form-group">
            <label>Remittance Amount (₹) *</label>
            <input type="number" id="mf-amount" placeholder="50000" required />
          </div>
          <div class="ps-form-group">
            <label>Payer Name *</label>
            <input type="text" id="mf-payer" placeholder="Suresh Gowda (Farmer)" required />
          </div>
          <div class="ps-form-group">
            <label>Payer Type</label>
            <select id="mf-type">
              <option value="farmer">Farmer Direct</option>
              <option value="dealer">Authorized Dealer</option>
            </select>
          </div>
          <div class="ps-form-group">
            <label>Payment Mode *</label>
            <select id="mf-mode">
              <option value="NEFT/RTGS">NEFT / RTGS</option>
              <option value="UPI">UPI (QR / ID)</option>
              <option value="Demand Draft">Demand Draft / Cheque</option>
              <option value="Dealer 30-Day Credit">Dealer 30-Day Credit Line</option>
              <option value="Cash">Cash Receipt at Plant</option>
            </select>
          </div>
          <div class="ps-form-group">
            <label>Gateway / Bank Account *</label>
            <select id="mf-gateway">
              <option value="SBI Corporate Banking">SBI Corporate Banking (A/C: 4099182901)</option>
              <option value="HDFC Escrow">HDFC Escrow Commercial</option>
              <option value="ICICI Agri">ICICI Agri Business Account</option>
              <option value="Razorpay Agri">Razorpay Agri Payment Link</option>
              <option value="Direct Cash / Cheque">Plant Cash Counter</option>
            </select>
          </div>
          <div class="ps-form-group full">
            <label>Bank UTR / Cheque / DD Reference No *</label>
            <input type="text" id="mf-ref" placeholder="UTR-SBIN2611099210" required />
          </div>
          <div class="ps-form-group full">
            <label>Commercial Remarks / Purpose</label>
            <textarea id="mf-notes" rows="2" placeholder="Advance clearance against combine harvester / tractor chassis allocation"></textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="ps-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="ps-record-payment-form" class="btn btn--primary">
        Save & Issue Voucher
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

  const form = modal.querySelector<HTMLFormElement>('#ps-record-payment-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const order = (modal.querySelector('#mf-order') as HTMLInputElement).value;
      const amount = parseFloat((modal.querySelector('#mf-amount') as HTMLInputElement).value);
      const payer = (modal.querySelector('#mf-payer') as HTMLInputElement).value;
      const type = (modal.querySelector('#mf-type') as HTMLSelectElement).value as any;
      const mode = (modal.querySelector('#mf-mode') as HTMLSelectElement).value as any;
      const gateway = (modal.querySelector('#mf-gateway') as HTMLSelectElement).value as any;
      const ref = (modal.querySelector('#mf-ref') as HTMLInputElement).value;
      const notes = (modal.querySelector('#mf-notes') as HTMLTextAreaElement).value;

      const newTxn: PaymentTransaction = {
        id: `txn-${Date.now()}`,
        txnNumber: `TXN-VELS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: `so-agro-${order.replace(/[^0-9]/g, '')}`,
        orderNumber: order.startsWith('#') ? order : `#${order}`,
        customerId: type === 'dealer' ? 'dlr-manual' : 'farmer-manual',
        customerName: payer,
        customerType: type,
        amount,
        paymentMode: mode,
        status: 'successful',
        gateway,
        bankRef: ref,
        createdAt: Date.now(),
        settledAt: Date.now(),
        isReconciled: true,
        notes,
      };

      transactions.unshift(newTxn);
      modal.close();
      modal.remove();
      showToast(`Payment receipt ${newTxn.txnNumber} recorded for ₹${amount.toLocaleString('en-IN')}`);
      updateView();
    });
  }
}
