// Vels Agro Enterprise — All Reviews & Moderation Subtab (Section 22)
// Customer & Farmer Reviews, Ratings, Field Photos, Moderation Workflow, & Official Replies

import {
  ReviewItem,
  getStoredReviews,
  saveStoredReviews,
} from '../reviews-data';
import { showToast, escapeHtml } from '../../../main';
import { gsap, motionDuration, animateCounter } from '../../../core/motion';

let reviews: ReviewItem[] = getStoredReviews();
let activeFilter: 'all' | 'pending' | 'approved' | 'flagged' | '5star' = 'all';
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

function renderStarsHtml(rating: number): string {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      html += `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
      html += `<svg class="star-empty" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return `<span class="star-rating" title="${rating} of 5 Stars">${html}</span>`;
}

function calculateKPIs() {
  const total = reviews.length;
  const pending = reviews.filter((r) => r.status === 'pending').length;
  const approved = reviews.filter((r) => r.status === 'approved').length;
  const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = total > 0 ? (sumRating / total).toFixed(1) : '5.0';
  const farmerReviews = reviews.filter((r) => r.verifiedFarmer).length;

  return {
    total,
    avgRating,
    pending,
    approved,
    farmerReviews,
  };
}

export function renderAllReviewsSubtab(container: HTMLElement): void {
  activeContainer = container;
  reviews = getStoredReviews();

  container.innerHTML = `
    <div class="reviews-container">
      <!-- Header -->
      <div class="reviews-header">
        <div class="reviews-header__title-group">
          <h2>
            <span>⭐ Customer Reviews & Moderation</span>
            <span class="tag" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:12px; font-weight:700;">Section 22</span>
          </h2>
          <p>Moderate customer & farmer reviews, inspect field tractor performance testimonials, verify landholding credentials, and publish official responses.</p>
        </div>
        <div class="reviews-header__actions">
          <button type="button" class="btn btn--ghost" id="reviews-export-csv-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Reviews CSV
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="reviews-kpi-grid">
        ${renderKPIsHtml()}
      </div>

      <!-- Toolbar -->
      <div class="reviews-toolbar">
        <div class="reviews-filters" id="reviews-filter-pills">
          ${renderFilterPillsHtml()}
        </div>
        <div class="reviews-search-box">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="reviews-search-input" placeholder="Search customer, machine, village..." value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <!-- Reviews Feed List -->
      <div class="reviews-list-grid" id="reviews-feed-container">
        ${renderReviewsListHtml()}
      </div>
    </div>

    <!-- Modals Container -->
    <div id="reviews-modals"></div>
  `;

  // Animate in
  const mainWrapper = container.querySelector('.reviews-container');
  if (mainWrapper) {
    requestAnimationFrame(() => mainWrapper.classList.add('is-ready'));
  }

  animateCards(container);
  bindEvents(container);
}

function renderKPIsHtml(): string {
  const kpi = calculateKPIs();
  return `
    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>Average Customer Rating</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: #f59e0b; display: flex; align-items: center; gap: 6px;">
        <span class="kpi-num-rating">${kpi.avgRating}</span> <span style="font-size: 16px; color: var(--muted); font-weight: 500;">/ 5.0</span>
      </div>
      <div class="reviews-kpi-card__meta">
        <span>Based on ${kpi.total} verified field reviews</span>
      </div>
    </div>

    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>Pending Moderation</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: ${kpi.pending > 0 ? '#b45309' : '#059669'};">
        <span class="kpi-num-pending">${kpi.pending}</span> Reviews
      </div>
      <div class="reviews-kpi-card__meta">
        <span>Awaiting administrator approval</span>
      </div>
    </div>

    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>Published Online</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: #059669;">
        <span class="kpi-num-approved">${kpi.approved}</span> Live
      </div>
      <div class="reviews-kpi-card__meta">
        <span>Displayed on app & catalog</span>
      </div>
    </div>

    <div class="reviews-kpi-card">
      <div class="reviews-kpi-card__label">
        <span>Verified Farmer Base</span>
        <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div class="reviews-kpi-card__value" style="color: #2563eb;">
        <span class="kpi-num-farmer">${kpi.farmerReviews}</span> Reviews
      </div>
      <div class="reviews-kpi-card__meta">
        <span>Backed by landholding & Tahsildar Patta</span>
      </div>
    </div>
  `;
}

function renderFilterPillsHtml(): string {
  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    flagged: reviews.filter((r) => r.status === 'flagged').length,
    fiveStar: reviews.filter((r) => r.rating === 5).length,
  };

  return `
    <button type="button" class="reviews-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
      All Reviews <span class="count">${counts.all}</span>
    </button>
    <button type="button" class="reviews-filter-pill ${activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
      ⏳ Pending Moderation <span class="count">${counts.pending}</span>
    </button>
    <button type="button" class="reviews-filter-pill ${activeFilter === 'approved' ? 'active' : ''}" data-filter="approved">
      ✓ Approved <span class="count">${counts.approved}</span>
    </button>
    <button type="button" class="reviews-filter-pill ${activeFilter === 'flagged' ? 'active' : ''}" data-filter="flagged">
      ⚠️ Flagged <span class="count">${counts.flagged}</span>
    </button>
    <button type="button" class="reviews-filter-pill ${activeFilter === '5star' ? 'active' : ''}" data-filter="5star">
      ⭐ 5-Star Reviews <span class="count">${counts.fiveStar}</span>
    </button>
  `;
}

function renderReviewsListHtml(): string {
  let filtered = [...reviews];

  if (activeFilter === 'pending') {
    filtered = filtered.filter((r) => r.status === 'pending');
  } else if (activeFilter === 'approved') {
    filtered = filtered.filter((r) => r.status === 'approved');
  } else if (activeFilter === 'flagged') {
    filtered = filtered.filter((r) => r.status === 'flagged');
  } else if (activeFilter === '5star') {
    filtered = filtered.filter((r) => r.rating === 5);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    return `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 48px 24px; text-align: center; color: var(--muted);">
        <p style="font-size: 15px; font-weight: 700; margin: 0 0 6px 0;">No reviews matching current criteria</p>
        <p style="font-size: 13px; margin: 0;">Try selecting a different filter pill or adjusting your search keywords.</p>
      </div>
    `;
  }

  return filtered
    .map((r) => {
      const initials = r.customerName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');

      const statusBadge =
        r.status === 'approved'
          ? `<span class="review-status-pill review-status--approved">✓ Live on Store</span>`
          : r.status === 'pending'
          ? `<span class="review-status-pill review-status--pending">⏳ Pending Moderation</span>`
          : r.status === 'flagged'
          ? `<span class="review-status-pill review-status--flagged">⚠️ Flagged For Action</span>`
          : `<span class="review-status-pill review-status--rejected">✕ Declined</span>`;

      return `
        <div class="review-item-card" data-review-id="${r.id}">
          <!-- Top Row -->
          <div class="review-card__top">
            <div class="review-card__author-info">
              <div class="review-card__avatar">${escapeHtml(initials)}</div>
              <div class="review-card__author-meta">
                <div class="review-card__author-name">
                  <span>${escapeHtml(r.customerName)}</span>
                  ${
                    r.verifiedFarmer
                      ? `<span class="badge--verified-farmer" title="Agricultural Landholding Verified">🌾 Verified Farmer ${r.landholdingAcres ? `(${r.landholdingAcres} Ac)` : ''}</span>`
                      : ''
                  }
                  ${
                    r.verifiedBuyer
                      ? `<span class="badge--verified-buyer" title="Verified Machinery Purchase">✓ Verified Buyer</span>`
                      : ''
                  }
                  ${
                    r.customerType === 'dealer'
                      ? `<span class="badge--verified-dealer">🏪 Authorized Dealer</span>`
                      : ''
                  }
                </div>
                <div class="review-card__author-sub">
                  <span>📍 ${escapeHtml(r.location)}</span>
                  <span>•</span>
                  <span>📅 ${formatTimestamp(r.date)}</span>
                </div>
              </div>
            </div>

            <!-- Product pill & Status -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <div class="review-card__product-pill">
                <img src="${r.productImage}" alt="${escapeHtml(r.productName)}" class="review-card__product-thumb" />
                <span>🚜 ${escapeHtml(r.productName)}</span>
              </div>
              ${statusBadge}
            </div>
          </div>

          <!-- Rating Stars & Review Content -->
          <div class="review-card__content">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${renderStarsHtml(r.rating)}
              <h4 class="review-card__headline">${escapeHtml(r.title)}</h4>
            </div>
            <p class="review-card__body-text">${escapeHtml(r.comment)}</p>

            ${
              r.tags && r.tags.length > 0
                ? `<div class="review-card__tags">
                    ${r.tags.map((t) => `<span class="review-card__tag">#${escapeHtml(t)}</span>`).join('')}
                   </div>`
                : ''
            }

            ${
              r.photos && r.photos.length > 0
                ? `<div class="review-card__photos-grid">
                    ${r.photos
                      .map(
                        (img) =>
                          `<img src="${img}" alt="Field review attachment" class="review-photo-thumb" data-full-src="${img}" />`
                      )
                      .join('')}
                   </div>`
                : ''
            }

            <!-- Official Admin Reply if present -->
            ${
              r.adminReply
                ? `
                <div class="review-card__admin-reply-box">
                  <div class="admin-reply__header">
                    <span class="admin-reply__badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Vels Agro Official Response
                    </span>
                    <span>${formatTimestamp(r.adminReply.date)}</span>
                  </div>
                  <p class="admin-reply__text">"${escapeHtml(r.adminReply.replyText)}"</p>
                  <div style="font-size: 11px; color: #15803d; font-weight: 600;">— ${escapeHtml(r.adminReply.author)} (${escapeHtml(r.adminReply.role)})</div>
                </div>
                `
                : ''
            }
          </div>

          <!-- Footer Moderation Actions -->
          <div class="review-card__footer">
            <div class="review-card__helpful-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              <span>${r.helpfulCount} farmers found this review helpful</span>
            </div>

            <div class="review-card__moderation-btns">
              ${
                r.status !== 'approved'
                  ? `<button type="button" class="btn-mod btn-mod--approve btn-approve-review" data-id="${r.id}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Approve & Publish
                    </button>`
                  : ''
              }
              ${
                r.status !== 'rejected'
                  ? `<button type="button" class="btn-mod btn-mod--reject btn-reject-review" data-id="${r.id}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Reject
                    </button>`
                  : ''
              }
              ${
                r.status !== 'flagged'
                  ? `<button type="button" class="btn-mod btn-mod--flag btn-flag-review" data-id="${r.id}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      Flag
                    </button>`
                  : ''
              }
              <button type="button" class="btn-mod btn-mod--reply btn-reply-review" data-id="${r.id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${r.adminReply ? 'Edit Reply' : 'Admin Reply'}
              </button>
              <button type="button" class="btn-mod btn-mod--delete btn-delete-review" data-id="${r.id}" title="Permanently delete review">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function animateCards(container: HTMLElement): void {
  // Animate KPI counters
  const kpi = calculateKPIs();
  const ratingEl = container.querySelector<HTMLElement>('.kpi-num-rating');
  if (ratingEl) {
    animateCounter(ratingEl, Number(kpi.avgRating), (v) => v.toFixed(1), { duration: 0.8, from: 1 });
  }
  const pendingEl = container.querySelector<HTMLElement>('.kpi-num-pending');
  if (pendingEl) {
    animateCounter(pendingEl, kpi.pending, (v) => String(Math.round(v)), { duration: 0.8 });
  }
  const approvedEl = container.querySelector<HTMLElement>('.kpi-num-approved');
  if (approvedEl) {
    animateCounter(approvedEl, kpi.approved, (v) => String(Math.round(v)), { duration: 0.8 });
  }
  const farmerEl = container.querySelector<HTMLElement>('.kpi-num-farmer');
  if (farmerEl) {
    animateCounter(farmerEl, kpi.farmerReviews, (v) => String(Math.round(v)), { duration: 0.8 });
  }

  // Animate cards entry
  const cards = container.querySelectorAll('.review-item-card');
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
  // Filters
  container.querySelectorAll<HTMLButtonElement>('#reviews-filter-pills .reviews-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter as any;
      const feed = container.querySelector('#reviews-feed-container');
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
  const searchInput = container.querySelector<HTMLInputElement>('#reviews-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      const feed = container.querySelector('#reviews-feed-container');
      if (feed) {
        feed.innerHTML = renderReviewsListHtml();
        bindActionButtons(container);
      }
    });
  }

  // Export CSV
  const exportBtn = container.querySelector('#reviews-export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportReviewsCsv();
    });
  }

  bindActionButtons(container);
}

function bindActionButtons(container: HTMLElement): void {
  // Approve
  container.querySelectorAll<HTMLButtonElement>('.btn-approve-review').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const rev = reviews.find((r) => r.id === id);
      if (rev) {
        rev.status = 'approved';
        saveStoredReviews(reviews);
        showToast(`Review by ${rev.customerName} approved and published to store!`);
        updateView();
      }
    });
  });

  // Reject
  container.querySelectorAll<HTMLButtonElement>('.btn-reject-review').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const rev = reviews.find((r) => r.id === id);
      if (rev) {
        openRejectModal(rev);
      }
    });
  });

  // Flag
  container.querySelectorAll<HTMLButtonElement>('.btn-flag-review').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const rev = reviews.find((r) => r.id === id);
      if (rev) {
        rev.status = 'flagged';
        saveStoredReviews(reviews);
        showToast(`Review #${id} flagged for service department inspection.`);
        updateView();
      }
    });
  });

  // Reply
  container.querySelectorAll<HTMLButtonElement>('.btn-reply-review').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const rev = reviews.find((r) => r.id === id);
      if (rev) {
        openReplyModal(rev);
      }
    });
  });

  // Delete
  container.querySelectorAll<HTMLButtonElement>('.btn-delete-review').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const rev = reviews.find((r) => r.id === id);
      if (rev && confirm(`Are you sure you want to permanently delete review by ${rev.customerName}?`)) {
        reviews = reviews.filter((r) => r.id !== id);
        saveStoredReviews(reviews);
        showToast('Review permanently deleted.');
        updateView();
      }
    });
  });

  // Lightbox for photos
  container.querySelectorAll<HTMLImageElement>('.review-photo-thumb').forEach((img) => {
    img.addEventListener('click', () => {
      const fullSrc = img.dataset.fullSrc;
      if (fullSrc) {
        openImageLightbox(fullSrc);
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderAllReviewsSubtab(activeContainer);
}

function openReplyModal(rev: ReviewItem): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Post Official Response to ${escapeHtml(rev.customerName)}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <!-- Original Review Summary -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 13px;">
        <div style="font-weight: 700; color: var(--text); margin-bottom: 4px;">"${escapeHtml(rev.title)}" (${rev.rating}★)</div>
        <div style="color: var(--muted); font-size: 12px; line-height: 1.4;">${escapeHtml(rev.comment)}</div>
      </div>

      <form id="reviews-reply-form">
        <div class="promo-form-grid">
          <div class="promo-field">
            <label>Responder Name *</label>
            <input type="text" id="rep-author" value="${escapeHtml(rev.adminReply?.author || 'Vels Agro Support Division')}" required />
          </div>
          <div class="promo-field">
            <label>Designation / Role *</label>
            <input type="text" id="rep-role" value="${escapeHtml(rev.adminReply?.role || 'Customer Experience & Agronomy Team')}" required />
          </div>
          <div class="promo-field full">
            <label>Official Signed Response *</label>
            <textarea id="rep-text" rows="4" placeholder="Dear farmer, thank you for choosing Vels Agro Machinery..." required>${escapeHtml(rev.adminReply?.replyText || '')}</textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="reviews-reply-form" class="btn btn--primary">
        Publish Official Reply
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

  const form = modal.querySelector<HTMLFormElement>('#reviews-reply-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = (modal.querySelector('#rep-author') as HTMLInputElement).value.trim();
      const role = (modal.querySelector('#rep-role') as HTMLInputElement).value.trim();
      const replyText = (modal.querySelector('#rep-text') as HTMLTextAreaElement).value.trim();

      rev.adminReply = {
        author,
        role,
        replyText,
        date: Date.now(),
      };
      if (rev.status === 'pending') {
        rev.status = 'approved';
      }

      saveStoredReviews(reviews);
      modal.close();
      modal.remove();
      showToast(`Official reply published for ${rev.customerName}!`);
      updateView();
    });
  }
}

function openRejectModal(rev: ReviewItem): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Decline / Reject Review
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <p style="font-size: 13px; color: var(--muted); margin: 0 0 12px 0;">
        Declining this review will hide it from the public storefront while retaining the record for internal audits.
      </p>
      <div class="promo-field full">
        <label>Reason for Rejection *</label>
        <select id="rej-reason" class="promo-select" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;">
          <option value="Non-product delivery issue (routed to logistics support)">Non-product delivery issue (routed to logistics support)</option>
          <option value="Contains sensitive personal contact information">Contains sensitive personal contact information</option>
          <option value="Spam / Advertisements / Competitor promotional link">Spam / Advertisements / Competitor promotional link</option>
          <option value="Unverified purchase / Duplicate account">Unverified purchase / Duplicate account</option>
          <option value="Other grievance resolved directly via phone">Other grievance resolved directly via phone</option>
        </select>
      </div>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="button" class="btn btn--primary" id="btn-confirm-reject" style="background: #dc2626; border-color: #dc2626;">
        Confirm Rejection
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

  const confirmBtn = modal.querySelector('#btn-confirm-reject');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const reason = (modal.querySelector('#rej-reason') as HTMLSelectElement).value;
      rev.status = 'rejected';
      rev.rejectionReason = reason;
      saveStoredReviews(reviews);
      modal.close();
      modal.remove();
      showToast(`Review by ${rev.customerName} declined.`);
      updateView();
    });
  }
}

function openImageLightbox(src: string): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>🌾 Field Photo Attachment</h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body" style="padding: 10px; text-align: center;">
      <img src="${src}" alt="Field attachment full preview" style="max-width: 100%; max-height: 70vh; border-radius: 10px; object-fit: contain;" />
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Close</button>
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
}

function exportReviewsCsv(): void {
  const headers = ['Review ID', 'Customer Name', 'Type', 'Location', 'Verified Farmer', 'Landholding (Acres)', 'Product Name', 'Category', 'Rating', 'Title', 'Comment', 'Status', 'Date', 'Admin Replied'];
  const rows = reviews.map((r) => [
    r.id,
    `"${r.customerName}"`,
    r.customerType,
    `"${r.location}"`,
    r.verifiedFarmer ? 'YES' : 'NO',
    r.landholdingAcres || '',
    `"${r.productName}"`,
    `"${r.productCategory}"`,
    r.rating,
    `"${r.title}"`,
    `"${r.comment.replace(/"/g, '""')}"`,
    r.status,
    new Date(r.date).toISOString().slice(0, 10),
    r.adminReply ? 'YES' : 'NO',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Vels_Agro_Customer_Reviews_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Reviews directory exported to CSV.');
}
