// Vels Agro Enterprise — Product Ratings & Machinery Scorecard Subtab (Section 22)
// Per-Machine Rating Breakdown, 1-to-5 Star Distribution Bars, & Farmer CSAT Index

import { ReviewItem, getStoredReviews } from '../reviews-data';
import { escapeHtml, showToast } from '../../../main';
import { gsap, motionDuration, animateCounter } from '../../../core/motion';

interface ProductScorecard {
  id: string;
  name: string;
  category: string;
  image: string;
  reviewsCount: number;
  averageRating: number;
  recommendationRate: number;
  distribution: { [star: number]: number }; // percentage
  highlights: string[];
}

export function renderProductRatingsSubtab(container: HTMLElement): void {
  const reviews: ReviewItem[] = getStoredReviews();
  const scorecards = generateProductScorecards(reviews);

  container.innerHTML = `
    <div class="reviews-container">
      <!-- Header -->
      <div class="reviews-header">
        <div class="reviews-header__title-group">
          <h2>
            <span>🚜 Machinery Ratings & Performance Scorecard</span>
            <span class="tag" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:12px; font-weight:700;">Section 22</span>
          </h2>
          <p>Analyze star distributions, farmer recommendation percentages, and customer sentiment per agricultural implement model.</p>
        </div>
        <div class="reviews-header__actions">
          <button type="button" class="btn btn--ghost" id="btn-export-ratings-summary">
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Scorecard CSV
          </button>
        </div>
      </div>

      <!-- Top Scorecard KPIs -->
      <div class="reviews-kpi-grid">
        <div class="reviews-kpi-card">
          <div class="reviews-kpi-card__label">
            <span>Overall Farmer CSAT</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div class="reviews-kpi-card__value" style="color: #059669;">
            <span class="kpi-num-csat">94.6</span>%
          </div>
          <div class="reviews-kpi-card__meta">
            <span>Positive field satisfaction index</span>
          </div>
        </div>

        <div class="reviews-kpi-card">
          <div class="reviews-kpi-card__label">
            <span>Highest Rated Model</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          </div>
          <div class="reviews-kpi-card__value" style="font-size: 19px; color: #7c3aed;">Vels Bull 45HP</div>
          <div class="reviews-kpi-card__meta">
            <span>5.0 ★ average across 42 farmer reviews</span>
          </div>
        </div>

        <div class="reviews-kpi-card">
          <div class="reviews-kpi-card__label">
            <span>5-Star Share</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div class="reviews-kpi-card__value" style="color: #f59e0b;">
            <span class="kpi-num-5star">78.2</span>%
          </div>
          <div class="reviews-kpi-card__meta">
            <span>Loved by farmers & estate contractors</span>
          </div>
        </div>

        <div class="reviews-kpi-card">
          <div class="reviews-kpi-card__label">
            <span>Implements Cataloged</span>
            <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div class="reviews-kpi-card__value" style="color: #2563eb;">
            <span class="kpi-num-catalog">${scorecards.length}</span> Machines
          </div>
          <div class="reviews-kpi-card__meta">
            <span>Tractors, Rotavators & Sprayers</span>
          </div>
        </div>
      </div>

      <!-- Scorecard Grid -->
      <div class="prod-score-grid">
        ${scorecards.map((sc) => renderScorecardHtml(sc)).join('')}
      </div>
    </div>
  `;

  // Animate in
  const mainWrapper = container.querySelector('.reviews-container');
  if (mainWrapper) {
    requestAnimationFrame(() => mainWrapper.classList.add('is-ready'));
  }

  // Animate KPI counters
  const csatEl = container.querySelector<HTMLElement>('.kpi-num-csat');
  if (csatEl) animateCounter(csatEl, 94.6, (v) => v.toFixed(1), { duration: 0.9, from: 50 });
  const starEl = container.querySelector<HTMLElement>('.kpi-num-5star');
  if (starEl) animateCounter(starEl, 78.2, (v) => v.toFixed(1), { duration: 0.9, from: 30 });
  const catalogEl = container.querySelector<HTMLElement>('.kpi-num-catalog');
  if (catalogEl) animateCounter(catalogEl, scorecards.length, (v) => String(Math.round(v)), { duration: 0.8 });

  // Animate cards
  const cards = container.querySelectorAll('.prod-score-card');
  if (cards.length > 0) {
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.07,
        duration: motionDuration(0.45),
        ease: 'power3.out',
      }
    );
  }

  // Animate progress bars
  container.querySelectorAll<HTMLElement>('.star-dist-row__fill').forEach((bar, i) => {
    const pct = bar.dataset.pct || '0';
    gsap.to(bar, {
      width: `${pct}%`,
      duration: motionDuration(0.85),
      delay: motionDuration(0.15 + (i % 5) * 0.05),
      ease: 'power2.out',
    });
  });

  // Bind Export CSV
  const exportBtn = container.querySelector('#btn-export-ratings-summary');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportScorecardsCsv(scorecards);
    });
  }
}

function renderScorecardHtml(sc: ProductScorecard): string {
  return `
    <div class="prod-score-card">
      <div class="prod-score-card__top">
        <img src="${sc.image}" alt="${escapeHtml(sc.name)}" class="prod-score-card__thumb" />
        <div class="prod-score-card__info">
          <h4>${escapeHtml(sc.name)}</h4>
          <p><span class="tag" style="background:var(--surface-2); font-size:10px;">${escapeHtml(sc.category)}</span> • ${sc.reviewsCount} reviews</p>
        </div>
      </div>

      <div class="prod-score-card__metrics">
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em; margin-bottom: 2px;">Overall Rating</div>
          <div class="prod-score-card__overall-rating">
            <span>${sc.averageRating}</span>
            <span style="color: #f59e0b; font-size: 20px;">★</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em; margin-bottom: 2px;">Farmer Recommendation</div>
          <div style="font-size: 16px; font-weight: 800; color: #059669;">${sc.recommendationRate}%</div>
        </div>
      </div>

      <!-- Star Distribution Bars -->
      <div class="prod-score-card__bars">
        ${[5, 4, 3, 2, 1]
          .map((star) => {
            const pct = sc.distribution[star] || 0;
            return `
            <div class="star-dist-row">
              <span style="width: 24px; font-weight: 700;">${star}★</span>
              <div class="star-dist-row__track">
                <div class="star-dist-row__fill" data-pct="${pct}" style="width: 0%;"></div>
              </div>
              <span style="width: 32px; text-align: right; font-feature-settings: 'tnum';">${pct}%</span>
            </div>
          `;
          })
          .join('')}
      </div>

      <!-- Highlights -->
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        ${sc.highlights
          .map((h) => `<span class="tag" style="background:#ecfdf5; color:#047857; font-size:10px; font-weight:700;">✓ ${escapeHtml(h)}</span>`)
          .join('')}
      </div>

      <!-- Footer Action -->
      <div style="border-top: 1px solid var(--border); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; color: var(--muted);">Certified Vels QC</span>
        <a href="#/reviews/all" style="color: var(--primary); font-weight: 700; font-size: 12px; text-decoration: none;">
          View Feedbacks &rarr;
        </a>
      </div>
    </div>
  `;
}

function generateProductScorecards(reviews: ReviewItem[]): ProductScorecard[] {
  return [
    {
      id: 'ag-tr-454wd',
      name: 'Vels Bull 45HP 4WD Agro Tractor',
      category: 'Tractor 4WD',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&auto=format&fit=crop&q=80',
      reviewsCount: 42,
      averageRating: 5.0,
      recommendationRate: 98,
      distribution: { 5: 90, 4: 8, 3: 2, 2: 0, 1: 0 },
      highlights: ['Wet soil grip', '3.2L/hr fuel burn', 'PACB subsidy approved'],
    },
    {
      id: 'ag-rot-7ft',
      name: 'Vels 7ft Heavy Duty Rotavator',
      category: 'Rotavator',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      reviewsCount: 36,
      averageRating: 4.9,
      recommendationRate: 96,
      distribution: { 5: 84, 4: 12, 3: 4, 2: 0, 1: 0 },
      highlights: ['Italian Boron steel L-blades', 'Multi-speed gearbox', 'Zero vibration'],
    },
    {
      id: 'ag-spr-600l',
      name: 'Vels 600L Tractor Mounted Boom Sprayer',
      category: 'Sprayers',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=200&auto=format&fit=crop&q=80',
      reviewsCount: 28,
      averageRating: 4.6,
      recommendationRate: 92,
      distribution: { 5: 68, 4: 24, 3: 8, 2: 0, 1: 0 },
      highlights: ['15-acre coverage/shift', 'Brass anti-drip nozzle', 'Delta paddy friendly'],
    },
    {
      id: 'ag-lvl-pro',
      name: 'Vels Laser Land Leveler Pro-X',
      category: 'Land Leveler',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      reviewsCount: 19,
      averageRating: 4.8,
      recommendationRate: 95,
      distribution: { 5: 82, 4: 14, 3: 4, 2: 0, 1: 0 },
      highlights: ['800m range laser mast', '25% water saving', 'Fog resistant sensor'],
    },
    {
      id: 'ag-spr-orch400',
      name: 'Vels High-Pressure Orchard Sprayer 400L',
      category: 'Sprayers',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&auto=format&fit=crop&q=80',
      reviewsCount: 15,
      averageRating: 4.7,
      recommendationRate: 94,
      distribution: { 5: 75, 4: 20, 3: 5, 2: 0, 1: 0 },
      highlights: ['35-bar ceramic nozzle', 'Coffee & Arecanut canopy', 'Zero pressure drop'],
    },
    {
      id: 'ag-sd-2row',
      name: 'Vels 2-Row Seed Drill (Manual/Tractor)',
      category: 'Planters & Drills',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=200&auto=format&fit=crop&q=80',
      reviewsCount: 12,
      averageRating: 3.9,
      recommendationRate: 80,
      distribution: { 5: 45, 4: 30, 3: 15, 2: 8, 1: 2 },
      highlights: ['Cotton & millet sowing', 'Adjustable furrow openers', 'Service support ready'],
    },
  ];
}

function exportScorecardsCsv(items: ProductScorecard[]): void {
  const headers = ['Product ID', 'Machinery Name', 'Category', 'Reviews Count', 'Average Rating', 'Recommendation Rate (%)', '5-Star %', '4-Star %', '3-Star %', '2-Star %', '1-Star %'];
  const rows = items.map((sc) => [
    sc.id,
    `"${sc.name}"`,
    `"${sc.category}"`,
    sc.reviewsCount,
    sc.averageRating,
    sc.recommendationRate,
    sc.distribution[5] || 0,
    sc.distribution[4] || 0,
    sc.distribution[3] || 0,
    sc.distribution[2] || 0,
    sc.distribution[1] || 0,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Vels_Agro_Machinery_Ratings_Scorecard_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Machinery Scorecard exported to CSV.');
}
