// Vels Agro Enterprise — Interactive Modals for Order Lifecycle Management
// Section 14: Status Updates, Cancellation Reason, Warranty Replacement & Logistics

import { escapeHtml, showToast, store, cancelOrder } from '../../main';
import { gsap } from 'gsap';
import { INITIAL_AGRO_PRODUCTS } from '../products/agro-products-data';
import type { ReturnOrder } from '../../types/order';

// 1. CANCELLATION MODAL
export function openCancelOrderModal(order: any, onDone: () => void) {
  let existing = document.getElementById('order-action-modal-overlay');
  if (existing) existing.remove();

  let overlay = document.createElement('dialog');
  overlay.id = 'order-action-modal-overlay';
  overlay.className = 'gst-inv-overlay';

  overlay.innerHTML = `
    <div class="order-action-dialog" style="max-width: 500px;">
      <header class="order-action-head">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="background:#fee2e2; color:#dc2626; width:36px; height:36px; border-radius:10px; display:grid; place-items:center; font-weight:700;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700; color:#1e293b;">Cancel Order ${escapeHtml(order.number)}</h3>
            <small style="color:#64748b;">Inventory will be restored to Central Yard / DC</small>
          </div>
        </div>
        <button type="button" class="btn-close-action" style="background:none; border:none; cursor:pointer; color:#64748b;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </header>

      <form id="cancel-order-form" style="padding:18px 20px; display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:6px;">Cancellation Reason *</label>
          <select id="cancel-reason-select" class="form-input" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;" required>
            <option value="Farmer Agriculture Loan / Subsidy Delayed">Farmer Agriculture Loan / Subsidy Delayed (Bank / PACB)</option>
            <option value="Implement / HP Rating Mismatch">Implement / HP Rating Mismatch with Existing Tractor</option>
            <option value="Customer / Farmer Changed Mind">Customer / Farmer Requested Cancellation</option>
            <option value="Duplicate Order Placed">Duplicate Order Placed by Mistake</option>
            <option value="Stock Out of Stock / Unacceptable Lead Time">Stock Unavailable / Yard Dispatch Delay</option>
            <option value="Other Commercial Reason">Other Commercial / Logistics Reason</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:6px;">Admin Remarks / Field Notes</label>
          <textarea id="cancel-notes" class="form-input" rows="3" placeholder="Enter details regarding advance token refund or re-booking timeline..." style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:12px; box-sizing:border-box;"></textarea>
        </div>

        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 12px; font-size:12px; color:#991b1b; display:flex; gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex:none; margin-top:2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Cancelling this order will mark status as cancelled and return all allocated machinery and implements back to available inventory.</span>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:6px;">
          <button type="button" class="btn btn--secondary btn-cancel-dismiss" style="padding:8px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">Keep Order</button>
          <button type="submit" class="btn btn--danger" style="padding:8px 16px; border-radius:8px; background:#dc2626; color:#fff; border:none; cursor:pointer; font-weight:600;">Confirm Cancellation</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  try { overlay.showModal(); } catch {}
  gsap.fromTo(overlay.querySelector('.order-action-dialog'), { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25 });

  function close() {
    gsap.to(overlay, { opacity: 0, duration: 0.15, onComplete: () => {
      try { overlay.close(); } catch {}
      overlay.remove();
    } });
  }

  overlay.querySelector('.btn-close-action')?.addEventListener('click', close);
  overlay.querySelector('.btn-cancel-dismiss')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#cancel-order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let reason = (overlay.querySelector('#cancel-reason-select') as HTMLSelectElement).value;
    let notes = (overlay.querySelector('#cancel-notes') as HTMLTextAreaElement).value.trim();

    order.status = 'cancelled';
    order.cancellationReason = notes ? `${reason}: ${notes}` : reason;
    order.history = order.history || [];
    order.history.push({
      at: Date.now(),
      to: 'cancelled',
      by: `Admin (${reason})`
    });

    // If order had an advance, flag it
    if (order.paid) {
      order.paid = false;
    }

    showToast(`Order ${order.number} cancelled. Reason: ${reason}`, { ico: 'close' });
    close();
    onDone();
  });
}

// 2. LOGISTICS & TRANSPORTER UPDATER MODAL
export function openEditLogisticsModal(order: any, onDone: () => void) {
  let existing = document.getElementById('order-action-modal-overlay');
  if (existing) existing.remove();

  let overlay = document.createElement('dialog');
  overlay.id = 'order-action-modal-overlay';
  overlay.className = 'gst-inv-overlay';

  overlay.innerHTML = `
    <div class="order-action-dialog" style="max-width: 540px;">
      <header class="order-action-head">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="background:#e0f2fe; color:#0284c7; width:36px; height:36px; border-radius:10px; display:grid; place-items:center; font-weight:700;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700; color:#1e293b;">Update Shipment & Logistics</h3>
            <small style="color:#64748b;">Order ${escapeHtml(order.number)} &bull; Heavy Transporter & E-Way Bill</small>
          </div>
        </div>
        <button type="button" class="btn-close-action" style="background:none; border:none; cursor:pointer; color:#64748b;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </header>

      <form id="edit-logistics-form" style="padding:18px 20px; display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Transporter Partner *</label>
          <select id="log-transporter" class="form-input" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;" required>
            <option value="VRL Logistics (Flatbed Fleet)" ${order.transporterName?.includes('VRL') ? 'selected' : ''}>VRL Logistics (Heavy Machinery Flatbed)</option>
            <option value="ARC Transporters (Tractor Low-Bed)" ${order.transporterName?.includes('ARC') ? 'selected' : ''}>ARC Transporters (Low-Bed Hydraulic Carrier)</option>
            <option value="ABT Parcel Express" ${order.transporterName?.includes('ABT') ? 'selected' : ''}>ABT Parcel Express (Spares & Implements)</option>
            <option value="KPN Heavy Haulers" ${order.transporterName?.includes('KPN') ? 'selected' : ''}>KPN Heavy Haulers (Multi-axle Trailer)</option>
            <option value="Direct Farm Delivery (Vels Yard Truck)" ${order.transporterName?.includes('Direct') ? 'selected' : ''}>Direct Farm Delivery (Vels Dedicated Yard Truck)</option>
            <option value="Customer / Dealer Self-Pick" ${order.transporterName?.includes('Self') ? 'selected' : ''}>Customer / Dealer Self-Pick at Coimbatore Yard</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Lorry Bilty / LR Number *</label>
            <input type="text" id="log-lr" value="${escapeHtml(order.lrNumber || order.tracking || '')}" placeholder="e.g. LR-VRL-84291" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; box-sizing:border-box;" required />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Vehicle Number</label>
            <input type="text" id="log-vehicle" value="${escapeHtml(order.vehicleNumber || 'TN-38-BZ-4921')}" placeholder="e.g. TN-38-BZ-4921" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; box-sizing:border-box;" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">E-Way Bill Number</label>
            <input type="text" id="log-eway" value="${escapeHtml(order.ewayBillNumber || '')}" placeholder="e.g. 2418 9032 8841" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Driver Mobile Number</label>
            <input type="text" id="log-driver" value="${escapeHtml(order.driverPhone || '')}" placeholder="e.g. +91 98421 77201" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; box-sizing:border-box;" />
          </div>
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Dispatch Yard / Hub</label>
          <select id="log-yard" class="form-input" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;">
            <option value="dc">Coimbatore Central Machinery Depot & Yard (HQ)</option>
            <option value="madurai">Madurai Regional Spares Hub</option>
            <option value="trichy">Trichy Delta Haulage Yard</option>
          </select>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
          <button type="button" class="btn btn--secondary btn-log-dismiss" style="padding:8px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">Cancel</button>
          <button type="submit" class="btn btn--primary" style="padding:8px 18px; border-radius:8px; background:#0284c7; color:#fff; border:none; cursor:pointer; font-weight:600;">Save Logistics Details</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  try { overlay.showModal(); } catch {}
  gsap.fromTo(overlay.querySelector('.order-action-dialog'), { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25 });

  function close() {
    gsap.to(overlay, { opacity: 0, duration: 0.15, onComplete: () => {
      try { overlay.close(); } catch {}
      overlay.remove();
    } });
  }

  overlay.querySelector('.btn-close-action')?.addEventListener('click', close);
  overlay.querySelector('.btn-log-dismiss')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#edit-logistics-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    order.transporterName = (overlay.querySelector('#log-transporter') as HTMLSelectElement).value;
    order.carrier = order.transporterName;
    order.lrNumber = (overlay.querySelector('#log-lr') as HTMLInputElement).value.trim();
    order.tracking = order.lrNumber;
    order.vehicleNumber = (overlay.querySelector('#log-vehicle') as HTMLInputElement).value.trim();
    order.ewayBillNumber = (overlay.querySelector('#log-eway') as HTMLInputElement).value.trim();
    order.driverPhone = (overlay.querySelector('#log-driver') as HTMLInputElement).value.trim();

    showToast(`Logistics updated for ${order.number} &bull; ${order.transporterName}`, { ico: 'truck' });
    close();
    onDone();
  });
}

// 3. WARRANTY RETURN / REPLACEMENT MODAL
export function openReturnReplacementModal(order: any, onDone: () => void) {
  let existing = document.getElementById('order-action-modal-overlay');
  if (existing) existing.remove();

  let overlay = document.createElement('dialog');
  overlay.id = 'order-action-modal-overlay';
  overlay.className = 'gst-inv-overlay';

  let linesOptions = (order.lines || []).map((l: any, i: number) => {
    let p = INITIAL_AGRO_PRODUCTS.find(item => item.id === l.productId);
    let name = p?.name || `Product Line #${i + 1}`;
    return `<option value="${l.productId}" data-price="${l.price}" data-max="${l.qty}">${escapeHtml(name)} (Qty: ${l.qty} &bull; ₹${l.price.toLocaleString('en-IN')})</option>`;
  }).join('');

  overlay.innerHTML = `
    <div class="order-action-dialog" style="max-width: 520px;">
      <header class="order-action-head">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="background:#fef3c7; color:#d97706; width:36px; height:36px; border-radius:10px; display:grid; place-items:center; font-weight:700;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700; color:#1e293b;">Warranty Return or Replacement</h3>
            <small style="color:#64748b;">Order ${escapeHtml(order.number)} &bull; Farm Machine Service Protocol</small>
          </div>
        </div>
        <button type="button" class="btn-close-action" style="background:none; border:none; cursor:pointer; color:#64748b;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </header>

      <form id="return-replace-form" style="padding:18px 20px; display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Select Machinery / Part Item *</label>
          <select id="ret-product" class="form-input" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;" required>
            ${linesOptions}
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Request Type *</label>
            <select id="ret-kind" class="form-input" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;">
              <option value="replace">Warranty Exchange / Replacement</option>
              <option value="refund">Commercial Return & Refund</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Quantity to Return</label>
            <input type="number" id="ret-qty" value="1" min="1" max="50" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; box-sizing:border-box;" required />
          </div>
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Reason for Claim *</label>
          <select id="ret-reason-select" class="form-input" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;" required>
            <option value="PTO Spline Size Incompatible with Implement Header">PTO Spline Size Incompatible with Implement Header (Exchange for 6/21 spline)</option>
            <option value="Blade Bolt Thread Defect During Assembly">Rotavator Blade Bolt Thread Defect During Assembly</option>
            <option value="Hydraulic Pump Low Flow Under Field Load">Hydraulic Pump Low Flow Under Field Load (Warranty Inspection)</option>
            <option value="Implement Hitch Category Mismatch (Cat-1 vs Cat-2)">Implement Hitch Category Mismatch (Cat-1 vs Cat-2)</option>
            <option value="Farmer Cancelled Field Demonstration Request">Customer Found Implement Incompatible with Land Terrain</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Field Engineer Notes</label>
          <textarea id="ret-notes" rows="2" placeholder="Describe inspection findings or replacement dispatch instructions..." style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:12px; box-sizing:border-box;"></textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
          <button type="button" class="btn btn--secondary btn-ret-dismiss" style="padding:8px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">Cancel</button>
          <button type="submit" class="btn btn--primary" style="padding:8px 18px; border-radius:8px; background:#d97706; color:#fff; border:none; cursor:pointer; font-weight:600;">Create Warranty Return Ticket</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  try { overlay.showModal(); } catch {}
  gsap.fromTo(overlay.querySelector('.order-action-dialog'), { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25 });

  function close() {
    gsap.to(overlay, { opacity: 0, duration: 0.15, onComplete: () => {
      try { overlay.close(); } catch {}
      overlay.remove();
    } });
  }

  overlay.querySelector('.btn-close-action')?.addEventListener('click', close);
  overlay.querySelector('.btn-ret-dismiss')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#return-replace-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let prodSelect = overlay.querySelector('#ret-product') as HTMLSelectElement;
    let prodId = prodSelect.value;
    let selectedOption = prodSelect.selectedOptions[0];
    let price = Number(selectedOption.dataset.price || 5000);
    let qty = Number((overlay.querySelector('#ret-qty') as HTMLInputElement).value || 1);
    let reason = (overlay.querySelector('#ret-reason-select') as HTMLSelectElement).value;
    let notes = (overlay.querySelector('#ret-notes') as HTMLTextAreaElement).value.trim();

    let newReturn: any = {
      id: `ret-agro-${Date.now().toString(36)}`,
      number: `RMA-${Math.floor(4422 + Math.random() * 900)}`,
      orderId: order.id,
      customerId: order.customerId,
      productId: prodId,
      qty,
      refund: price * qty,
      status: 'requested',
      createdAt: Date.now(),
      reason: notes ? `${reason} (Note: ${notes})` : reason,
    };

    store.returns = store.returns || [];
    store.returns.unshift(newReturn);

    showToast(`Warranty Return ticket generated! Added to Returns board`, { ico: 'box' });
    close();
    onDone();
    (window as any).navigateTo?.('/orders/returns');
  });
}

// 4. DIRECT STATUS CHANGE MODAL
export function openUpdateStatusModal(order: any, onDone: () => void) {
  let existing = document.getElementById('order-action-modal-overlay');
  if (existing) existing.remove();

  let overlay = document.createElement('dialog');
  overlay.id = 'order-action-modal-overlay';
  overlay.className = 'gst-inv-overlay';

  overlay.innerHTML = `
    <div class="order-action-dialog" style="max-width: 480px;">
      <header class="order-action-head">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="background:#f0fdf4; color:#15803d; width:36px; height:36px; border-radius:10px; display:grid; place-items:center; font-weight:700;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700; color:#1e293b;">Change Machinery Dispatch Status</h3>
            <small style="color:#64748b;">Order ${escapeHtml(order.number)} &bull; Current: <strong>${escapeHtml(order.status)}</strong></small>
          </div>
        </div>
        <button type="button" class="btn-close-action" style="background:none; border:none; cursor:pointer; color:#64748b;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </header>

      <form id="update-status-form" style="padding:18px 20px; display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Target Stage *</label>
          <select id="target-status-select" class="form-input" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px;" required>
            <option value="new" ${order.status === 'new' ? 'selected' : ''}>1. Booking Confirmed (Token Advance Received)</option>
            <option value="picking" ${order.status === 'picking' ? 'selected' : ''}>2. PDI Inspection (Tractor Engine & Hydraulic Testing)</option>
            <option value="packed" ${order.status === 'packed' ? 'selected' : ''}>3. PDI Cleared & Staged for Flatbed Truck</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>4. In Transit (Heavy Logistics / Flatbed Truck)</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>5. Delivered & Field Demo Completed</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Inspector / Supervisor Name</label>
          <input type="text" id="status-by" value="Chief PDI Inspector" placeholder="e.g. Chief PDI Inspector" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; box-sizing:border-box;" />
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
          <button type="button" class="btn btn--secondary btn-status-dismiss" style="padding:8px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">Cancel</button>
          <button type="submit" class="btn btn--primary" style="padding:8px 18px; border-radius:8px; background:#166534; color:#fff; border:none; cursor:pointer; font-weight:600;">Update Status</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  try { overlay.showModal(); } catch {}
  gsap.fromTo(overlay.querySelector('.order-action-dialog'), { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25 });

  function close() {
    gsap.to(overlay, { opacity: 0, duration: 0.15, onComplete: () => {
      try { overlay.close(); } catch {}
      overlay.remove();
    } });
  }

  overlay.querySelector('.btn-close-action')?.addEventListener('click', close);
  overlay.querySelector('.btn-status-dismiss')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#update-status-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let newStatus = (overlay.querySelector('#target-status-select') as HTMLSelectElement).value;
    let by = (overlay.querySelector('#status-by') as HTMLInputElement).value.trim() || 'Admin';

    order.status = newStatus;
    order.history = order.history || [];
    order.history.push({
      at: Date.now(),
      to: newStatus,
      by
    });

    showToast(`Order ${order.number} moved to ${newStatus.toUpperCase()}`, { ico: 'check' });
    close();
    onDone();
  });
}
