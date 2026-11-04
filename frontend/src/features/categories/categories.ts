/*! Vels Agro — Enterprise Category & Brand Management Feature Module
 * 100% Cloned from Products Catalog UI, DOM Architecture and GSAP Animations
 * Capabilities:
 * - Subtab 1: Main Machinery Categories (Grid / List views, Storefront Priority Flip Re-order, Quick Adjuster)
 * - Subtab 2: Sub-categories & Implements (Parent Filters, Equipment Specs, View Products Drawer)
 * - Subtab 3: Live Brand & Machinery Model Compatibility (Interactive Matrix & Card Grid Views)
 */

import '../products/products.css';
import './categories.css';
import {
  escapeHtml,
  store,
  showToast,
  closeDrawer,
  openDrawer,
  queryOne,
  animatePageTransition,
  domQuery,
  formatInt,
  animateRows,
  animateCards,
  animateWobble,
  animatePop,
  bindModalDismiss,
  gsap,
  renderPill,
  renderTag,
  domQueryAll,
  initLiftAnimations,
  renderIcon,
  renderIconButton,
  renderPageHeader,
  renderSegmentedControl,
  initSegmentedControl,
  highlightSearchMatch,
  createCustomElement,
  openNewTransferModal,
  formatMoneyK,
  Flip,
  renderProductThumb,
} from '../../main.ts';

import {
  MainCategory,
  SubCategory,
  MachineryModel,
  ImplementAttachment,
  CompatibilityRule,
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_MACHINERY_MODELS,
  INITIAL_IMPLEMENTS,
  INITIAL_COMPATIBILITY_RULES,
  INITIAL_BRANDS,
} from './category-data';

// Persistent State Handlers
function getStoredCategories(): MainCategory[] {
  try {
    const raw = localStorage.getItem('Vels:categories');
    if (raw) {
      const list: MainCategory[] = JSON.parse(raw);
      let updated = false;
      list.forEach((c) => {
        if (!c.bannerUrl) {
          const init = INITIAL_CATEGORIES.find((i) => i.id === c.id);
          if (init?.bannerUrl) {
            c.bannerUrl = init.bannerUrl;
            updated = true;
          }
        }
      });
      if (updated) saveStoredCategories(list);
      return list;
    }
  } catch {}
  return [...INITIAL_CATEGORIES];
}

function saveStoredCategories(cats: MainCategory[]): void {
  try {
    localStorage.setItem('Vels:categories', JSON.stringify(cats));
  } catch {}
}

function getStoredSubCategories(): SubCategory[] {
  try {
    const raw = localStorage.getItem('Vels:subcategories');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_SUBCATEGORIES];
}

function saveStoredSubCategories(subs: SubCategory[]): void {
  try {
    localStorage.setItem('Vels:subcategories', JSON.stringify(subs));
  } catch {}
}

function getStoredCompatibility(): CompatibilityRule[] {
  try {
    const raw = localStorage.getItem('Vels:compatibility');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_COMPATIBILITY_RULES];
}

function saveStoredCompatibility(rules: CompatibilityRule[]): void {
  try {
    localStorage.setItem('Vels:compatibility', JSON.stringify(rules));
  } catch {}
}

function getStoredMachineryModels(): MachineryModel[] {
  try {
    const raw = localStorage.getItem('Vels:machinery_models');
    if (raw) {
      const list: MachineryModel[] = JSON.parse(raw);
      if (list && list.length > 0) return list;
    }
  } catch {}
  return [...INITIAL_MACHINERY_MODELS];
}

function saveStoredMachineryModels(models: MachineryModel[]): void {
  try {
    localStorage.setItem('Vels:machinery_models', JSON.stringify(models));
  } catch {}
}

const SUBTABS = ['list', 'sub', 'brands'];
let containerEl: HTMLElement | null = null;
let currentSubtab = 'list';

// Subtab 1: Categories State
let catViewMode: 'grid' | 'list' = 'grid';
let catFilter = 'all'; // 'all' | 'featured' | category id
let catFeaturedOnly = false;
let searchCategoryQuery = '';
let catSort: 'order' | 'name' | 'skus' | 'subs' = 'order';

// Subtab 2: Sub-categories State
let subViewMode: 'grid' | 'list' = 'grid';
let subParentFilter = 'all'; // 'all' | parentId
let searchSubQuery = '';
let subSort: 'parent' | 'name' | 'products' = 'parent';
let subActiveOnly = false;

// Subtab 3: Brands State
let brandViewMode: 'grid' | 'list' | 'matrix' = 'grid';
let brandFilter = 'all'; // 'all' | brandId
let searchBrandQuery = '';
let brandFlaggedOnly = false;
let brandSort: 'hp' | 'name' | 'brand' | 'price' = 'hp';

const subEl = (key: string) => domQuery(`[data-sub="${key}"]`, containerEl);

// -------------------------------------------------------------
// 1. SUBTAB: MAIN CATEGORIES (Products Catalog Layout Clone)
// -------------------------------------------------------------
function renderMainCategoriesSubtabHTML(): string {
  const cats = getStoredCategories().sort((a, b) => a.order - b.order);
  const subs = getStoredSubCategories();
  const totalProducts = cats.reduce((sum, c) => sum + (c.productCount || 0), 0);
  const sortLabels: Record<string, string> = {
    order: 'Storefront Priority',
    name: 'Name (A-Z)',
    skus: 'Most SKUs',
    subs: 'Sub-categories',
  };

  return `
    ${renderPageHeader({
      eyebrow: 'Catalog taxonomy across prime movers, harvesters, tillers, sprayers & spares',
      title: 'Machinery Categories',
      actions: `
        <button type="button" class="btn btn--ghost pc-export" id="btn-export-cats">
          ${renderIcon('download')}<span>Export CSV</span>
        </button>
        <button type="button" class="btn btn--primary magnetic" id="btn-add-main-cat">
          ${renderIcon('plus')}<span>Add Category</span>
        </button>
      `,
      stats: [
        {
          key: 'cats',
          icon: 'grid',
          label: 'Main categories',
          value: cats.length,
          suffix: 'categories',
          ico: 'pine',
        },
        {
          key: 'subs',
          icon: 'layers',
          label: 'Active sub-categories',
          value: subs.filter((s) => s.active).length,
          suffix: 'types',
          ico: 'ocean',
        },
        {
          key: 'prods',
          icon: 'box',
          label: 'Machinery & spares mapped',
          value: totalProducts,
          suffix: 'SKUs',
          ico: 'teal',
        },
        {
          key: 'status',
          icon: 'check',
          label: 'Storefront sync',
          value: 1,
          fmt: 'pct',
          ico: 'sage',
        },
      ],
    })}

    <!-- Products Catalog Clone Toolbar (.pc-bar) -->
    <div class="pc-bar">
      <!-- Category Filter Chips -->
      <div class="chips pc-cats" role="group" aria-label="Category Filters" id="cat-chips">
        <button type="button" class="chip" data-cat="all" aria-pressed="${catFilter === 'all'}">
          All <b data-count-cat="all">${cats.length}</b>
        </button>
        ${cats
          .map(
            (c) => `
          <button type="button" class="chip" data-cat="${c.id}" aria-pressed="${catFilter === c.id}">
            <i class="dot" style="--c:${c.accentColor || '#009140'}"></i>
            ${escapeHtml(c.name.split(' ')[0])} <b>${c.subCategoryCount || 0}</b>
          </button>
        `
          )
          .join('')}
      </div>

      <!-- Action & View Tools -->
      <div class="pc-tools">
        <button type="button" class="chip pc-low" id="cat-btn-featured" aria-pressed="${catFeaturedOnly}">
          ${renderIcon('alert')}Featured only <b id="cat-featured-count">${cats.filter((c) => c.featured).length}</b>
        </button>
        <label class="search pc-search">
          ${renderIcon('search')}
          <input
            type="search"
            placeholder="Name, code or slug…"
            aria-label="Search categories"
            id="cat-search-input"
            value="${escapeHtml(searchCategoryQuery)}"
          />
        </label>
        <button type="button" class="btn btn--ghost btn--sm pc-sort" id="btn-cat-sort" aria-haspopup="menu" aria-expanded="false">
          ${renderIcon('filter')}
          <span>Sort: ${sortLabels[catSort]}</span>
          ${renderIcon('down')}
        </button>
        ${renderSegmentedControl(
          'View',
          [
            ['grid', 'Grid'],
            ['list', 'List'],
          ],
          catViewMode,
          'cat-view-seg'
        )}
      </div>
    </div>

    <!-- Products Catalog Cards / List Wrapper (.pc-wrap) -->
    <div class="pc-wrap" id="cat-pc-wrap" data-k="wrap" data-view="${catViewMode}">
      <div class="pc-lhead" aria-hidden="true">
        <span>Photo</span>
        <span>Category</span>
        <span>Catalog Composition</span>
        <span>Availability</span>
        <span>Storefront Priority</span>
        <span>Actions</span>
      </div>
      <div class="pc-grid" id="cat-grid-container" data-k="grid"></div>
    </div>
    <p class="pc-foot" id="cat-foot"></p>
  `;
}

function renderCategoryPcardHTML(cat: MainCategory, isFirst: boolean, isLast: boolean, query: string): string {
  const bannerSrc = cat.bannerUrl || '/brand/cat_tractor.jpg';
  const highlightedName = query ? highlightSearchMatch(cat.name, query) : escapeHtml(cat.name);
  const highlightedCode = query ? highlightSearchMatch(cat.code, query) : escapeHtml(cat.code);

  return `
    <article class="pcard" data-key="${cat.id}" data-id="${cat.id}">
      <!-- Photo with spill badge -->
      <div class="pcard__photo">
        <span class="thumb thumb--xl">
          <img src="${bannerSrc}" alt="${escapeHtml(cat.name)}" loading="lazy" decoding="async" onerror="this.src='/brand/cat_tractor.jpg'" />
        </span>
        <span class="pcard__flag">
          <span class="spill" style="--c:${cat.accentColor || '#009140'}">${escapeHtml(cat.code)}</span>
        </span>
      </div>

      <!-- Category Name & Tags -->
      <div class="pcard__name">
        <a href="#/categories/sub?parent=${cat.id}">
          <b>${highlightedName}</b>
        </a>
        <small>/${escapeHtml(cat.slug)} · <span class="mono">${highlightedCode}</span></small>
        <span class="tag pcard__cat" style="--c:${cat.accentColor || '#009140'}">#${cat.order} Storefront</span>
        <span class="pcard__nflag"><span class="spill">${escapeHtml(cat.code)}</span></span>
      </div>

      <!-- Catalog Composition Meters (.pcard__locs) -->
      <div class="pcard__locs" role="list" aria-label="Catalog Composition">
        <div class="pcard__loc" role="listitem">
          <span>Types</span>
          <span class="meter">
            <i style="width:${Math.min(100, (cat.subCategoryCount / 6) * 100)}%; background:${cat.accentColor || '#009140'}"></i>
          </span>
          <b class="num">${cat.subCategoryCount || 0}</b>
        </div>
        <div class="pcard__loc" role="listitem">
          <span>SKUs</span>
          <span class="meter">
            <i style="width:${Math.min(100, (cat.productCount / 70) * 100)}%; background:${cat.accentColor || '#009140'}"></i>
          </span>
          <b class="num">${cat.productCount || 0}</b>
        </div>
        <div class="pcard__loc" role="listitem">
          <span>Sync</span>
          <span class="meter">
            <i style="width:100%; background:var(--pine, #009140)"></i>
          </span>
          <b class="num">100%</b>
        </div>
      </div>

      <!-- Availability metrics -->
      <div class="pcard__avail">
        <span><b class="num">${cat.subCategoryCount || 0}</b> Sub-categories</span>
        <span><b class="num">${cat.productCount || 0}</b> Machinery SKUs</span>
      </div>

      <!-- Priority Cover Bar -->
      <div class="pcard__cover" title="Storefront display rank">
        <span>Priority</span>
        <span class="meter">
          <i style="width:${Math.max(10, (6 - cat.order) * 20)}%; background:var(--pine, #009140)"></i>
        </span>
        <b class="num">Rank #${cat.order}</b>
      </div>

      <!-- Action Controls (.pcard__acts) -->
      <div class="pcard__acts">
        <span class="pcard__adj" role="group" aria-label="Quick storefront priority fix">
          <button type="button" class="ibtn ibtn--sm btn-reorder-up" data-id="${cat.id}" ${isFirst ? 'disabled style="opacity:0.3; cursor:not-allowed"' : ''} title="Move Up">▲</button>
          <span class="pcard__dc">
            <b class="num">#${cat.order}</b>
            <small>Priority</small>
          </span>
          <button type="button" class="ibtn ibtn--sm btn-reorder-down" data-id="${cat.id}" ${isLast ? 'disabled style="opacity:0.3; cursor:not-allowed"' : ''} title="Move Down">▼</button>
        </span>
        ${renderIconButton('layers', `View sub-categories of ${cat.name}`, `data-act="view-subs" data-id="${cat.id}"`, 'ibtn--sm')}
        ${renderIconButton('edit', `Edit ${cat.name}`, `data-act="edit" data-id="${cat.id}"`, 'ibtn--sm')}
        ${renderIconButton('trash', `Delete ${cat.name}`, `data-act="delete" data-id="${cat.id}"`, 'ibtn--sm')}
      </div>
    </article>
  `;
}

function updateMainCategoriesGrid(animate = false): void {
  const wrap = queryOne('#cat-pc-wrap', subEl('list'));
  const grid = queryOne('#cat-grid-container', subEl('list'));
  const foot = queryOne('#cat-foot', subEl('list'));
  if (!wrap || !grid) return;

  const cats = getStoredCategories();

  // Filter
  let filtered = cats.filter((c) => {
    if (catFilter !== 'all' && c.id !== catFilter) return false;
    if (catFeaturedOnly && !c.featured) return false;
    if (searchCategoryQuery) {
      const q = searchCategoryQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort
  if (catSort === 'order') {
    filtered.sort((a, b) => a.order - b.order);
  } else if (catSort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (catSort === 'skus') {
    filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
  } else if (catSort === 'subs') {
    filtered.sort((a, b) => (b.subCategoryCount || 0) - (a.subCategoryCount || 0));
  }

  // Render cards
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="card pc-empty" style="grid-column: 1/-1; padding: 40px 20px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 8px;">🚜</div>
        <p class="empty__title" style="font-weight:700; font-size:16px;">No categories match</p>
        <p class="empty__text" style="color:var(--muted); font-size:13px; margin-bottom:14px;">Try another filter or clear your search query.</p>
        <button type="button" class="btn btn--ghost btn--sm" id="btn-clear-cat-filters">Clear filters</button>
      </div>
    `;
    queryOne('#btn-clear-cat-filters', grid)?.addEventListener('click', () => {
      catFilter = 'all';
      catFeaturedOnly = false;
      searchCategoryQuery = '';
      const input = queryOne('#cat-search-input', subEl('list')) as HTMLInputElement;
      if (input) input.value = '';
      updateMainCategoriesGrid(true);
    });
  } else {
    grid.innerHTML = filtered
      .map((cat, idx) => renderCategoryPcardHTML(cat, idx === 0, idx === filtered.length - 1, searchCategoryQuery))
      .join('');
  }

  // Update foot
  if (foot) {
    const totalSKUs = filtered.reduce((s, c) => s + (c.productCount || 0), 0);
    foot.textContent = `Showing ${filtered.length} of ${cats.length} machinery categories · ${totalSKUs} SKUs mapped`;
  }

  // Update chips counts and state
  queryOne('#cat-featured-count', subEl('list'))?.replaceChildren(
    document.createTextNode(String(cats.filter((c) => c.featured).length))
  );
  queryOne('#cat-btn-featured', subEl('list'))?.setAttribute('aria-pressed', String(catFeaturedOnly));
  domQueryAll('#cat-chips button', subEl('list')).forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.cat === catFilter));
  });

  initLiftAnimations(grid);

  if (animate) {
    const cards = domQueryAll('.pcard', grid);
    animateCards(cards, { y: 24, stagger: 0.05 });
  }
}

function bindMainCategoriesEvents(): void {
  const view = subEl('list');
  if (!view) return;

  // Segmented control (Grid vs List toggle)
  const segEl = queryOne('.cat-view-seg', view);
  if (segEl) {
    initSegmentedControl(segEl, (newMode) => {
      if (newMode === catViewMode) return;
      const wrap = queryOne('#cat-pc-wrap', view);
      if (!wrap) return;

      const cards = domQueryAll('.pcard', wrap);
      const state = Flip.getState(cards);

      catViewMode = newMode as 'grid' | 'list';
      wrap.dataset.view = catViewMode;

      Flip.from(state, {
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.02,
        onComplete: () => {
          gsap.set(cards, { clearProps: 'transform' });
        },
      });
    });
  }

  // Search input
  const searchInput = queryOne('#cat-search-input', view) as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    searchCategoryQuery = (e.target as HTMLInputElement).value;
    updateMainCategoriesGrid(true);
  });

  // Featured only toggle chip
  const featBtn = queryOne('#cat-btn-featured', view);
  featBtn?.addEventListener('click', () => {
    catFeaturedOnly = !catFeaturedOnly;
    featBtn.setAttribute('aria-pressed', String(catFeaturedOnly));
    updateMainCategoriesGrid(true);
  });

  // Category filter chips click
  const chipsWrap = queryOne('#cat-chips', view);
  chipsWrap?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-cat]') as HTMLElement;
    if (!btn) return;
    const cat = btn.dataset.cat || 'all';
    if (catFilter !== cat) {
      catFilter = cat;
      updateMainCategoriesGrid(true);
    }
  });

  // Sort dropdown menu using createCustomElement
  const sortBtn = queryOne('#btn-cat-sort', view);
  sortBtn?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    openNewTransferModal(target);
    createCustomElement(
      target,
      [
        { key: 'order', label: 'Storefront Priority' },
        { key: 'name', label: 'Name (A-Z)' },
        { key: 'skus', label: 'Most SKUs' },
        { key: 'subs', label: 'Sub-categories' },
      ].map((opt) => ({
        label: opt.label,
        checked: opt.key === catSort,
        onSelect: () => {
          if (catSort !== opt.key) {
            catSort = opt.key as any;
            const span = queryOne('span', target);
            if (span) span.textContent = `Sort: ${opt.label}`;
            updateMainCategoriesGrid(true);
          }
        },
      })),
      { align: 'end' }
    );
  });

  // Add Category modal
  queryOne('#btn-add-main-cat', view)?.addEventListener('click', () => {
    showAddEditCategoryDialog();
  });

  // Export CSV
  queryOne('#btn-export-cats', view)?.addEventListener('click', () => {
    const cats = getStoredCategories().sort((a, b) => a.order - b.order);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name,Code,Slug,Order,SubCategories,SKUs,Featured']
        .concat(
          cats.map(
            (c) =>
              `"${c.id}","${c.name}","${c.code}","${c.slug}",${c.order},${c.subCategoryCount},${c.productCount},${c.featured}`
          )
        )
        .join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `vels_categories_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Categories CSV exported!', { ico: 'check' });
  });

  // Card click actions (Edit, Delete, Up, Down, View Subs)
  const grid = queryOne('#cat-grid-container', view);
  grid?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Move Up
    const upBtn = target.closest('.btn-reorder-up') as HTMLElement;
    if (upBtn) {
      e.stopPropagation();
      const id = upBtn.dataset.id;
      const cats = getStoredCategories().sort((a, b) => a.order - b.order);
      const idx = cats.findIndex((c) => c.id === id);
      if (idx > 0) {
        const wrap = queryOne('#cat-pc-wrap', view);
        const cards = domQueryAll('.pcard', wrap);
        const state = Flip.getState(cards);

        const temp = cats[idx].order;
        cats[idx].order = cats[idx - 1].order;
        cats[idx - 1].order = temp;
        saveStoredCategories(cats);
        updateMainCategoriesGrid(false);

        const newCards = domQueryAll('.pcard', wrap);
        Flip.from(state, { duration: 0.35, ease: 'power3.out' });
        showToast(`Moved "${cats[idx].name}" up to #${cats[idx].order}`, { ico: 'check' });
      }
      return;
    }

    // Move Down
    const downBtn = target.closest('.btn-reorder-down') as HTMLElement;
    if (downBtn) {
      e.stopPropagation();
      const id = downBtn.dataset.id;
      const cats = getStoredCategories().sort((a, b) => a.order - b.order);
      const idx = cats.findIndex((c) => c.id === id);
      if (idx !== -1 && idx < cats.length - 1) {
        const wrap = queryOne('#cat-pc-wrap', view);
        const cards = domQueryAll('.pcard', wrap);
        const state = Flip.getState(cards);

        const temp = cats[idx].order;
        cats[idx].order = cats[idx + 1].order;
        cats[idx + 1].order = temp;
        saveStoredCategories(cats);
        updateMainCategoriesGrid(false);

        const newCards = domQueryAll('.pcard', wrap);
        Flip.from(state, { duration: 0.35, ease: 'power3.out' });
        showToast(`Moved "${cats[idx].name}" down to #${cats[idx].order}`, { ico: 'check' });
      }
      return;
    }

    // Edit
    const editBtn = target.closest('[data-act="edit"]') as HTMLElement;
    if (editBtn) {
      e.stopPropagation();
      const id = editBtn.dataset.id;
      const cat = getStoredCategories().find((c) => c.id === id);
      if (cat) showAddEditCategoryDialog(cat);
      return;
    }

    // Delete
    const delBtn = target.closest('[data-act="delete"]') as HTMLElement;
    if (delBtn) {
      e.stopPropagation();
      const id = delBtn.dataset.id;
      const cats = getStoredCategories();
      const cat = cats.find((c) => c.id === id);
      if (!cat) return;
      if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        const filtered = cats.filter((c) => c.id !== id);
        saveStoredCategories(filtered);
        updateMainCategoriesGrid(true);
        showToast(`Deleted category "${cat.name}"`, { ico: 'trash' });
      }
      return;
    }

    // View Subs
    const viewSubsBtn = target.closest('[data-act="view-subs"]') as HTMLElement;
    if (viewSubsBtn) {
      e.stopPropagation();
      const id = viewSubsBtn.dataset.id;
      subParentFilter = id || 'all';
      window.location.hash = `#/categories/sub?parent=${id}`;
    }
  });
}

function animateCategoriesEntrance(): void {
  const view = subEl('list');
  if (!view) return;
  animatePageTransition(view);
  const cards = domQueryAll('.pcard', view);
  animateCards(cards, {
    y: 32,
    delay: 0.05,
    stagger: 0.06,
  });
  animateWobble(cards, {
    delay: 0.1,
    stagger: 0.04,
  });
  animatePop(queryOne('#cat-chips', view), { delay: 0.12 });
}

// -------------------------------------------------------------
// 2. SUBTAB: SUB-CATEGORIES & IMPLEMENTS (Catalog Clone)
// -------------------------------------------------------------
function renderSubCategoriesSubtabHTML(): string {
  const cats = getStoredCategories();
  const subs = getStoredSubCategories();
  const totalProducts = subs.reduce((s, sub) => s + (sub.productCount || 0), 0);

  return `
    ${renderPageHeader({
      eyebrow: 'Classify equipment lines, implements and power machinery attachments',
      title: 'Sub-Categories & Implements',
      actions: `
        <button type="button" class="btn btn--ghost pc-export" id="btn-export-subs">
          ${renderIcon('download')}<span>Export CSV</span>
        </button>
        <button type="button" class="btn btn--primary magnetic" id="btn-add-sub-cat">
          ${renderIcon('plus')}<span>Add Sub-Category</span>
        </button>
      `,
      stats: [
        {
          key: 'subs',
          icon: 'layers',
          label: 'Total Sub-categories',
          value: subs.length,
          suffix: 'types',
          ico: 'pine',
        },
        {
          key: 'active',
          icon: 'check',
          label: 'Storefront Active',
          value: subs.filter((s) => s.active).length,
          suffix: 'active',
          ico: 'ocean',
        },
        {
          key: 'prods',
          icon: 'box',
          label: 'Machinery SKUs',
          value: totalProducts,
          suffix: 'SKUs',
          ico: 'teal',
        },
        {
          key: 'hp',
          icon: 'truck',
          label: 'Max Power Rating',
          value: 120,
          suffix: 'HP rating',
          ico: 'sage',
        },
      ],
    })}

    <!-- Products Catalog Clone Toolbar (.pc-bar) -->
    <div class="pc-bar">
      <!-- Parent Category Filter Chips -->
      <div class="chips pc-cats" role="group" aria-label="Parent Category Filter" id="sub-parent-chips">
        <button type="button" class="chip" data-parent="all" aria-pressed="${subParentFilter === 'all'}">
          All <b data-subcount="all">${subs.length}</b>
        </button>
        ${cats
          .map(
            (c) => `
          <button type="button" class="chip" data-parent="${c.id}" aria-pressed="${subParentFilter === c.id}">
            <i class="dot" style="--c:${c.accentColor || '#009140'}"></i>
            ${escapeHtml(c.name.split(' ')[0])} <b>${subs.filter((s) => s.parentId === c.id).length}</b>
          </button>
        `
          )
          .join('')}
      </div>

      <!-- Tools -->
      <div class="pc-tools">
        <button type="button" class="chip pc-low" id="sub-btn-active" aria-pressed="${subActiveOnly}">
          ${renderIcon('check')}Active only <b id="sub-active-count">${subs.filter((s) => s.active).length}</b>
        </button>
        <label class="search pc-search">
          ${renderIcon('search')}
          <input
            type="search"
            placeholder="Sub-category, code, implement…"
            aria-label="Search sub-categories"
            id="sub-search-input"
            value="${escapeHtml(searchSubQuery)}"
          />
        </label>
        <button type="button" class="btn btn--ghost btn--sm pc-sort" id="btn-sub-sort" aria-haspopup="menu" aria-expanded="false">
          ${renderIcon('filter')}
          <span>Sort: Parent Line</span>
          ${renderIcon('down')}
        </button>
        ${renderSegmentedControl(
          'View',
          [
            ['grid', 'Grid'],
            ['list', 'List'],
          ],
          subViewMode,
          'sub-view-seg'
        )}
      </div>
    </div>

    <!-- Products Catalog Cards / List Wrapper (.pc-wrap) -->
    <div class="pc-wrap" id="sub-pc-wrap" data-k="wrap" data-view="${subViewMode}">
      <div class="pc-lhead" aria-hidden="true">
        <span>Photo</span>
        <span>Sub-Category & Implement</span>
        <span>Equipment Specs</span>
        <span>Products Mapped</span>
        <span>Power Rating</span>
        <span>Actions</span>
      </div>
      <div class="pc-grid" id="sub-grid-container" data-k="grid"></div>
    </div>
    <p class="pc-foot" id="sub-foot"></p>
  `;
}

function renderSubCategoryPcardHTML(sub: SubCategory, cats: MainCategory[], query: string): string {
  const parent = cats.find((c) => c.id === sub.parentId);
  const bannerSrc = parent?.bannerUrl || '/brand/cat_tractor.jpg';
  const highlightedName = query ? highlightSearchMatch(sub.name, query) : escapeHtml(sub.name);
  const highlightedCode = query ? highlightSearchMatch(sub.code, query) : escapeHtml(sub.code);

  return `
    <article class="pcard" data-key="${sub.id}" data-id="${sub.id}">
      <!-- Photo thumbnail with implement badge -->
      <div class="pcard__photo">
        <span class="thumb thumb--xl">
          <img src="${bannerSrc}" alt="${escapeHtml(sub.name)}" loading="lazy" decoding="async" onerror="this.src='/brand/cat_tractor.jpg'" />
        </span>
        <span class="pcard__flag">
          <span class="spill" style="--c:${parent?.accentColor || '#009140'}">${escapeHtml(sub.code)}</span>
        </span>
      </div>

      <!-- Sub-Category Name, Parent Line, Tags -->
      <div class="pcard__name">
        <a href="javascript:void(0)" class="btn-inspect-sub" data-id="${sub.id}">
          <b>${highlightedName}</b>
        </a>
        <small>${escapeHtml(sub.parentName)} · <span class="mono">${highlightedCode}</span></small>
        <span class="tag pcard__cat" style="--c:${parent?.accentColor || '#009140'}">${escapeHtml(sub.minHPRange || 'All HP')}</span>
        <span class="pcard__nflag"><span class="spill">${escapeHtml(sub.code)}</span></span>
      </div>

      <!-- Equipment Specs (.pcard__locs) -->
      <div class="pcard__locs" role="list" aria-label="Equipment Specs">
        <div class="pcard__loc" role="listitem">
          <span>Hitch</span>
          <span class="meter"><i style="width:75%; background:${parent?.accentColor || '#009140'}"></i></span>
          <b class="num" style="font-size:11px;">${escapeHtml(sub.implementType.split(' ')[0])}</b>
        </div>
        <div class="pcard__loc" role="listitem">
          <span>Power</span>
          <span class="meter"><i style="width:85%; background:var(--pine, #009140)"></i></span>
          <b class="num" style="font-size:11px;">${escapeHtml(sub.minHPRange || 'N/A')}</b>
        </div>
        <div class="pcard__loc" role="listitem">
          <span>Active</span>
          <span class="meter"><i style="width:${sub.active ? '100%' : '20%'}; background:${sub.active ? 'var(--pine, #009140)' : 'var(--bad, #e11d48)'}"></i></span>
          <b class="num">${sub.active ? 'Yes' : 'No'}</b>
        </div>
      </div>

      <!-- Availability metrics -->
      <div class="pcard__avail">
        <span><b class="num">${sub.productCount || 0}</b> Machinery SKUs</span>
        <span><b>${sub.active ? '🟢 Live Storefront' : '⚪ Inactive'}</b></span>
      </div>

      <!-- Power Rating Cover Bar -->
      <div class="pcard__cover" title="Implement compatibility range">
        <span>Specs</span>
        <span class="meter">
          <i style="width:80%; background:${parent?.accentColor || '#009140'}"></i>
        </span>
        <b class="num">${escapeHtml(sub.implementType.slice(0, 14))}</b>
      </div>

      <!-- Action Controls (.pcard__acts) -->
      <div class="pcard__acts">
        <button type="button" class="btn btn--ghost btn--xs btn-view-drawer" data-id="${sub.id}">
          ${renderIcon('box')}<span>View Products (${sub.productCount})</span>
        </button>
        <span style="margin-left:auto; display:flex; gap:6px;">
          ${renderIconButton('edit', `Edit ${sub.name}`, `data-act="edit-sub" data-id="${sub.id}"`, 'ibtn--sm')}
          ${renderIconButton('trash', `Delete ${sub.name}`, `data-act="del-sub" data-id="${sub.id}"`, 'ibtn--sm')}
        </span>
      </div>
    </article>
  `;
}

function updateSubCategoriesTable(animate = false): void {
  const wrap = queryOne('#sub-pc-wrap', subEl('sub'));
  const grid = queryOne('#sub-grid-container', subEl('sub'));
  const foot = queryOne('#sub-foot', subEl('sub'));
  if (!wrap || !grid) return;

  const cats = getStoredCategories();
  const subs = getStoredSubCategories();

  // Filter
  let filtered = subs.filter((s) => {
    if (subParentFilter !== 'all' && s.parentId !== subParentFilter) return false;
    if (subActiveOnly && !s.active) return false;
    if (searchSubQuery) {
      const q = searchSubQuery.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.code.toLowerCase().includes(q) &&
        !s.implementType.toLowerCase().includes(q) &&
        !s.parentName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Sort
  if (subSort === 'parent') {
    filtered.sort((a, b) => a.parentName.localeCompare(b.parentName));
  } else if (subSort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (subSort === 'products') {
    filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
  }

  // Render cards
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="card pc-empty" style="grid-column: 1/-1; padding: 40px 20px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 8px;">⚙️</div>
        <p class="empty__title" style="font-weight:700; font-size:16px;">No sub-categories match</p>
        <p class="empty__text" style="color:var(--muted); font-size:13px; margin-bottom:14px;">Try another parent category filter or clear your search.</p>
        <button type="button" class="btn btn--ghost btn--sm" id="btn-clear-sub-filters">Clear filters</button>
      </div>
    `;
    queryOne('#btn-clear-sub-filters', grid)?.addEventListener('click', () => {
      subParentFilter = 'all';
      subActiveOnly = false;
      searchSubQuery = '';
      const input = queryOne('#sub-search-input', subEl('sub')) as HTMLInputElement;
      if (input) input.value = '';
      updateSubCategoriesTable(true);
    });
  } else {
    grid.innerHTML = filtered.map((sub) => renderSubCategoryPcardHTML(sub, cats, searchSubQuery)).join('');
  }

  // Update foot
  if (foot) {
    foot.textContent = `Showing ${filtered.length} of ${subs.length} sub-categories & implement types`;
  }

  // Update chips state
  domQueryAll('#sub-parent-chips button', subEl('sub')).forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.parent === subParentFilter));
  });
  queryOne('#sub-btn-active', subEl('sub'))?.setAttribute('aria-pressed', String(subActiveOnly));

  initLiftAnimations(grid);

  if (animate) {
    const cards = domQueryAll('.pcard', grid);
    animateCards(cards, { y: 24, stagger: 0.04 });
  }
}

function bindSubCategoriesEvents(): void {
  const view = subEl('sub');
  if (!view) return;

  // Segmented control
  const segEl = queryOne('.sub-view-seg', view);
  if (segEl) {
    initSegmentedControl(segEl, (newMode) => {
      if (newMode === subViewMode) return;
      const wrap = queryOne('#sub-pc-wrap', view);
      if (!wrap) return;

      const cards = domQueryAll('.pcard', wrap);
      const state = Flip.getState(cards);

      subViewMode = newMode as 'grid' | 'list';
      wrap.dataset.view = subViewMode;

      Flip.from(state, {
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.02,
        onComplete: () => {
          gsap.set(cards, { clearProps: 'transform' });
        },
      });
    });
  }

  // Search input
  const searchInput = queryOne('#sub-search-input', view) as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    searchSubQuery = (e.target as HTMLInputElement).value;
    updateSubCategoriesTable(true);
  });

  // Active only toggle
  const activeBtn = queryOne('#sub-btn-active', view);
  activeBtn?.addEventListener('click', () => {
    subActiveOnly = !subActiveOnly;
    activeBtn.setAttribute('aria-pressed', String(subActiveOnly));
    updateSubCategoriesTable(true);
  });

  // Parent chips click
  const chipsWrap = queryOne('#sub-parent-chips', view);
  chipsWrap?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-parent]') as HTMLElement;
    if (!btn) return;
    const parent = btn.dataset.parent || 'all';
    if (subParentFilter !== parent) {
      subParentFilter = parent;
      updateSubCategoriesTable(true);
    }
  });

  // Sort dropdown menu
  const sortBtn = queryOne('#btn-sub-sort', view);
  sortBtn?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    openNewTransferModal(target);
    createCustomElement(
      target,
      [
        { key: 'parent', label: 'Parent Line' },
        { key: 'name', label: 'Sub-Category Name' },
        { key: 'products', label: 'Most Products' },
      ].map((opt) => ({
        label: opt.label,
        checked: opt.key === subSort,
        onSelect: () => {
          if (subSort !== opt.key) {
            subSort = opt.key as any;
            const span = queryOne('span', target);
            if (span) span.textContent = `Sort: ${opt.label}`;
            updateSubCategoriesTable(true);
          }
        },
      })),
      { align: 'end' }
    );
  });

  // Add Sub-Category modal
  queryOne('#btn-add-sub-cat', view)?.addEventListener('click', () => {
    showAddEditSubCategoryDialog();
  });

  // Export CSV
  queryOne('#btn-export-subs', view)?.addEventListener('click', () => {
    const subs = getStoredSubCategories();
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,ParentName,Name,Code,ImplementType,ProductsCount,HPRange,Active']
        .concat(
          subs.map(
            (s) =>
              `"${s.id}","${s.parentName}","${s.name}","${s.code}","${s.implementType}",${s.productCount},"${s.minHPRange || ''}",${s.active}`
          )
        )
        .join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `vels_subcategories_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sub-categories CSV exported!', { ico: 'check' });
  });

  // Grid click actions (View Drawer, Edit, Delete)
  const grid = queryOne('#sub-grid-container', view);
  grid?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // View Products Drawer
    const viewDrawerBtn = target.closest('.btn-view-drawer, .btn-inspect-sub') as HTMLElement;
    if (viewDrawerBtn) {
      e.stopPropagation();
      const id = viewDrawerBtn.dataset.id;
      if (id) showSubCategoryProductsDrawer(id);
      return;
    }

    // Edit Sub
    const editBtn = target.closest('[data-act="edit-sub"]') as HTMLElement;
    if (editBtn) {
      e.stopPropagation();
      const id = editBtn.dataset.id;
      const sub = getStoredSubCategories().find((s) => s.id === id);
      if (sub) showAddEditSubCategoryDialog(sub);
      return;
    }

    // Delete Sub
    const delBtn = target.closest('[data-act="del-sub"]') as HTMLElement;
    if (delBtn) {
      e.stopPropagation();
      const id = delBtn.dataset.id;
      const subs = getStoredSubCategories();
      const sub = subs.find((s) => s.id === id);
      if (!sub) return;
      if (confirm(`Delete sub-category "${sub.name}"?`)) {
        const filtered = subs.filter((s) => s.id !== id);
        saveStoredSubCategories(filtered);
        updateSubCategoriesTable(true);
        showToast(`Deleted "${sub.name}"`, { ico: 'trash' });
      }
      return;
    }
  });
}

function animateSubCategoriesEntrance(): void {
  const view = subEl('sub');
  if (!view) return;
  animatePageTransition(view);
  const cards = domQueryAll('.pcard', view);
  animateCards(cards, {
    y: 28,
    delay: 0.05,
    stagger: 0.05,
  });
  animateWobble(cards, {
    delay: 0.1,
    stagger: 0.03,
  });
}

// -------------------------------------------------------------
// 3. SUBTAB: BRAND & MODEL COMPATIBILITY (Matrix & Cards Clone)
// -------------------------------------------------------------
function renderBrandCompatibilitySubtabHTML(): string {
  const brands = INITIAL_BRANDS;
  const models = getStoredMachineryModels();
  const rules = getStoredCompatibility();
  const flagged = rules.filter((r) => r.status === 'not_recommended').length;

  const brandSortLabels: Record<string, string> = {
    hp: 'Horsepower (High to Low)',
    name: 'Model Name (A-Z)',
    brand: 'Brand Line',
    price: 'Price (High to Low)',
  };

  return `
    ${renderPageHeader({
      eyebrow: 'Interoperability matrix between machinery models and implement attachments',
      title: 'Brand & Model Compatibility',
      actions: `
        <button type="button" class="btn btn--ghost pc-export" id="btn-export-matrix">
          ${renderIcon('download')}<span>Export Matrix</span>
        </button>
        <button type="button" class="btn btn--ghost" id="btn-reset-rules">
          ${renderIcon('refresh')}<span>Reset Defaults</span>
        </button>
        <button type="button" class="btn btn--primary magnetic" id="btn-add-model">
          ${renderIcon('plus')}<span>Add Model</span>
        </button>
      `,
      stats: [
        {
          key: 'models',
          icon: 'truck',
          label: 'Machinery Models',
          value: models.length,
          suffix: 'tractors/combines',
          ico: 'pine',
        },
        {
          key: 'implements',
          icon: 'box',
          label: 'Implements Mapped',
          value: INITIAL_IMPLEMENTS.length,
          suffix: 'attachments',
          ico: 'teal',
        },
        {
          key: 'rules',
          icon: 'check',
          label: 'Compatibility Pairs',
          value: models.length * INITIAL_IMPLEMENTS.length,
          suffix: 'evaluated pairs',
          ico: 'ocean',
        },
        {
          key: 'flagged',
          icon: 'alert',
          label: 'Ballast Required',
          value: flagged || 6,
          suffix: 'safety flagged',
          ico: 'rose',
        },
      ],
    })}

    <!-- Products Catalog Clone Toolbar (.pc-bar) -->
    <div class="pc-bar">
      <!-- Brand Filter Chips -->
      <div class="chips pc-cats" role="group" aria-label="Brand Filter" id="brand-chips">
        <button type="button" class="chip" data-brand="all" aria-pressed="${brandFilter === 'all'}">
          All Brands <b data-brandcount="all">${models.length}</b>
        </button>
        ${brands
          .map(
            (b) => `
          <button type="button" class="chip" data-brand="${b.id}" aria-pressed="${brandFilter === b.id}">
            ${escapeHtml(b.name.split(' ')[0])} <b>${models.filter((m) => m.brandId === b.id).length}</b>
          </button>
        `
          )
          .join('')}
      </div>

      <!-- Tools -->
      <div class="pc-tools">
        <button type="button" class="chip pc-low" id="brand-btn-flagged" aria-pressed="${brandFlaggedOnly}">
          ${renderIcon('alert')}Needs Ballast <b id="brand-flagged-count">${flagged || 6}</b>
        </button>
        <label class="search pc-search">
          ${renderIcon('search')}
          <input
            type="search"
            placeholder="Search model, HP, PTO…"
            aria-label="Search models"
            id="brand-search-input"
            value="${escapeHtml(searchBrandQuery)}"
          />
        </label>
        <button type="button" class="btn btn--ghost btn--sm pc-sort" id="btn-brand-sort" aria-haspopup="menu" aria-expanded="false">
          ${renderIcon('filter')}
          <span>Sort: ${brandSortLabels[brandSort] || 'Horsepower'}</span>
          ${renderIcon('down')}
        </button>
        ${renderSegmentedControl(
          'View',
          [
            ['grid', 'Grid'],
            ['list', 'List'],
            ['matrix', 'Matrix'],
          ],
          brandViewMode,
          'brand-view-seg'
        )}
      </div>
    </div>

    <!-- Cards Grid & List View Wrapper (.pc-wrap) -->
    <div class="pc-wrap" id="brand-pc-wrap" data-k="wrap" data-view="${brandViewMode === 'list' ? 'list' : 'grid'}" ${brandViewMode === 'matrix' ? 'hidden' : ''}>
      <div class="pc-lhead" aria-hidden="true">
        <span>Photo</span>
        <span>Brand & Model</span>
        <span>Equipment Specs</span>
        <span>Attachments & Fit</span>
        <span>Power & Hitch</span>
        <span>Actions</span>
      </div>
      <div class="pc-grid" id="brand-cards-container" data-k="grid"></div>
    </div>

    <!-- Matrix View Wrap -->
    <div id="brand-matrix-view" class="cat-matrix-wrap card" ${brandViewMode !== 'matrix' ? 'hidden' : ''}>
      <table class="cat-matrix" id="brand-matrix-table">
        <thead>
          <tr>
            <th>Machinery Model / Specs</th>
            ${INITIAL_IMPLEMENTS.map((imp) => `<th>${escapeHtml(imp.name)}<br><small style="color:var(--muted); font-weight:normal;">Min ${imp.minHP}HP · ${imp.hitchType}</small></th>`).join('')}
          </tr>
        </thead>
        <tbody id="brand-matrix-tbody"></tbody>
      </table>
    </div>
    <p class="pc-foot" id="brand-foot"></p>
  `;
}

function renderBrandModelPcardHTML(
  mod: MachineryModel,
  rules: CompatibilityRule[],
  query: string
): string {
  const compImplements = INITIAL_IMPLEMENTS.filter((imp) => {
    const rule = rules.find((r) => r.modelId === mod.id && r.implementId === imp.id);
    const status = rule?.status || (mod.horsePower >= imp.minHP ? 'compatible' : 'incompatible');
    return status === 'compatible';
  });

  const ballastImplements = INITIAL_IMPLEMENTS.filter((imp) => {
    const rule = rules.find((r) => r.modelId === mod.id && r.implementId === imp.id);
    return rule?.status === 'not_recommended';
  });

  const bannerSrc = mod.imageUrl || '/brand/cat_tractor.jpg';
  const highlightedName = query ? highlightSearchMatch(mod.name, query) : escapeHtml(mod.name);
  const highlightedCode = query ? highlightSearchMatch(mod.modelCode, query) : escapeHtml(mod.modelCode);

  return `
    <article class="pcard" data-key="${mod.id}" data-id="${mod.id}">
      <!-- Photo thumbnail with HP & Drive flag spill -->
      <div class="pcard__photo">
        <span class="thumb thumb--xl">
          <img src="${bannerSrc}" alt="${escapeHtml(mod.name)}" loading="lazy" decoding="async" onerror="this.src='/brand/cat_tractor.jpg'" />
        </span>
        <span class="pcard__flag">
          <span class="spill" style="--c:var(--pine, #009140)">${mod.horsePower} HP · ${mod.driveType}</span>
        </span>
      </div>

      <!-- Machinery Model Name, Brand Origin, Hitch Tag -->
      <div class="pcard__name">
        <a href="javascript:void(0)" class="btn-open-matrix" data-id="${mod.id}">
          <b>${highlightedName}</b>
        </a>
        <small>${escapeHtml(mod.brandName)} · <span class="mono">${highlightedCode}</span></small>
        <span class="tag pcard__cat" style="--c:var(--pine, #009140)">${mod.driveType} · ${mod.hitchCategory}</span>
        <span class="pcard__nflag"><span class="spill">${mod.horsePower} HP</span></span>
      </div>

      <!-- Equipment Specs (.pcard__locs) -->
      <div class="pcard__locs" role="list" aria-label="Machinery Specs">
        <div class="pcard__loc" role="listitem">
          <span>Power</span>
          <span class="meter"><i style="width:${Math.min(100, (mod.horsePower / 120) * 100)}%; background:var(--pine, #009140)"></i></span>
          <b class="num">${mod.horsePower} HP</b>
        </div>
        <div class="pcard__loc" role="listitem">
          <span>PTO</span>
          <span class="meter"><i style="width:${mod.ptoRPM >= 1000 ? '90%' : '60%'}; background:var(--ocean, #0284c7)"></i></span>
          <b class="num">${mod.ptoRPM} RPM</b>
        </div>
        <div class="pcard__loc" role="listitem">
          <span>Price</span>
          <span class="meter"><i style="width:${Math.min(100, (mod.price / 2000000) * 100)}%; background:var(--sage, #10b981)"></i></span>
          <b class="num">${formatMoneyK(mod.price)}</b>
        </div>
      </div>

      <!-- Attachments & Fit Status (.pcard__avail) -->
      <div class="pcard__avail">
        <span><b class="num">${compImplements.length}</b> / ${INITIAL_IMPLEMENTS.length} Implements Fit</span>
        <span>${ballastImplements.length > 0 ? `<b style="color:var(--amber, #f59e0b);">⚠️ ${ballastImplements.length} Needs Ballast</b>` : '<b style="color:var(--pine, #009140);">✅ 100% Fit Verified</b>'}</span>
      </div>

      <!-- Hitch Cover Bar (.pcard__cover) -->
      <div class="pcard__cover" title="Hitch and Chassis Spec">
        <span>Linkage</span>
        <span class="meter"><i style="width:85%; background:var(--pine, #009140)"></i></span>
        <b class="num">${mod.hitchCategory} Linkage</b>
      </div>

      <!-- Action Controls (.pcard__acts) -->
      <div class="pcard__acts">
        <button type="button" class="btn btn--ghost btn--xs btn-open-matrix" data-id="${mod.id}" title="Inspect compatibility matrix for this model">
          ${renderIcon('check')}<span>Matrix (${compImplements.length})</span>
        </button>
        <span style="margin-left:auto; display:flex; gap:6px;">
          ${renderIconButton('edit', `Edit ${mod.name}`, `data-act="edit-model" data-id="${mod.id}"`, 'ibtn--sm')}
          ${renderIconButton('trash', `Delete ${mod.name}`, `data-act="del-model" data-id="${mod.id}"`, 'ibtn--sm')}
        </span>
      </div>
    </article>
  `;
}

function updateCompatibilityMatrix(animate = false): void {
  const wrap = queryOne('#brand-pc-wrap', subEl('brands'));
  const cardsContainer = queryOne('#brand-cards-container', subEl('brands'));
  const matrixTbody = queryOne('#brand-matrix-tbody', subEl('brands'));
  const foot = queryOne('#brand-foot', subEl('brands'));
  if (!wrap || !cardsContainer || !matrixTbody) return;

  const allModels = getStoredMachineryModels();
  const implementsList = INITIAL_IMPLEMENTS;
  const rules = getStoredCompatibility();

  // Filter models
  let filtered = allModels.filter((m) => {
    if (brandFilter !== 'all' && m.brandId !== brandFilter) return false;
    if (brandFlaggedOnly) {
      const hasBallast = implementsList.some((imp) => {
        const r = rules.find((x) => x.modelId === m.id && x.implementId === imp.id);
        return r?.status === 'not_recommended';
      });
      if (!hasBallast) return false;
    }
    if (searchBrandQuery) {
      const q = searchBrandQuery.toLowerCase();
      if (
        !m.name.toLowerCase().includes(q) &&
        !m.modelCode.toLowerCase().includes(q) &&
        !m.brandName.toLowerCase().includes(q) &&
        !String(m.horsePower).includes(q) &&
        !m.driveType.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (brandSort === 'hp') return b.horsePower - a.horsePower;
    if (brandSort === 'name') return a.name.localeCompare(b.name);
    if (brandSort === 'brand') return a.brandName.localeCompare(b.brandName);
    if (brandSort === 'price') return b.price - a.price;
    return 0;
  });

  // 1. Populate Cards Container (.pc-grid)
  if (filtered.length === 0) {
    cardsContainer.innerHTML = `
      <div class="card pc-empty" style="grid-column: 1/-1; padding: 40px 20px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 8px;">🚜</div>
        <p class="empty__title" style="font-weight:700; font-size:16px;">No machinery models match</p>
        <p class="empty__text" style="color:var(--muted); font-size:13px; margin-bottom:14px;">Try another brand filter or clear your search query.</p>
        <button type="button" class="btn btn--ghost btn--sm" id="btn-clear-brand-filters">Clear filters</button>
      </div>
    `;
    queryOne('#btn-clear-brand-filters', cardsContainer)?.addEventListener('click', () => {
      brandFilter = 'all';
      brandFlaggedOnly = false;
      searchBrandQuery = '';
      const input = queryOne('#brand-search-input', subEl('brands')) as HTMLInputElement;
      if (input) input.value = '';
      updateCompatibilityMatrix(true);
    });
  } else {
    cardsContainer.innerHTML = filtered
      .map((mod) => renderBrandModelPcardHTML(mod, rules, searchBrandQuery))
      .join('');
  }

  // 2. Populate Matrix Table Body
  matrixTbody.innerHTML = filtered
    .map((mod) => {
      const cellsHtml = implementsList
        .map((imp) => {
          const rule = rules.find((r) => r.modelId === mod.id && r.implementId === imp.id);
          const status = rule?.status || (mod.horsePower >= imp.minHP ? 'compatible' : 'incompatible');
          const pillClass = `matrix-pill--${status}`;
          const pillLabel =
            status === 'compatible'
              ? '✅ Compatible'
              : status === 'not_recommended'
              ? '⚠️ Needs Ballast'
              : '❌ Incompatible';

          return `
            <td>
              <button type="button" class="matrix-cell-btn btn-toggle-rule" data-model="${mod.id}" data-imp="${imp.id}" title="${escapeHtml(rule?.notes || pillLabel)} (Click to toggle status)">
                <span class="matrix-pill ${pillClass}">${pillLabel}</span>
              </button>
            </td>
          `;
        })
        .join('');

      return `
        <tr data-model-row="${mod.id}">
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="thumb thumb--sm" style="width:36px; height:36px; border-radius:6px; overflow:hidden; flex-shrink:0;">
                <img src="${mod.imageUrl || '/brand/cat_tractor.jpg'}" alt="${escapeHtml(mod.name)}" style="width:100%; height:100%; object-fit:cover;" />
              </span>
              <div style="display:flex; flex-direction:column; gap:2px">
                <b>${escapeHtml(mod.name)}</b>
                <small class="wh-dim" style="color:var(--muted); font-size:11px;">
                  ${mod.horsePower} HP · ${mod.driveType} · ${mod.ptoRPM} RPM PTO · ${mod.hitchCategory}
                </small>
              </div>
            </div>
          </td>
          ${cellsHtml}
        </tr>
      `;
    })
    .join('');

  // 3. Update Footer
  if (foot) {
    foot.textContent = `Showing compatibility for ${filtered.length} of ${allModels.length} machinery models · ${implementsList.length} implements evaluated`;
  }

  // 4. Update Header / Toolbar UI elements
  const flaggedCount = rules.filter((r) => r.status === 'not_recommended').length;
  queryOne('#brand-flagged-count', subEl('brands'))?.replaceChildren(
    document.createTextNode(String(flaggedCount || 6))
  );
  queryOne('#brand-btn-flagged', subEl('brands'))?.setAttribute('aria-pressed', String(brandFlaggedOnly));
  domQueryAll('#brand-chips button', subEl('brands')).forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.brand === brandFilter));
  });

  initLiftAnimations(cardsContainer);

  if (animate) {
    if (brandViewMode === 'grid' || brandViewMode === 'list') {
      const cards = domQueryAll('.pcard', cardsContainer);
      animateCards(cards, { y: 24, stagger: 0.04 });
    } else {
      animateRows(domQueryAll('.cat-matrix tbody tr', subEl('brands')), {
        y: 10,
        stagger: 0.03,
      });
    }
  }
}

function bindBrandMatrixEvents(): void {
  const view = subEl('brands');
  if (!view) return;

  const brandSortLabels: Record<string, string> = {
    hp: 'Horsepower (High to Low)',
    name: 'Model Name (A-Z)',
    brand: 'Brand Line',
    price: 'Price (High to Low)',
  };

  // Segmented control (Grid vs List vs Matrix)
  const segEl = queryOne('.brand-view-seg', view);
  if (segEl) {
    initSegmentedControl(segEl, (newMode) => {
      const targetMode = newMode as 'grid' | 'list' | 'matrix';
      const matrixView = queryOne('#brand-matrix-view', view);
      const wrap = queryOne('#brand-pc-wrap', view);
      const cardsContainer = queryOne('#brand-cards-container', view);

      if (targetMode === 'matrix') {
        brandViewMode = 'matrix';
        if (wrap) wrap.hidden = true;
        if (matrixView) {
          matrixView.hidden = false;
          animateRows(domQueryAll('.cat-matrix tbody tr', view), { y: 10, stagger: 0.03 });
        }
      } else {
        // grid or list
        if (matrixView) matrixView.hidden = true;
        if (wrap) wrap.hidden = false;

        if (cardsContainer && (brandViewMode === 'grid' || brandViewMode === 'list')) {
          const cards = domQueryAll('.pcard', cardsContainer);
          const state = Flip.getState(cards);
          brandViewMode = targetMode;
          if (wrap) wrap.dataset.view = targetMode;
          Flip.from(state, {
            duration: 0.35,
            ease: 'power2.inOut',
            stagger: 0.02,
            absolute: false,
          });
        } else {
          brandViewMode = targetMode;
          if (wrap) wrap.dataset.view = targetMode;
          const cards = domQueryAll('.pcard', cardsContainer!);
          animateCards(cards, { y: 24, stagger: 0.04 });
        }
      }
    });
  }

  // Sort dropdown menu using createCustomElement
  const sortBtn = queryOne('#btn-brand-sort', view);
  sortBtn?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    openNewTransferModal(target);
    createCustomElement(
      target,
      [
        { key: 'hp', label: 'Horsepower (High to Low)' },
        { key: 'name', label: 'Model Name (A-Z)' },
        { key: 'brand', label: 'Brand Line' },
        { key: 'price', label: 'Price (High to Low)' },
      ].map((opt) => ({
        label: opt.label,
        checked: opt.key === brandSort,
        onSelect: () => {
          if (brandSort !== opt.key) {
            brandSort = opt.key as any;
            const span = queryOne('span', target);
            if (span) span.textContent = `Sort: ${brandSortLabels[brandSort]}`;
            updateCompatibilityMatrix(true);
          }
        },
      })),
      { align: 'end' }
    );
  });

  // Needs Ballast filter toggle
  const flaggedBtn = queryOne('#brand-btn-flagged', view);
  flaggedBtn?.addEventListener('click', () => {
    brandFlaggedOnly = !brandFlaggedOnly;
    flaggedBtn.setAttribute('aria-pressed', String(brandFlaggedOnly));
    updateCompatibilityMatrix(true);
  });

  // Brand filter chips
  const chipsWrap = queryOne('#brand-chips', view);
  chipsWrap?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-brand]') as HTMLElement;
    if (!btn) return;
    const brand = btn.dataset.brand || 'all';
    if (brandFilter !== brand) {
      brandFilter = brand;
      updateCompatibilityMatrix(true);
    }
  });

  // Search input
  const searchInput = queryOne('#brand-search-input', view) as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    searchBrandQuery = (e.target as HTMLInputElement).value;
    updateCompatibilityMatrix(false);
  });

  // Card Inspect / Open Matrix button handler (from card)
  view.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Open Matrix for a specific model from card button
    const openMatrixBtn = target.closest('.btn-open-matrix') as HTMLElement;
    if (openMatrixBtn) {
      const modelId = openMatrixBtn.dataset.id;
      if (modelId) {
        brandViewMode = 'matrix';
        const matrixView = queryOne('#brand-matrix-view', view);
        const wrap = queryOne('#brand-pc-wrap', view);
        if (wrap) wrap.hidden = true;
        if (matrixView) matrixView.hidden = false;

        // update segmented control button state
        const segBtns = domQueryAll('.brand-view-seg button', view);
        segBtns.forEach((b) => {
          const val = b.dataset.value || b.dataset.val || b.textContent?.trim().toLowerCase();
          b.setAttribute('aria-pressed', String(val === 'matrix'));
        });

        // scroll to model row and pulse
        const targetRow = queryOne(`tr[data-model-row="${modelId}"]`, matrixView);
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          animatePop(targetRow);
        }
      }
      return;
    }

    // Edit model button
    const editBtn = target.closest('[data-act="edit-model"]') as HTMLElement;
    if (editBtn) {
      const modelId = editBtn.dataset.id;
      const models = getStoredMachineryModels();
      const mod = models.find((m) => m.id === modelId);
      if (mod) showAddEditModelDialog(mod);
      return;
    }

    // Delete model button
    const delBtn = target.closest('[data-act="del-model"]') as HTMLElement;
    if (delBtn) {
      const modelId = delBtn.dataset.id;
      const models = getStoredMachineryModels();
      const mod = models.find((m) => m.id === modelId);
      if (mod && confirm(`Delete machinery model "${mod.name}"?`)) {
        const next = models.filter((m) => m.id !== modelId);
        saveStoredMachineryModels(next);
        showToast(`Model "${mod.name}" deleted`, { ico: 'trash' });
        updateCompatibilityMatrix(true);
      }
      return;
    }
  });

  // Toggle compatibility rule on cell click
  const tbody = queryOne('#brand-matrix-tbody', view);
  tbody?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.btn-toggle-rule') as HTMLElement;
    if (!btn) return;
    const modelId = btn.dataset.model;
    const impId = btn.dataset.imp;
    if (!modelId || !impId) return;

    const rules = getStoredCompatibility();
    let rule = rules.find((r) => r.modelId === modelId && r.implementId === impId);
    if (!rule) {
      rule = { modelId, implementId: impId, status: 'compatible' };
      rules.push(rule);
    }

    // Cycle through: compatible -> not_recommended -> incompatible -> compatible
    if (rule.status === 'compatible') rule.status = 'not_recommended';
    else if (rule.status === 'not_recommended') rule.status = 'incompatible';
    else rule.status = 'compatible';

    saveStoredCompatibility(rules);
    updateCompatibilityMatrix(false);
    animateWobble(btn);
    showToast(`Rule updated: ${rule.status.replace('_', ' ')}`, { ico: 'check' });
  });

  // Reset defaults button
  queryOne('#btn-reset-rules', view)?.addEventListener('click', () => {
    if (confirm('Reset all compatibility matrix rules to factory defaults?')) {
      saveStoredCompatibility([...INITIAL_COMPATIBILITY_RULES]);
      updateCompatibilityMatrix(true);
      showToast('Compatibility rules restored to defaults', { ico: 'check' });
    }
  });

  // Export Matrix CSV
  queryOne('#btn-export-matrix', view)?.addEventListener('click', () => {
    const models = getStoredMachineryModels();
    const implementsList = INITIAL_IMPLEMENTS;
    const rules = getStoredCompatibility();

    let csv = 'Model,Brand,HP,Drive,PTO,Linkage,Price,' + implementsList.map((i) => `"${i.name}"`).join(',') + '\n';
    models.forEach((mod) => {
      const row = [
        `"${mod.name}"`,
        `"${mod.brandName}"`,
        mod.horsePower,
        `"${mod.driveType}"`,
        mod.ptoRPM,
        `"${mod.hitchCategory}"`,
        mod.price,
        ...implementsList.map((imp) => {
          const rule = rules.find((r) => r.modelId === mod.id && r.implementId === imp.id);
          return `"${rule?.status || (mod.horsePower >= imp.minHP ? 'compatible' : 'incompatible')}"`;
        }),
      ];
      csv += row.join(',') + '\n';
    });

    const encoded = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `vels_machinery_compatibility_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Machinery matrix CSV exported!', { ico: 'check' });
  });

  // Add Model button
  queryOne('#btn-add-model', view)?.addEventListener('click', () => {
    showAddEditModelDialog();
  });
}

function animateBrandMatrixEntrance(): void {
  const view = subEl('brands');
  if (!view) return;
  animatePageTransition(view);
  animateRows(domQueryAll('.cat-matrix tbody tr', view), {
    y: 10,
    stagger: 0.04,
    delay: 0.1,
  });
}

// -------------------------------------------------------------
// 4. DIALOGS & ACTIONS: ADD/EDIT CATEGORY, SUB-CATEGORY & DRAWER
// -------------------------------------------------------------
function showAddEditCategoryDialog(catToEdit?: MainCategory): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;
  const isEdit = !!catToEdit;
  let activeBanner = catToEdit?.bannerUrl || '/brand/cat_tractor.jpg';
  let activeColor = catToEdit?.accentColor || '#009140';

  modalEl.innerHTML = `
    <div class="cat-dialog">
      <header class="cat-dialog__header">
        <div class="cat-dialog__header-left">
          <h3 class="cat-dialog__title">${isEdit ? 'Edit Machinery Category' : 'Add New Machinery Category'}</h3>
          <p class="cat-dialog__sub">Configure primary machinery class, icon and storefront accent theme</p>
        </div>
        <button type="button" class="btn btn--icon btn--ghost btn-close-modal" aria-label="Close modal">${renderIcon('close')}</button>
      </header>
      <div class="cat-dialog__body">
        <!-- Category Name -->
        <div class="cat-form-group">
          <label for="cat-in-name">Category Name *</label>
          <input type="text" id="cat-in-name" value="${catToEdit ? escapeHtml(catToEdit.name) : ''}" placeholder="e.g. Laser Land Levelers & Scrapers" required />
        </div>

        <!-- 2-column Grid: Code & Slug -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="cat-form-group">
            <label for="cat-in-code">Category Code</label>
            <input type="text" id="cat-in-code" value="${catToEdit ? escapeHtml(catToEdit.code) : ''}" placeholder="e.g. CAT-LEVL" />
          </div>
          <div class="cat-form-group">
            <label for="cat-in-slug">URL Slug</label>
            <input type="text" id="cat-in-slug" value="${catToEdit ? escapeHtml(catToEdit.slug) : ''}" placeholder="e.g. land-levelers" />
          </div>
        </div>

        <!-- Machinery Banner Image Presets -->
        <div class="cat-form-group cat-img-picker">
          <label>Machinery Banner Image</label>
          <div class="cat-img-presets" id="cat-img-presets">
            <button type="button" class="cat-img-preset-btn ${activeBanner.includes('cat_tractor') ? 'is-selected' : ''}" data-url="/brand/cat_tractor.jpg">
              <img src="/brand/cat_tractor.jpg" alt="Tractor" />
              <span>Tractor</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeBanner.includes('cat_harvester') ? 'is-selected' : ''}" data-url="/brand/cat_harvester.jpg">
              <img src="/brand/cat_harvester.jpg" alt="Harvester" />
              <span>Harvester</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeBanner.includes('cat_tiller') ? 'is-selected' : ''}" data-url="/brand/cat_tiller.jpg">
              <img src="/brand/cat_tiller.jpg" alt="Tiller" />
              <span>Rotavator</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeBanner.includes('cat_sprayer') ? 'is-selected' : ''}" data-url="/brand/cat_sprayer.jpg">
              <img src="/brand/cat_sprayer.jpg" alt="Sprayer" />
              <span>Sprayer</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeBanner.includes('cat_spares') ? 'is-selected' : ''}" data-url="/brand/cat_spares.jpg">
              <img src="/brand/cat_spares.jpg" alt="Spares" />
              <span>Spares</span>
            </button>
          </div>
          <input type="text" id="cat-in-banner" value="${activeBanner}" placeholder="Image URL (e.g. /brand/cat_tractor.jpg)" />
        </div>

        <!-- Description -->
        <div class="cat-form-group">
          <label for="cat-in-desc">Description & Specification Summary</label>
          <textarea id="cat-in-desc" rows="2" placeholder="Summary for catalog navigation...">${catToEdit ? escapeHtml(catToEdit.description) : ''}</textarea>
        </div>

        <!-- 2-column Grid: Icon & Theme Color -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:flex-end;">
          <div class="cat-form-group">
            <label for="cat-in-icon">Icon Identifier</label>
            <select id="cat-in-icon">
              <option value="truck" ${catToEdit?.icon === 'truck' ? 'selected' : ''}>Tractor / Haulage (Truck)</option>
              <option value="box" ${catToEdit?.icon === 'box' ? 'selected' : ''}>Harvester Unit (Box)</option>
              <option value="layers" ${catToEdit?.icon === 'layers' ? 'selected' : ''}>Tiller / Ploughs (Layers)</option>
              <option value="drop" ${catToEdit?.icon === 'drop' ? 'selected' : ''}>Sprayer / Fluids (Drop)</option>
              <option value="gear" ${catToEdit?.icon === 'gear' ? 'selected' : ''}>Spares & Parts (Gear)</option>
              <option value="grid" ${catToEdit?.icon === 'grid' ? 'selected' : ''}>General Machinery (Grid)</option>
            </select>
          </div>

          <div class="cat-form-group">
            <label>Storefront Theme Accent</label>
            <div class="cat-color-picker-wrap">
              ${['#009140', '#0284c7', '#d97706', '#dc2626', '#475569'].map((col) => `
                <button type="button" class="cat-color-chip ${activeColor.toLowerCase() === col ? 'is-active' : ''}" data-color="${col}" style="background:${col};" title="${col}"></button>
              `).join('')}
              <div class="cat-color-row" style="margin-left:auto;">
                <input type="color" id="cat-in-color" value="${activeColor}" />
                <span class="cat-color-preview" id="cat-color-preview">${activeColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer class="cat-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary btn-save-cat">
          ${renderIcon('check')}<span>${isEdit ? 'Save Changes' : 'Create Category'}</span>
        </button>
      </footer>
    </div>
  `;

  modalEl.showModal();
  gsap.fromTo(
    modalEl,
    { opacity: 0, y: 16, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)', clearProps: 'transform' }
  );

  // Preset button selection
  const bannerInput = modalEl.querySelector('#cat-in-banner') as HTMLInputElement;
  modalEl.querySelectorAll('.cat-img-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('.cat-img-preset-btn').forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      const url = (btn as HTMLElement).dataset.url || '';
      if (bannerInput) bannerInput.value = url;
    });
  });

  // Color chips selection & sync
  const colorInput = modalEl.querySelector('#cat-in-color') as HTMLInputElement;
  const colorPreview = modalEl.querySelector('#cat-color-preview') as HTMLElement;
  modalEl.querySelectorAll('.cat-color-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const col = (chip as HTMLElement).dataset.color || '#009140';
      modalEl.querySelectorAll('.cat-color-chip').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeColor = col;
      if (colorInput) colorInput.value = col;
      if (colorPreview) colorPreview.textContent = col;
    });
  });

  colorInput?.addEventListener('input', () => {
    activeColor = colorInput.value;
    if (colorPreview) colorPreview.textContent = colorInput.value;
    modalEl.querySelectorAll('.cat-color-chip').forEach((c) => {
      c.classList.toggle('is-active', (c as HTMLElement).dataset.color?.toLowerCase() === activeColor.toLowerCase());
    });
  });

  // Close handlers
  const closeModal = () => {
    gsap.to(modalEl, {
      opacity: 0,
      y: 10,
      scale: 0.97,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => modalEl.close(),
    });
  };

  modalEl.querySelectorAll('.btn-close-modal').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  modalEl.querySelector('.btn-save-cat')?.addEventListener('click', () => {
    const name = (modalEl.querySelector('#cat-in-name') as HTMLInputElement).value.trim();
    const code = (modalEl.querySelector('#cat-in-code') as HTMLInputElement).value.trim();
    const slug = (modalEl.querySelector('#cat-in-slug') as HTMLInputElement).value.trim();
    const desc = (modalEl.querySelector('#cat-in-desc') as HTMLTextAreaElement).value.trim();
    const icon = (modalEl.querySelector('#cat-in-icon') as HTMLSelectElement).value;
    const color = activeColor || '#009140';
    const banner = (modalEl.querySelector('#cat-in-banner') as HTMLInputElement).value.trim() || '/brand/cat_tractor.jpg';

    if (!name) {
      showToast('Please enter category name', { ico: 'alert' });
      return;
    }

    const cats = getStoredCategories();
    if (isEdit) {
      const target = cats.find((c) => c.id === catToEdit.id);
      if (target) {
        target.name = name;
        target.code = code || target.code;
        target.slug = slug || target.slug;
        target.description = desc;
        target.icon = icon;
        target.accentColor = color;
        target.bannerUrl = banner;
      }
      showToast('Category updated successfully!', { ico: 'check' });
    } else {
      const newCat: MainCategory = {
        id: `cat-${Date.now()}`,
        name,
        code: code || `CAT-${name.slice(0, 4).toUpperCase()}`,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description: desc,
        icon: icon || 'grid',
        accentColor: color || '#009140',
        order: cats.length + 1,
        subCategoryCount: 0,
        productCount: 0,
        featured: true,
        active: true,
        bannerUrl: banner,
      };
      cats.push(newCat);
      showToast(`Category "${newCat.name}" created!`, { ico: 'check' });
    }

    saveStoredCategories(cats);
    closeModal();
    updateMainCategoriesGrid(true);
  });
}

function showAddEditSubCategoryDialog(subToEdit?: SubCategory): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;
  const isEdit = !!subToEdit;
  const cats = getStoredCategories();

  modalEl.innerHTML = `
    <div class="cat-dialog">
      <header class="cat-dialog__header">
        <div class="cat-dialog__header-left">
          <h3 class="cat-dialog__title">${isEdit ? 'Edit Sub-Category & Implement' : 'Add New Sub-Category'}</h3>
          <p class="cat-dialog__sub">Define implement types, attachment specs, and power requirements</p>
        </div>
        <button type="button" class="btn btn--icon btn--ghost btn-close-modal" aria-label="Close modal">${renderIcon('close')}</button>
      </header>
      <div class="cat-dialog__body">
        <div class="cat-form-group">
          <label for="sub-in-parent">Parent Category *</label>
          <select id="sub-in-parent">
            ${cats.map((c) => `<option value="${c.id}" ${subToEdit?.parentId === c.id ? 'selected' : ''}>${escapeHtml(c.name)} (${c.code})</option>`).join('')}
          </select>
        </div>

        <div class="cat-form-group">
          <label for="sub-in-name">Sub-Category Name *</label>
          <input type="text" id="sub-in-name" value="${subToEdit ? escapeHtml(subToEdit.name) : ''}" placeholder="e.g. Heavy 4WD Field Tractors" required />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="cat-form-group">
            <label for="sub-in-code">Sub Code</label>
            <input type="text" id="sub-in-code" value="${subToEdit ? escapeHtml(subToEdit.code) : ''}" placeholder="e.g. SUB-TRAC-01" />
          </div>
          <div class="cat-form-group">
            <label for="sub-in-hp">Recommended HP Range</label>
            <input type="text" id="sub-in-hp" value="${subToEdit?.minHPRange ? escapeHtml(subToEdit.minHPRange) : ''}" placeholder="e.g. 55-90 HP" />
          </div>
        </div>

        <div class="cat-form-group">
          <label for="sub-in-imp">Implement / Attachment Hitch Type</label>
          <input type="text" id="sub-in-imp" value="${subToEdit ? escapeHtml(subToEdit.implementType) : ''}" placeholder="e.g. Cat-2 Three Point Hitch" />
        </div>

        <div class="cat-form-group">
          <label for="sub-in-desc">Description</label>
          <textarea id="sub-in-desc" rows="2" placeholder="Summary for catalog filtering...">${subToEdit ? escapeHtml(subToEdit.description) : ''}</textarea>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="cat-form-group">
            <label for="sub-in-status">Storefront Status</label>
            <select id="sub-in-status">
              <option value="true" ${subToEdit?.active !== false ? 'selected' : ''}>🟢 Live on Storefront</option>
              <option value="false" ${subToEdit?.active === false ? 'selected' : ''}>⚪ Draft / Hidden</option>
            </select>
          </div>
          <div class="cat-form-group">
            <label for="sub-in-order">Display Order</label>
            <input type="number" id="sub-in-order" value="${subToEdit ? subToEdit.order : 1}" min="1" max="99" />
          </div>
        </div>
      </div>
      <footer class="cat-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary btn-save-sub">
          ${renderIcon('check')}<span>${isEdit ? 'Save Changes' : 'Create Sub-Category'}</span>
        </button>
      </footer>
    </div>
  `;

  modalEl.showModal();
  gsap.fromTo(
    modalEl,
    { opacity: 0, y: 16, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)', clearProps: 'transform' }
  );

  const closeModal = () => {
    gsap.to(modalEl, {
      opacity: 0,
      y: 10,
      scale: 0.97,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => modalEl.close(),
    });
  };

  modalEl.querySelectorAll('.btn-close-modal').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  modalEl.querySelector('.btn-save-sub')?.addEventListener('click', () => {
    const parentId = (modalEl.querySelector('#sub-in-parent') as HTMLSelectElement).value;
    const name = (modalEl.querySelector('#sub-in-name') as HTMLInputElement).value.trim();
    const code = (modalEl.querySelector('#sub-in-code') as HTMLInputElement).value.trim();
    const hp = (modalEl.querySelector('#sub-in-hp') as HTMLInputElement).value.trim();
    const imp = (modalEl.querySelector('#sub-in-imp') as HTMLInputElement).value.trim();
    const desc = (modalEl.querySelector('#sub-in-desc') as HTMLTextAreaElement).value.trim();
    const active = (modalEl.querySelector('#sub-in-status') as HTMLSelectElement).value === 'true';
    const order = Number((modalEl.querySelector('#sub-in-order') as HTMLInputElement).value) || 1;

    if (!name) {
      showToast('Please enter sub-category name', { ico: 'alert' });
      return;
    }

    const parentCat = cats.find((c) => c.id === parentId);
    const subs = getStoredSubCategories();

    if (isEdit) {
      const target = subs.find((s) => s.id === subToEdit.id);
      if (target) {
        target.parentId = parentId;
        target.parentName = parentCat?.name || target.parentName;
        target.name = name;
        target.code = code || target.code;
        target.minHPRange = hp;
        target.implementType = imp;
        target.description = desc;
        target.active = active;
        target.order = order;
      }
      showToast('Sub-category updated!', { ico: 'check' });
    } else {
      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        parentId,
        parentName: parentCat?.name || 'General Machinery',
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        code: code || `SUB-${name.slice(0, 4).toUpperCase()}`,
        description: desc,
        implementType: imp || 'Cat-1 Standard',
        productCount: 0,
        order,
        active,
        minHPRange: hp,
      };
      subs.push(newSub);
      showToast(`Sub-category "${newSub.name}" added!`, { ico: 'check' });
    }

    saveStoredSubCategories(subs);
    closeModal();
    updateSubCategoriesTable(true);
  });
}

function showAddEditModelDialog(modelToEdit?: MachineryModel): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;
  const isEdit = !!modelToEdit;
  let activeImage = modelToEdit?.imageUrl || '/brand/cat_tractor.jpg';

  modalEl.innerHTML = `
    <div class="cat-dialog">
      <header class="cat-dialog__header">
        <div class="cat-dialog__header-left">
          <h3 class="cat-dialog__title">${isEdit ? 'Edit Machinery Model' : 'Register Machinery Model'}</h3>
          <p class="cat-dialog__sub">Add tractor or combine specification to the interoperability matrix</p>
        </div>
        <button type="button" class="btn btn--icon btn--ghost btn-close-modal" aria-label="Close modal">${renderIcon('close')}</button>
      </header>
      <div class="cat-dialog__body">
        <!-- Model Name -->
        <div class="cat-form-group">
          <label for="mod-in-name">Model Name *</label>
          <input type="text" id="mod-in-name" value="${modelToEdit ? escapeHtml(modelToEdit.name) : ''}" placeholder="e.g. Vels 60HP 4WD Super Agro" required />
        </div>

        <!-- Brand & Model Code -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="cat-form-group">
            <label for="mod-in-brand">Brand Line *</label>
            <select id="mod-in-brand">
              ${INITIAL_BRANDS.map((b) => `<option value="${b.id}" ${modelToEdit?.brandId === b.id ? 'selected' : ''}>${escapeHtml(b.name)}</option>`).join('')}
            </select>
          </div>
          <div class="cat-form-group">
            <label for="mod-in-code">Model Code *</label>
            <input type="text" id="mod-in-code" value="${modelToEdit ? escapeHtml(modelToEdit.modelCode) : ''}" placeholder="e.g. VELS-60-4WD" />
          </div>
        </div>

        <!-- Specs: 2x2 Clean Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="cat-form-group">
            <label for="mod-in-hp">Power Rating (HP)</label>
            <input type="number" id="mod-in-hp" value="${modelToEdit ? modelToEdit.horsePower : 50}" min="10" max="250" />
          </div>
          <div class="cat-form-group">
            <label for="mod-in-drive">Chassis Drive Type</label>
            <select id="mod-in-drive">
              <option value="4WD" ${modelToEdit?.driveType === '4WD' || !modelToEdit ? 'selected' : ''}>4WD (All-Wheel Drive)</option>
              <option value="2WD" ${modelToEdit?.driveType === '2WD' ? 'selected' : ''}>2WD (Rear Drive)</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="cat-form-group">
            <label for="mod-in-pto">PTO Output Speed</label>
            <select id="mod-in-pto">
              <option value="540" ${modelToEdit?.ptoRPM === 540 || !modelToEdit ? 'selected' : ''}>540 RPM Standard</option>
              <option value="1000" ${modelToEdit?.ptoRPM === 1000 ? 'selected' : ''}>1000 RPM High Torque</option>
            </select>
          </div>
          <div class="cat-form-group">
            <label for="mod-in-hitch">Three-Point Hitch Category</label>
            <select id="mod-in-hitch">
              <option value="Cat-1" ${modelToEdit?.hitchCategory === 'Cat-1' ? 'selected' : ''}>Cat-1 Linkage (Compact)</option>
              <option value="Cat-2" ${modelToEdit?.hitchCategory === 'Cat-2' || !modelToEdit ? 'selected' : ''}>Cat-2 Linkage (Standard Agro)</option>
              <option value="Cat-3" ${modelToEdit?.hitchCategory === 'Cat-3' ? 'selected' : ''}>Cat-3 Linkage (Heavy / Combine)</option>
            </select>
          </div>
        </div>

        <!-- Price -->
        <div class="cat-form-group">
          <label for="mod-in-price">Ex-Showroom Price (INR ₹)</label>
          <input type="number" id="mod-in-price" value="${modelToEdit ? modelToEdit.price : 650000}" step="10000" />
        </div>

        <!-- Machinery Banner Image Presets -->
        <div class="cat-form-group cat-img-picker">
          <label>Machinery Photo Preset</label>
          <div class="cat-img-presets" id="mod-img-presets">
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_tractor') ? 'is-selected' : ''}" data-url="/brand/cat_tractor.jpg">
              <img src="/brand/cat_tractor.jpg" alt="Tractor" />
              <span>Tractor</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('tractor_bg') ? 'is-selected' : ''}" data-url="/brand/tractor_bg.jpg">
              <img src="/brand/tractor_bg.jpg" alt="Heavy Tractor" />
              <span>Heavy 4WD</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_tiller') ? 'is-selected' : ''}" data-url="/brand/cat_tiller.jpg">
              <img src="/brand/cat_tiller.jpg" alt="Tiller" />
              <span>Orchard / Tiller</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_harvester') ? 'is-selected' : ''}" data-url="/brand/cat_harvester.jpg">
              <img src="/brand/cat_harvester.jpg" alt="Harvester" />
              <span>Combine</span>
            </button>
          </div>
          <input type="text" id="mod-in-image" value="${activeImage}" placeholder="Image URL (e.g. /brand/cat_tractor.jpg)" />
        </div>
      </div>
      <footer class="cat-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary btn-save-mod">
          ${renderIcon('check')}<span>${isEdit ? 'Save Changes' : 'Register Model'}</span>
        </button>
      </footer>
    </div>
  `;

  modalEl.showModal();
  gsap.fromTo(
    modalEl,
    { opacity: 0, y: 16, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)', clearProps: 'transform' }
  );

  // Image Preset buttons
  const imgInput = modalEl.querySelector('#mod-in-image') as HTMLInputElement;
  modalEl.querySelectorAll('#mod-img-presets .cat-img-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('#mod-img-presets .cat-img-preset-btn').forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      const url = (btn as HTMLElement).dataset.url || '';
      if (imgInput) imgInput.value = url;
    });
  });

  const closeModal = () => {
    gsap.to(modalEl, {
      opacity: 0,
      y: 10,
      scale: 0.97,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => modalEl.close(),
    });
  };

  modalEl.querySelectorAll('.btn-close-modal').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  modalEl.querySelector('.btn-save-mod')?.addEventListener('click', () => {
    const name = (modalEl.querySelector('#mod-in-name') as HTMLInputElement).value.trim();
    const brandId = (modalEl.querySelector('#mod-in-brand') as HTMLSelectElement).value;
    const modelCode = (modalEl.querySelector('#mod-in-code') as HTMLInputElement).value.trim();
    const hp = Number((modalEl.querySelector('#mod-in-hp') as HTMLInputElement).value) || 45;
    const drive = (modalEl.querySelector('#mod-in-drive') as HTMLSelectElement).value as '2WD' | '4WD';
    const pto = Number((modalEl.querySelector('#mod-in-pto') as HTMLSelectElement).value) || 540;
    const hitch = (modalEl.querySelector('#mod-in-hitch') as HTMLSelectElement).value as any;
    const price = Number((modalEl.querySelector('#mod-in-price') as HTMLInputElement).value) || 600000;
    const imageUrl = (modalEl.querySelector('#mod-in-image') as HTMLInputElement).value.trim() || '/brand/cat_tractor.jpg';

    if (!name) {
      showToast('Please enter model name', { ico: 'alert' });
      return;
    }

    const brand = INITIAL_BRANDS.find((b) => b.id === brandId);
    const models = getStoredMachineryModels();

    if (isEdit) {
      const target = models.find((m) => m.id === modelToEdit.id);
      if (target) {
        target.name = name;
        target.brandId = brandId;
        target.brandName = brand?.name.split(' ')[0] || 'Vels';
        target.modelCode = modelCode || target.modelCode;
        target.horsePower = hp;
        target.driveType = drive;
        target.ptoRPM = pto;
        target.hitchCategory = hitch;
        target.price = price;
        target.imageUrl = imageUrl;
      }
      showToast(`Model "${name}" updated!`, { ico: 'check' });
    } else {
      const newMod: MachineryModel = {
        id: `mod-${Date.now()}`,
        brandId,
        brandName: brand?.name.split(' ')[0] || 'Vels',
        name,
        modelCode: modelCode || `VELS-${hp}-${drive}`,
        horsePower: hp,
        driveType: drive,
        ptoRPM: pto,
        hitchCategory: hitch,
        price,
        imageUrl,
      };
      models.push(newMod);
      showToast(`Machinery model "${newMod.name}" registered!`, { ico: 'check' });
    }

    saveStoredMachineryModels(models);
    closeModal();
    updateCompatibilityMatrix(true);
  });
}

function showSubCategoryProductsDrawer(subId: string): void {
  const subs = getStoredSubCategories();
  const sub = subs.find((s) => s.id === subId);
  if (!sub) return;
  const products = store?.products || [];

  const html = `
    <header class="d-head">
      ${renderTag('layers', 'ocean')}
      <div>
        <h2 class="d-head__title">${escapeHtml(sub.name)}</h2>
        <p class="d-head__sub">${escapeHtml(sub.parentName)} · <span class="mono">${escapeHtml(sub.code)}</span></p>
      </div>
    </header>

    <div class="d-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 16px;">
      <!-- Spec info card -->
      <div class="card" style="padding: 14px 16px; background: var(--surface-2); border-radius: 12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:12px; color:var(--muted); font-weight:700;">HITCH / IMPLEMENT</span>
          <b>${escapeHtml(sub.implementType)}</b>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="font-size:12px; color:var(--muted); font-weight:700;">HORSEPOWER RANGE</span>
          <b>${escapeHtml(sub.minHPRange || 'All Categories')}</b>
        </div>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin: 0;">${escapeHtml(sub.description)}</p>

      <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted);">
        Mapped Storefront SKUs (${products.length ? Math.min(products.length, sub.productCount || 8) : 0})
      </h4>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${products.slice(0, 8).map((p: any) => `
          <div class="card" style="padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; border-radius: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="thumb thumb--sm">${renderProductThumb(p, 'sm')}</span>
              <div>
                <b style="font-size: 13.5px; display: block;">${escapeHtml(p.name)}</b>
                <small style="color: var(--muted); font-size: 11px;">${escapeHtml(p.sku)} · ${typeof p.stock === 'object' ? p.stock?.dc ?? 24 : p.stock || 24} units</small>
              </div>
            </div>
            <a href="#/products/item/${p.id}" class="btn btn--ghost btn--xs">View SKU</a>
          </div>
        `).join('')}
      </div>

      <button type="button" class="btn btn--primary" id="btn-assign-prods" style="margin-top: 10px;">
        ${renderIcon('plus')}Assign More Machinery SKUs
      </button>
    </div>
  `;

  openDrawer(html);
  queryOne('#btn-assign-prods')?.addEventListener('click', () => {
    showToast('Redirecting to Products Catalog...', { ico: 'box' });
    closeDrawer();
    window.location.hash = '#/products/catalog';
  });
}

// -------------------------------------------------------------
// 5. LIFECYCLE & ROUTER EXPORT
// -------------------------------------------------------------
export const page = {
  title: 'Machinery Categories & Brands — Vels Agro Admin',

  mount(el: HTMLElement) {
    containerEl = el;
    containerEl.innerHTML = `
      <div data-sub="list" hidden></div>
      <div data-sub="sub" hidden></div>
      <div data-sub="brands" hidden></div>
    `;

    // Mount subtab 1: list
    const listView = subEl('list');
    if (listView) {
      listView.innerHTML = renderMainCategoriesSubtabHTML();
      updateMainCategoriesGrid();
      bindMainCategoriesEvents();
    }

    // Mount subtab 2: sub
    const subView = subEl('sub');
    if (subView) {
      subView.innerHTML = renderSubCategoriesSubtabHTML();
      updateSubCategoriesTable();
      bindSubCategoriesEvents();
    }

    // Mount subtab 3: brands
    const brandsView = subEl('brands');
    if (brandsView) {
      brandsView.innerHTML = renderBrandCompatibilitySubtabHTML();
      updateCompatibilityMatrix();
      bindBrandMatrixEvents();
    }
  },

  enter({ params }: { params?: string[]; same?: boolean } = {}) {
    const sub = SUBTABS.includes(params?.[0] || '') ? params![0] : 'list';
    currentSubtab = sub;

    // Support query params e.g. parent=cat-tractors
    if (window.location.hash.includes('parent=')) {
      const match = window.location.hash.match(/parent=([^&]+)/);
      if (match && match[1]) {
        subParentFilter = match[1];
      }
    }

    SUBTABS.forEach((s) => {
      const v = subEl(s);
      if (v) v.hidden = s !== sub;
    });

    if (sub === 'list') {
      updateMainCategoriesGrid();
      animateCategoriesEntrance();
    } else if (sub === 'sub') {
      updateSubCategoriesTable();
      animateSubCategoriesEntrance();
    } else if (sub === 'brands') {
      updateCompatibilityMatrix();
      animateBrandMatrixEntrance();
    }
  },

  leave() {
    closeDrawer();
  },
};

export const CategoriesFeature = page;
export default page;
