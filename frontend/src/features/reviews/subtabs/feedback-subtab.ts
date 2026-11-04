// Vels Agro Enterprise — Customer Feedback & Service Grievances Subtab (Section 22)
// Direct Customer Complaints, Technical Service Requests, WhatsApp Followup & Technician Assignment

import {
  FeedbackTicket,
  getStoredFeedback,
  saveStoredFeedback,
} from '../reviews-data';
import { escapeHtml, showToast } from '../../../main';
import { gsap, motionDuration, animateCounter } from '../../../core/motion';

let feedbackTickets: FeedbackTicket[] = getStoredFeedback();
let activeFilter: 'all' | 'open' | 'in_progress' | 'resolved' = 'all';
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

function calculateFeedbackKPIs() {
  const total = feedbackTickets.length;
  const openCount = feedbackTickets.filter((t) => t.status === 'open').length;
  const inProgressCount = feedbackTickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = feedbackTickets.filter((t) => t.status === 'resolved').length;

  return {
    total,
    openCount,
    inProgressCount,
    resolvedCount,
    resolutionRate: total > 0 ? Math.round((resolvedCount / total) * 100) : 100,
  };
}

export function renderFeedbackSubtab(container: HTMLElement): void {
  activeContainer = container;
  feedbackTickets = getStoredFeedback();

  container.innerHTML = `
    <div class="reviews-container">
      <!-- Header -->
      <div class="reviews-header">
        <div class="reviews-header__title-group">
          <h2>
            <span>🛠️ Customer Feedback & Service Management</span>
            <span class="tag" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:12px; font-weight:700;">Section 22</span>
          </h2>
          <p>Track field service requests, technical performance complaints, assign mobile repair vans, and record customer resolution history.</p>
        </div>
        <div class="reviews-header__actions">
          <button type="button" class="btn btn--primary" id="btn-create-feedback-ticket">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Log Service Feedback
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="reviews-kpi-grid">
        ${renderKPIsHtml()}
      </div>

      <!-- Toolbar -->
      <div class="reviews-toolbar">
        <div class="reviews-filters" id="feedback-filter-pills">
          ${renderFilterPillsHtml()}
        </div>
        <div class="reviews-search-box">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="feedback-search-input" placeholder="Search farmer, VIN, village..." value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <!-- Feedback Ticket List -->
      <div class="feedback-ticket-grid" id="feedback-tickets-container">
        ${renderTicketsListHtml()}
      </div>
    </div>

    <!-- Modals -->
    <div id="feedback-modals"></div>
  `;

  // Animate in
  const mainWrapper = container.querySelector('.reviews-container');
  if (mainWrapper) {
    requestAnimationFrame(() => mainWrapper.classList.add('is-ready'));
  }

  animateTickets(container);
  bindEvents(container);
}

function renderKPIsHtml(): string {
  const kpi = calculateFeedbackKPIs();
  return `
    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>Open Service Tickets</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: ${kpi.openCount > 0 ? '#dc2626' : '#059669'};">
        <span class="kpi-num-open">${kpi.openCount}</span> Open
      </div>
      <div class="reviews-kpi-card__meta">
        <span>Requires field engineer callback</span>
      </div>
    </div>

    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>In Progress / Assigned</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: #2563eb;">
        <span class="kpi-num-prog">${kpi.inProgressCount}</span> Tickets
      </div>
      <div class="reviews-kpi-card__meta">
        <span>Technician dispatched / parts ordered</span>
      </div>
    </div>

    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>Resolution Rate</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: #059669;">
        <span class="kpi-num-res">${kpi.resolutionRate}</span>%
      </div>
      <div class="reviews-kpi-card__meta">
        <span>${kpi.resolvedCount} issues successfully addressed</span>
      </div>
    </div>

    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>Mean Response Time</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: #7c3aed;">
        2.4 Hours
      </div>
      <div class="reviews-kpi-card__meta">
        <span>Direct phone/WhatsApp turnaround</span>
      </div>
    </div>
  `;
}

function renderFilterPillsHtml(): string {
  const counts = {
    all: feedbackTickets.length,
    open: feedbackTickets.filter((t) => t.status === 'open').length,
    in_progress: feedbackTickets.filter((t) => t.status === 'in_progress').length,
    resolved: feedbackTickets.filter((t) => t.status === 'resolved').length,
  };

  return `
    <button type="button" class="reviews-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
      All Feedback <span class="count">${counts.all}</span>
    </button>
    <button type="button" class="reviews-filter-pill ${activeFilter === 'open' ? 'active' : ''}" data-filter="open">
      🔴 Open Tickets <span class="count">${counts.open}</span>
    </button>
    <button type="button" class="reviews-filter-pill ${activeFilter === 'in_progress' ? 'active' : ''}" data-filter="in_progress">
      🔵 In Progress <span class="count">${counts.in_progress}</span>
    </button>
    <button type="button" class="reviews-filter-pill ${activeFilter === 'resolved' ? 'active' : ''}" data-filter="resolved">
      🟢 Resolved <span class="count">${counts.resolved}</span>
    </button>
  `;
}

function renderTicketsListHtml(): string {
  let filtered = [...feedbackTickets];

  if (activeFilter === 'open') {
    filtered = filtered.filter((t) => t.status === 'open');
  } else if (activeFilter === 'in_progress') {
    filtered = filtered.filter((t) => t.status === 'in_progress');
  } else if (activeFilter === 'resolved') {
    filtered = filtered.filter((t) => t.status === 'resolved');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.customerName.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q) ||
        t.village.toLowerCase().includes(q) ||
        t.district.toLowerCase().includes(q) ||
        t.machineModel.toLowerCase().includes(q) ||
        t.serialOrVin.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    return `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 48px 24px; text-align: center; color: var(--muted);">
        <p style="font-size: 15px; font-weight: 700; margin: 0 0 6px 0;">No service tickets in this category</p>
        <p style="font-size: 13px; margin: 0;">Everything is up to date or matching filters.</p>
      </div>
    `;
  }

  return filtered
    .map((t) => {
      const priorityClass =
        t.urgency === 'high'
          ? 'ticket-priority--high'
          : t.urgency === 'medium'
          ? 'ticket-priority--medium'
          : 'ticket-priority--standard';

      const statusBadge =
        t.status === 'resolved'
          ? `<span class="ticket-status-pill ticket-status--resolved">✓ Resolved</span>`
          : t.status === 'in_progress'
          ? `<span class="ticket-status-pill ticket-status--in_progress">⚙️ In Progress</span>`
          : `<span class="ticket-status-pill ticket-status--open">🔴 Open</span>`;

      return `
        <div class="feedback-ticket-card" data-ticket-id="${t.id}">
          <div class="ticket-header">
            <div class="ticket-title-row">
              <span class="ticket-priority-tag ${priorityClass}">${t.urgency}</span>
              <strong style="color: var(--text); font-size: 14px;">${escapeHtml(t.subject)}</strong>
              <code style="font-family: var(--mono); font-size: 11px; background: var(--surface-2); padding: 2px 6px; border-radius: 4px;">${t.id}</code>
            </div>
            ${statusBadge}
          </div>

          <p class="ticket-body">${escapeHtml(t.description)}</p>

          <div style="background: var(--surface-2); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 12px;">
            <div>
              <span style="font-weight: 700; color: var(--text);">👨‍🌾 ${escapeHtml(t.customerName)}</span>
              <span style="color: var(--muted); margin: 0 4px;">•</span>
              <span style="color: var(--muted);">📍 ${escapeHtml(t.village)}, ${escapeHtml(t.district)}</span>
              <span style="color: var(--muted); margin: 0 4px;">•</span>
              <a href="tel:${escapeHtml(t.phone)}" style="color: var(--primary); font-weight: 700;">📞 ${escapeHtml(t.phone)}</a>
            </div>
            <div>
              <span class="tag" style="background:var(--bg); border:1px solid var(--border); font-size:11px;">
                🚜 ${escapeHtml(t.machineModel)} (${escapeHtml(t.serialOrVin)})
              </span>
            </div>
          </div>

          ${
            t.resolutionNotes
              ? `
              <div style="background: #f0fdf4; border-left: 3px solid #16a34a; border-radius: 0 6px 6px 0; padding: 8px 12px; font-size: 12px; color: #166534;">
                <strong>Resolution Action:</strong> ${escapeHtml(t.resolutionNotes)}
                ${t.assignedTechnician ? `<div style="font-size: 11px; margin-top: 2px;">Assigned Field Engineer: <b>${escapeHtml(t.assignedTechnician)}</b></div>` : ''}
              </div>
              `
              : ''
          }

          <div class="ticket-meta-footer">
            <span>Logged: ${formatTimestamp(t.createdDate)}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a href="https://wa.me/${t.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn--ghost btn--sm" style="color: #059669; border-color: #a7f3d0;" title="Send WhatsApp Message">
                💬 WhatsApp
              </a>
              ${
                t.status !== 'resolved'
                  ? `<button type="button" class="btn btn--primary btn--sm btn-resolve-ticket" data-id="${t.id}">
                      Resolve & Update
                    </button>`
                  : `<button type="button" class="btn btn--ghost btn--sm btn-reopen-ticket" data-id="${t.id}">
                      Reopen
                    </button>`
              }
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function animateTickets(container: HTMLElement): void {
  // Animate KPI counters
  const kpi = calculateFeedbackKPIs();
  const openEl = container.querySelector<HTMLElement>('.kpi-num-open');
  if (openEl) animateCounter(openEl, kpi.openCount, (v) => String(Math.round(v)), { duration: 0.8 });
  const progEl = container.querySelector<HTMLElement>('.kpi-num-prog');
  if (progEl) animateCounter(progEl, kpi.inProgressCount, (v) => String(Math.round(v)), { duration: 0.8 });
  const resEl = container.querySelector<HTMLElement>('.kpi-num-res');
  if (resEl) animateCounter(resEl, kpi.resolutionRate, (v) => String(Math.round(v)), { duration: 0.8 });

  // Animate cards entry
  const cards = container.querySelectorAll('.feedback-ticket-card');
  if (cards.length > 0) {
    gsap.fromTo(
      cards,
      { opacity: 0, y: 22, scale: 0.985 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.06,
        duration: motionDuration(0.4),
        ease: 'power3.out',
      }
    );
  }
}

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('#feedback-filter-pills .reviews-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter as any;
      const feed = container.querySelector('#feedback-tickets-container');
      if (feed) {
        gsap.to(feed, {
          opacity: 0,
          y: -4,
          duration: motionDuration(0.12),
          onComplete: () => {
            updateView();
          },
        });
      } else {
        updateView();
      }
    });
  });

  // Search
  const searchInput = container.querySelector<HTMLInputElement>('#feedback-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      const ticketsContainer = container.querySelector('#feedback-tickets-container');
      if (ticketsContainer) {
        ticketsContainer.innerHTML = renderTicketsListHtml();
        bindTicketActions(container);
      }
    });
  }

  // Create Ticket Button
  const createBtn = container.querySelector('#btn-create-feedback-ticket');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateTicketModal();
    });
  }

  bindTicketActions(container);
}

function bindTicketActions(container: HTMLElement): void {
  // Resolve
  container.querySelectorAll<HTMLButtonElement>('.btn-resolve-ticket').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const t = feedbackTickets.find((item) => item.id === id);
      if (t) {
        openResolveModal(t);
      }
    });
  });

  // Reopen
  container.querySelectorAll<HTMLButtonElement>('.btn-reopen-ticket').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const t = feedbackTickets.find((item) => item.id === id);
      if (t) {
        t.status = 'open';
        saveStoredFeedback(feedbackTickets);
        showToast(`Ticket ${t.id} reopened.`);
        updateView();
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderFeedbackSubtab(activeContainer);
}

function openResolveModal(ticket: FeedbackTicket): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Resolve Ticket ${escapeHtml(ticket.id)} — ${escapeHtml(ticket.customerName)}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <form id="resolve-ticket-form">
        <div class="promo-form-grid">
          <div class="promo-field">
            <label>Assigned Service Engineer *</label>
            <input type="text" id="res-tech" value="${escapeHtml(ticket.assignedTechnician || 'M. Sakthivel (Chief Technical Officer)')}" required />
          </div>
          <div class="promo-field">
            <label>Update Status</label>
            <select id="res-status" class="promo-select" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;">
              <option value="resolved" selected>Resolved (Close Ticket)</option>
              <option value="in_progress">In Progress (Part Dispatched)</option>
            </select>
          </div>
          <div class="promo-field full">
            <label>Resolution Action / Technician Notes *</label>
            <textarea id="res-notes" rows="4" placeholder="Detail action taken (e.g. Dispatched field technician, replaced roller bushing, sent video guide)..." required>${escapeHtml(ticket.resolutionNotes || '')}</textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="resolve-ticket-form" class="btn btn--primary">
        Save Resolution & Close
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

  const form = modal.querySelector<HTMLFormElement>('#resolve-ticket-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const tech = (modal.querySelector('#res-tech') as HTMLInputElement).value.trim();
      const status = (modal.querySelector('#res-status') as HTMLSelectElement).value as any;
      const notes = (modal.querySelector('#res-notes') as HTMLTextAreaElement).value.trim();

      ticket.assignedTechnician = tech;
      ticket.status = status;
      ticket.resolutionNotes = notes;
      if (status === 'resolved') {
        ticket.resolvedAt = Date.now();
      }

      saveStoredFeedback(feedbackTickets);
      modal.close();
      modal.remove();
      showToast(`Ticket ${ticket.id} marked as ${status === 'resolved' ? 'Resolved' : 'In Progress'}!`);
      updateView();
    });
  }
}

function openCreateTicketModal(): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Log Customer Feedback / Service Ticket
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <form id="create-ticket-form">
        <div class="promo-form-grid">
          <div class="promo-field">
            <label>Customer Full Name *</label>
            <input type="text" id="nt-name" placeholder="Rangasamy G." required />
          </div>
          <div class="promo-field">
            <label>Phone / WhatsApp Number *</label>
            <input type="tel" id="nt-phone" placeholder="+91 94432 00000" required />
          </div>
          <div class="promo-field">
            <label>Village & Revenue Block *</label>
            <input type="text" id="nt-village" placeholder="Avinashi" required />
          </div>
          <div class="promo-field">
            <label>District & State *</label>
            <input type="text" id="nt-district" placeholder="Tiruppur, Tamil Nadu" required />
          </div>
          <div class="promo-field">
            <label>Machinery Model *</label>
            <input type="text" id="nt-model" placeholder="Vels Bull 45HP 4WD Tractor" required />
          </div>
          <div class="promo-field">
            <label>Serial / VIN Number *</label>
            <input type="text" id="nt-vin" placeholder="TR-45-TPR-8821" required />
          </div>
          <div class="promo-field">
            <label>Category *</label>
            <select id="nt-cat" class="promo-select" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;">
              <option value="service_request">On-farm Service Request</option>
              <option value="part_performance">Implement Part Performance</option>
              <option value="mileage_fuel">Fuel & Mileage Clarification</option>
              <option value="hydraulic_issue">Hydraulic / PTO Issue</option>
              <option value="delivery_feedback">Delivery / Driver Logistics</option>
            </select>
          </div>
          <div class="promo-field">
            <label>Urgency Level *</label>
            <select id="nt-urgency" class="promo-select" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;">
              <option value="high">High (Farm Harvest Blocked)</option>
              <option value="medium" selected>Medium (Need Technician Visit)</option>
              <option value="standard">Standard (General Query)</option>
            </select>
          </div>
          <div class="promo-field full">
            <label>Subject / Grievance Summary *</label>
            <input type="text" id="nt-subject" placeholder="e.g. First 50-hr Service / Rotavator blade alignment" required />
          </div>
          <div class="promo-field full">
            <label>Detailed Description *</label>
            <textarea id="nt-desc" rows="3" placeholder="Explain the customer's observation or service request..." required></textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="create-ticket-form" class="btn btn--primary">
        Create Service Ticket
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

  const form = modal.querySelector<HTMLFormElement>('#create-ticket-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (modal.querySelector('#nt-name') as HTMLInputElement).value.trim();
      const phone = (modal.querySelector('#nt-phone') as HTMLInputElement).value.trim();
      const village = (modal.querySelector('#nt-village') as HTMLInputElement).value.trim();
      const district = (modal.querySelector('#nt-district') as HTMLInputElement).value.trim();
      const model = (modal.querySelector('#nt-model') as HTMLInputElement).value.trim();
      const vin = (modal.querySelector('#nt-vin') as HTMLInputElement).value.trim();
      const cat = (modal.querySelector('#nt-cat') as HTMLSelectElement).value as any;
      const urgency = (modal.querySelector('#nt-urgency') as HTMLSelectElement).value as any;
      const subject = (modal.querySelector('#nt-subject') as HTMLInputElement).value.trim();
      const desc = (modal.querySelector('#nt-desc') as HTMLTextAreaElement).value.trim();

      const newTicket: FeedbackTicket = {
        id: `FB-${Math.floor(100 + Math.random() * 900)}`,
        customerName: name,
        phone,
        village,
        district,
        machineModel: model,
        serialOrVin: vin,
        category: cat,
        subject,
        description: desc,
        urgency,
        status: 'open',
        createdDate: Date.now(),
      };

      feedbackTickets.unshift(newTicket);
      saveStoredFeedback(feedbackTickets);
      modal.close();
      modal.remove();
      showToast(`Service ticket ${newTicket.id} logged for ${name}!`);
      updateView();
    });
  }
}
