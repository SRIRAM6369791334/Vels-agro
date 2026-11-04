// Vels Agro Enterprise — Promotional Banners & Featured Machinery Subtab (Section 17 & 19)
// Homepage Banners, Mobile App Carousels, Category Headers & Featured Product Spotlights

import { showToast, escapeHtml } from '../../../main';
import {
  PromotionalBanner,
  getStoredBanners,
  saveStoredBanners,
} from '../promotions-data';
import '../promotions.css';

let banners: PromotionalBanner[] = getStoredBanners();
let activePlacement: 'all' | 'homepage_hero' | 'mobile_app_carousel' | 'category_header' = 'all';
let activeContainer: HTMLElement | null = null;

export function renderBannersSubtab(container: HTMLElement): void {
  activeContainer = container;
  container.innerHTML = `
    <div class="promo-container">
      <!-- Sub-header -->
      <div class="promo-header">
        <div class="promo-header__title-group">
          <h2>
            <span>🎨 Promotional Banners & Featured Products</span>
            <span class="tag" style="background:#f3e8ff; color:#7e22ce; border:1px solid #e9d5ff; font-size:12px; font-weight:700;">Section 17.4 & 19</span>
          </h2>
          <p>Design and deploy high-converting promotional banners, seasonal hero sliders and featured machinery highlights across web and mobile storefronts.</p>
        </div>
        <div class="promo-header__actions">
          <button type="button" class="btn btn--primary" id="promo-new-banner-btn">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Banner
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="promo-kpi-grid">
        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Active Storefront Banners</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #059669;">${banners.filter((b) => b.isActive).length} Live</div>
          <div class="promo-kpi-card__meta">
            <span>Across mobile & web hero sliders</span>
          </div>
        </div>

        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Total Banner Impressions / Clicks</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 15 6 6m-6-6v4.5m0-4.5h4.5M9 9l-6-6m6 6v-4.5M9 9H4.5"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #2563eb;">${banners.reduce((sum, b) => sum + b.clicksCount, 0).toLocaleString()} Clicks</div>
          <div class="promo-kpi-card__meta">
            <span class="ps-trend--up">Avg CTR: 4.8%</span>
          </div>
        </div>

        <div class="promo-kpi-card">
          <div class="promo-kpi-card__label">
            <span>Attributed Tractor Bookings</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div class="promo-kpi-card__value" style="color: #7c3aed;">${banners.reduce((sum, b) => sum + b.conversionsCount, 0)} Inquiries</div>
          <div class="promo-kpi-card__meta">
            <span>Direct demo & quotation conversions</span>
          </div>
        </div>
      </div>

      <!-- Placement Filter Toolbar -->
      <div class="promo-toolbar">
        <div class="promo-filters" id="promo-banner-filter-pills">
          <button type="button" class="promo-filter-pill ${activePlacement === 'all' ? 'active' : ''}" data-placement="all">
            All Placements <span class="count">${banners.length}</span>
          </button>
          <button type="button" class="promo-filter-pill ${activePlacement === 'homepage_hero' ? 'active' : ''}" data-placement="homepage_hero">
            🖥️ Homepage Hero (${banners.filter((b) => b.placement === 'homepage_hero').length})
          </button>
          <button type="button" class="promo-filter-pill ${activePlacement === 'mobile_app_carousel' ? 'active' : ''}" data-placement="mobile_app_carousel">
            📱 Mobile App Carousel (${banners.filter((b) => b.placement === 'mobile_app_carousel').length})
          </button>
          <button type="button" class="promo-filter-pill ${activePlacement === 'category_header' ? 'active' : ''}" data-placement="category_header">
            🏷️ Category Header (${banners.filter((b) => b.placement === 'category_header').length})
          </button>
        </div>
      </div>

      <!-- Banners Cards Grid -->
      <div class="promo-banners-grid" id="promo-banners-grid">
        ${renderBannersHtml()}
      </div>
    </div>

    <!-- Modals Container -->
    <div id="promo-banner-modals"></div>
  `;

  bindEvents(container);
}

function renderBannersHtml(): string {
  let filtered = [...banners];
  if (activePlacement !== 'all') {
    filtered = filtered.filter((b) => b.placement === activePlacement);
  }

  return filtered
    .map(
      (b) => `
    <div class="promo-banner-card" data-banner-id="${b.id}">
      <div class="promo-banner-card__img-wrap">
        <img src="${escapeHtml(b.imageUrl)}" alt="${escapeHtml(b.title)}" loading="lazy" />
        <span class="promo-banner-card__tag">${escapeHtml(b.badgeText)}</span>
        <span class="promo-banner-card__placement">${b.placement.replace(/_/g, ' ')}</span>
      </div>

      <div class="promo-banner-card__body">
        <h3 class="promo-banner-card__title">${escapeHtml(b.title)}</h3>
        <p class="promo-banner-card__subtitle">${escapeHtml(b.subtitle)}</p>
        
        <div style="font-size: 11px; color: var(--muted); display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <span>Target: <code style="font-family: var(--mono);">${escapeHtml(b.targetUrl)}</code></span>
          <span style="font-weight: 600; color: var(--primary);">CTA: ${escapeHtml(b.ctaText)} &rarr;</span>
        </div>
      </div>

      <div class="promo-banner-card__footer">
        <div class="promo-banner-card__stats">
          <span>👁️ <strong>${b.clicksCount}</strong> clicks</span>
          <span>🎯 <strong>${b.conversionsCount}</strong> inquiries</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <label class="promo-switch">
            <input type="checkbox" class="promo-toggle-banner-active" data-id="${b.id}" ${b.isActive ? 'checked' : ''} />
            <span class="promo-slider"></span>
          </label>
          <button type="button" class="btn btn--ghost btn--sm promo-btn-preview-banner" data-id="${b.id}" title="Preview on Mobile Mockup">
            Preview
          </button>
          <button type="button" class="btn btn--ghost btn--sm promo-btn-edit-banner" data-id="${b.id}">
            Edit
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function bindEvents(container: HTMLElement): void {
  // Filter pills
  container.querySelectorAll<HTMLButtonElement>('#promo-banner-filter-pills .promo-filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activePlacement = btn.dataset.placement as any;
      updateView();
    });
  });

  // Create Button
  const createBtn = container.querySelector('#promo-new-banner-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openBannerModal();
    });
  }

  bindCardActions(container);
}

function bindCardActions(container: HTMLElement): void {
  // Toggle
  container.querySelectorAll<HTMLInputElement>('.promo-toggle-banner-active').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.id;
      const b = banners.find((item) => item.id === id);
      if (b) {
        b.isActive = checkbox.checked;
        saveStoredBanners(banners);
        showToast(`Banner "${b.title}" is now ${b.isActive ? 'Live' : 'Hidden'}.`);
      }
    });
  });

  // Edit
  container.querySelectorAll<HTMLButtonElement>('.promo-btn-edit-banner').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const b = banners.find((item) => item.id === id);
      if (b) {
        openBannerModal(b);
      }
    });
  });

  // Preview
  container.querySelectorAll<HTMLButtonElement>('.promo-btn-preview-banner').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const b = banners.find((item) => item.id === id);
      if (b) {
        openBannerPreviewModal(b);
      }
    });
  });
}

function updateView(): void {
  if (!activeContainer) return;
  renderBannersSubtab(activeContainer);
}

function openBannerPreviewModal(b: PromotionalBanner): void {
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        Mobile Storefront Preview — ${escapeHtml(b.title)}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body" style="align-items: center; background: #0f172a; padding: 32px 16px;">
      <!-- Mobile Mockup Frame -->
      <div style="width: 340px; background: #ffffff; border-radius: 28px; border: 8px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden; color: #111827;">
        <!-- Top Status Bar -->
        <div style="background: #1e293b; color: #ffffff; padding: 4px 16px; font-size: 11px; display: flex; justify-content: space-between;">
          <span>9:41</span>
          <span>Vels Agro Mobile</span>
          <span>5G 100%</span>
        </div>
        
        <!-- App Header Bar -->
        <div style="padding: 12px 16px; background: #047857; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 14px;">🌾 Vels Agro Direct</strong>
          <span style="font-size: 11px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">Coimbatore Hub</span>
        </div>

        <!-- Rendered Live Banner in App -->
        <div style="position: relative; width: 100%; height: 180px; overflow: hidden;">
          <img src="${escapeHtml(b.imageUrl)}" style="width: 100%; height: 100%; object-fit: cover;" alt="Banner Preview" />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%);"></div>
          <div style="position: absolute; top: 10px; left: 12px;">
            <span style="background: #f59e0b; color: #000; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">${escapeHtml(b.badgeText)}</span>
          </div>
          <div style="position: absolute; bottom: 12px; left: 12px; right: 12px; color: #ffffff;">
            <h4 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 800; line-height: 1.2;">${escapeHtml(b.title)}</h4>
            <p style="margin: 0 0 6px 0; font-size: 10px; opacity: 0.9; line-height: 1.3;">${escapeHtml(b.subtitle)}</p>
            <button type="button" style="background: #10b981; color: #ffffff; border: none; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">
              ${escapeHtml(b.ctaText)} &rarr;
            </button>
          </div>
        </div>

        <!-- Sample Mockup Products Below Banner -->
        <div style="padding: 14px;">
          <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px;">Featured Machinery This Season</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px;">
              <strong>Vels Bull 55HP 4WD</strong>
              <div style="color: #059669; font-weight: 700;">₹8.45 L</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px;">
              <strong>7ft HD Rotavator</strong>
              <div style="color: #059669; font-weight: 700;">₹1.15 L</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--primary" data-close>Done Previewing</button>
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

function openBannerModal(existing?: PromotionalBanner): void {
  const isEdit = !!existing;
  const modal = document.createElement('dialog');
  modal.className = 'promo-modal';
  modal.innerHTML = `
    <div class="promo-modal__header">
      <h3>
        <svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
        ${isEdit ? `Edit Banner — ${escapeHtml(existing.title)}` : 'Add Storefront Promotional Banner'}
      </h3>
      <button type="button" class="promo-modal__close" data-close>&times;</button>
    </div>
    <div class="promo-modal__body">
      <form id="promo-banner-form">
        <div class="promo-form-grid">
          <div class="promo-field full">
            <label>Banner Main Headline *</label>
            <input type="text" id="bf-title" value="${existing ? escapeHtml(existing.title) : ''}" placeholder="Harvest Festival Mega Exchange Mela" required />
          </div>
          <div class="promo-field full">
            <label>Sub-heading / Offer Detail *</label>
            <textarea id="bf-sub" rows="2" placeholder="Exchange any old tractor for an advanced Vels Bull 55HP with ₹50,000 Exchange Bonus" required>${existing ? escapeHtml(existing.subtitle) : ''}</textarea>
          </div>
          <div class="promo-field">
            <label>Storefront Placement *</label>
            <select id="bf-placement">
              <option value="homepage_hero" ${existing?.placement === 'homepage_hero' ? 'selected' : ''}>Homepage Hero Slider (Web/Desktop)</option>
              <option value="mobile_app_carousel" ${existing?.placement === 'mobile_app_carousel' ? 'selected' : ''}>Mobile App Carousel</option>
              <option value="category_header" ${existing?.placement === 'category_header' ? 'selected' : ''}>Category Header Banner</option>
              <option value="checkout_popup" ${existing?.placement === 'checkout_popup' ? 'selected' : ''}>Checkout Promotional Interstitial</option>
            </select>
          </div>
          <div class="promo-field">
            <label>Badge Ribbon Tag *</label>
            <input type="text" id="bf-badge" value="${existing ? escapeHtml(existing.badgeText) : ''}" placeholder="🌾 Pongal Special" required />
          </div>
          <div class="promo-field">
            <label>Call to Action (CTA) Button Text *</label>
            <input type="text" id="bf-cta" value="${existing ? escapeHtml(existing.ctaText) : ''}" placeholder="Book Demo Now" required />
          </div>
          <div class="promo-field">
            <label>Destination Target URL *</label>
            <input type="text" id="bf-url" value="${existing ? escapeHtml(existing.targetUrl) : ''}" placeholder="#/products/catalog" required />
          </div>
          <div class="promo-field full">
            <label>High-Resolution Banner Image URL *</label>
            <input type="url" id="bf-img" value="${existing ? escapeHtml(existing.imageUrl) : ''}" placeholder="https://images.unsplash.com/photo-..." required />
          </div>
        </div>
      </form>
    </div>
    <div class="promo-modal__footer">
      <button type="button" class="btn btn--ghost" data-close>Cancel</button>
      <button type="submit" form="promo-banner-form" class="btn btn--primary">
        ${isEdit ? 'Save Changes' : 'Publish Banner to Storefront'}
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

  const form = modal.querySelector<HTMLFormElement>('#promo-banner-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (modal.querySelector('#bf-title') as HTMLInputElement).value.trim();
      const sub = (modal.querySelector('#bf-sub') as HTMLTextAreaElement).value.trim();
      const placement = (modal.querySelector('#bf-placement') as HTMLSelectElement).value as any;
      const badge = (modal.querySelector('#bf-badge') as HTMLInputElement).value.trim();
      const cta = (modal.querySelector('#bf-cta') as HTMLInputElement).value.trim();
      const url = (modal.querySelector('#bf-url') as HTMLInputElement).value.trim();
      const img = (modal.querySelector('#bf-img') as HTMLInputElement).value.trim();

      if (isEdit && existing) {
        existing.title = title;
        existing.subtitle = sub;
        existing.placement = placement;
        existing.badgeText = badge;
        existing.ctaText = cta;
        existing.targetUrl = url;
        existing.imageUrl = img;
        showToast(`Banner "${title}" updated.`);
      } else {
        const newBanner: PromotionalBanner = {
          id: `ban-${Date.now()}`,
          title,
          subtitle: sub,
          placement,
          badgeText: badge,
          ctaText: cta,
          targetUrl: url,
          imageUrl: img,
          featuredMachineryIds: [],
          displayOrder: banners.length + 1,
          isActive: true,
          clicksCount: 0,
          conversionsCount: 0,
        };
        banners.unshift(newBanner);
        showToast(`Banner "${title}" deployed live to storefront!`);
      }

      saveStoredBanners(banners);
      modal.close();
      modal.remove();
      updateView();
    });
  }
}
