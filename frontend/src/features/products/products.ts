import {
  escapeHtml,
  BATCH_STATUS_TONES,
  formatRelativeDay,
  store,
  ACTIVE_ORDER_STAGES,
  getAlertItems,
  showToast,
  closeDrawer,
  getActiveOrdersForLocation,
  ONE_DAY_MS,
  renderEmptyState,
  getTotalStockUnits,
  queryOne,
  animatePageTransition,
  domQuery,
  getTotalRetailValue,
  findProductById,
  CATEGORY_TONES,
  formatProductFullName,
  renderAvatar,
  motionDuration,
  findBatchById,
  renderTag,
  startOfToday,
  formatNumber,
  openDrawer,
  formatDate,
  getAvailableLocations,
  bindModalDismiss,
  getAvailableSuppliers,
  getMaterialStock,
  formatRelativeTime,
  getExpiringBatches,
  openMoveStockModal,
  formatInt,
  releaseBatch,
  findLocationById,
  formatMoney,
  updateBatchStatus,
  openNewTransferModal,
  renderProgressBar,
  animateRows,
  openQuickCreateModal,
  getLowStockProducts,
  Flip,
  formatPercent,
  openNewOrderModal,
  findMemberById,
  renderFilterBar,
  openMakeBatchModal,
  daysUntilExpiry,
  animateCards,
  formatShortDate,
  formatFileSize,
  exportStockCsv,
  exportDataBackup,
  formatMoneyRound,
  findMaterialById,
  pluralize,
  adjustStock,
  generateDateSeries,
  animateMagneticElement,
  renderIconButton,
  isProductLowStock,
  animatePop,
  highlightSearchMatch,
  gsap,
  renderPill,
  domQueryAll,
  renderIcon,
  getOutOfStockProducts,
  bindMagnetic,
  createCustomElement,
  openStockAdjustModal,
  findCustomerById,
  isHoverCapable,
  renderPageHeader,
  ANIMATION_FLAGS,
  openNewBatchModal,
  renderSegmentedControl,
  renderProductThumb,
  getProductStock,
  renderOrderStatusBadge,
  initSegmentedControl,
  STOCK_MOVE_REASON_NAMES,
} from "../../main.ts";
import { createLineChart } from "../../shared/widgets/charts.ts";
import "../categories/categories.css";
let k;
let A = `catalog`;
const j = new Set();
const M = (e) => domQuery(`:scope > [data-sub="${e}"]`, k);
const N = (e) => domQuery(`[data-k="${e}"]`, k);
const P = (e) => !!k && !k.hidden && A === e;
const rt = {
  dc: `pine`,
  lab: `ocean`,
  shop: `ochre`,
};
const it = {
  dc: `warehouse`,
  lab: `flask`,
  shop: `store`,
};
const at = {
  production: [`flask`, `ocean`],
  sale: [`truck`, `pine`],
  transfer: [`swap`, `teal`],
  return: [`return`, `sky`],
  adjust: [`edit`, `ochre`],
  count: [`clipCheck`, `sage`],
  receipt: [`cart`, `ochre`],
};
const ot = (e) => {
  if (e.kind === `dc`) {
    return `DC`;
  }
  if (e.kind === `lab`) {
    return `Lab`;
  }
  return `Shop`;
};
const st = (e) => Math.max(0, Math.min(1, e));
const ct = (ref) => /^[A-Z]{1,4}-?\d/.test(ref);
const lt = (e, t) => {
  if (getOutOfStockProducts(e) || t < 14) {
    return `rose`;
  }
  if (t < 30) {
    return `ochre`;
  }
  if (isFinite(t)) {
    return `sage`;
  }
  return `slate`;
};
const ut = (e) => {
  if (isFinite(e)) {
    return st(e / 90);
  }
  return 1;
};
const dt = (e) => {
  if (isFinite(e)) {
    return `${formatInt(Math.max(0, e))} d`;
  }
  return `No sales`;
};
const F = (e) => {
  if (getOutOfStockProducts(e)) {
    return `out`;
  }
  if (isProductLowStock(e)) {
    return `low`;
  }
  return ``;
};
const ft = (e) => {
  if (getOutOfStockProducts(e)) {
    return renderPill(`Out at DC`, `rose`, `alert`);
  }
  if (isProductLowStock(e)) {
    return renderPill(`Running low`, `ochre`);
  }
  return ``;
};
const I = (e, t, n = ``) =>
  `<span class="meter__fill" ${n} data-v="${st(e)}" style="--c:var(--${t});transform:scaleX(${st(e)})"></span>`;
function pt(e, t, n) {
  if (e instanceof HTMLElement) {
    if (n) {
      e.style.setProperty(`--c`, `var(--${n})`);
    }
    e.dataset.v = String(st(t));
    gsap.to(e, {
      scaleX: st(t),
      duration: motionDuration(0.75),
      ease: `power3.inOut`,
      overwrite: true,
    });
  }
}
function mt(e, t = 0) {
  if (e.length) {
    gsap.fromTo(
      e,
      {
        scaleX: 0,
      },
      {
        scaleX: (e, t) => Number(t.dataset.v ?? 0),
        duration: motionDuration(1.1),
        ease: `power3.inOut`,
        stagger: motionDuration(0.018),
        delay: motionDuration(t),
        overwrite: true,
      }
    );
  }
}
function L(e, t) {
  if (!(!e || e.textContent === t)) {
    e.textContent = t;
    getAvailableSuppliers(e);
  }
}
function ht(e, t, n) {
  t.forEach((t) => {
    let r = queryOne(`[data-stat="${t.key}"]`, e);
    if (!r) {
      return;
    }
    let i = queryOne(`b[data-count]`, r);
    if (i && Number(i.dataset.count) !== t.value) {
      if (n) {
        renderFilterBar(i, t.value);
        getAvailableSuppliers(queryOne(`.stat__value`, r));
      } else {
        i.dataset.count = String(t.value);
      }
    }
    let a = queryOne(`.badge`, r);
    if (a && t.badge) {
      a.textContent = t.badge;
      a.className = `badge badge--${t.tone ?? `plain`}`;
    }
  });
}
function gt(e, from) {
  let n = findBatchById(e);
  if (n) {
    openQuickCreateModal({
      title: `Put ${n.lot} on hold`,
      sub: `Its units come off sale until QA releases the lot again.`,
      from,
      submit: `Hold lot`,
      fields: [
        {
          name: `note`,
          label: `Reason`,
          wide: true,
          required: true,
          value: `Customer complaint — checking the retained sample`,
          placeholder: `What QA is checking`,
        },
      ],
      onSubmit: (t) => {
        X = e;
        ln = e;
        updateBatchStatus(e, t.note);
      },
    });
  }
}
function _t(e) {
  if (e.status === `quarantine`) {
    return `<a class="btn btn--primary btn--xs" href="/products/batches/${e.id}">${renderIcon(`shield`)}QA &amp; release</a>`;
  }
  if (e.status === `hold`) {
    return `<button type="button" class="btn btn--soft btn--xs" data-rel="${e.id}">${renderIcon(`shield`)}Release</button>`;
  }
  if (e.status === `released` && e.left > 0 && daysUntilExpiry(e) > 0) {
    return `<button type="button" class="btn btn--ghost btn--xs" data-hold="${e.id}">${renderIcon(`pause`)}Hold</button>`;
  }
  return ``;
}
const R = (e) => {
  if (e.status === `released` && daysUntilExpiry(e) <= 0) {
    return `expired`;
  }
  return e.status;
};
const vt = (e) => {
  let t = daysUntilExpiry(e);
  if (t < 30) {
    return `rose`;
  }
  if (t < 90) {
    return `ochre`;
  }
  return `sage`;
};
const AGRO_CATEGORIES = ['Tractors', 'Harvesters', 'Tillers', 'Sprayers', 'Spares', 'Implements'];

const yt = [
  [`name`, `Name`, `Name, A to Z`],
  [`stock`, `Stock`, `Most on hand`],
  [`cover`, `Cover`, `Fewest days of cover`],
  [`price`, `Price`, `Highest price`],
  [`hp`, `Horsepower`, `Highest HP (Tractors & Implements)`],
];
let z = `all`;
let B = `grid`;
let V = `name`;
let bt = ``;
let H = false;
let xt = 0;
let St = null;
let U = null;
function Ct(e, t = true) {
  let n = bt.trim().toLowerCase();
  let matchesCat = z === `all` ? AGRO_CATEGORIES.includes(e.category) : e.category === z;
  return (
    (!t || matchesCat) &&
    (!H || isProductLowStock(e)) &&
    (!n || `${e.name} ${e.size} ${e.sku} ${e.line || ''} ${e.brand || ''} ${e.modelCode || ''} ${e.category} ${e.barcode} ${e.compatibleModels?.join(' ') || ''}`.toLowerCase().includes(n))
  );
}
const wt = (e) => {
  let t = renderProgressBar(e);
  if (isFinite(t)) {
    return t;
  }
  return 1000000000;
};
function Tt() {
  let e = {
    name: () => 0,
    stock: (e, t) => getProductStock(t) - getProductStock(e),
    cover: (e, t) => wt(e) - wt(t),
    price: (e, t) => t.price - e.price,
    hp: (e, t) => (t.hp || 0) - (e.hp || 0),
  };
  return store.products
    .filter((e) => Ct(e))
    .sort(
      (t, n) =>
        e[V](t, n) ||
        formatProductFullName(t).localeCompare(formatProductFullName(n), `en`, {
          numeric: true,
        })
    );
}
function Et() {
  let alertCount = getAlertItems().length;
  let lowCount = getLowStockProducts().filter((e) => AGRO_CATEGORIES.includes(e.category)).length;
  let activeCount = store.products.filter((e) => e.active && AGRO_CATEGORIES.includes(e.category)).length;
  let agroProducts = store.products.filter((e) => AGRO_CATEGORIES.includes(e.category));
  let totalUnits = agroProducts.reduce((sum, p) => sum + getProductStock(p), 0);
  let totalValue = agroProducts.reduce((sum, p) => sum + (p.price || 0) * getProductStock(p), 0);

  return [
    {
      key: `skus`,
      icon: `box`,
      label: `Machinery SKUs`,
      value: activeCount,
      badge: `${AGRO_CATEGORIES.length} categories`,
      tone: `plain`,
      ico: `pine`,
    },
    {
      key: `units`,
      icon: `boxes`,
      label: `Units on hand`,
      value: totalUnits,
      ico: `teal`,
      badge: `Central DC & Yards`,
      tone: `plain`,
    },
    {
      key: `retail`,
      icon: `tag`,
      label: `Fleet inventory value`,
      value: totalValue,
      fmt: `money`,
      ico: `ochre`,
    },
    {
      key: `low`,
      icon: `alert`,
      label: `Low stock alerts`,
      value: lowCount,
      badge: alertCount ? `${alertCount} critical at Central DC` : `Stock healthy`,
      tone: alertCount ? `bad` : `good`,
      ico: `rose`,
    },
  ];
}
// -------------------------------------------------------------
// ADD / EDIT AGRO PRODUCT MODAL
// -------------------------------------------------------------
function showAddEditAgroProductModal(prodToEdit?: any): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;
  const isEdit = !!prodToEdit;
  let activeImage = prodToEdit?.image || prodToEdit?.photo || '/brand/cat_tractor.jpg';
  let activeCategory = prodToEdit?.category || 'Tractors';

  modalEl.innerHTML = `
    <div class="cat-dialog agro-prod-dialog">
      <header class="cat-dialog__header">
        <div class="cat-dialog__header-left">
          <h3 class="cat-dialog__title">${isEdit ? 'Edit Agricultural Machinery & Specs' : 'Add New Agricultural Machinery / Part'}</h3>
          <p class="cat-dialog__sub">Configure machinery specifications, horsepower, hitch category, PTO speed, pricing and model compatibility</p>
        </div>
        <button type="button" class="btn btn--icon btn--ghost btn-close-modal" aria-label="Close modal">${renderIcon('close')}</button>
      </header>
      <div class="cat-dialog__body">
        <!-- 1. Basic Product Info -->
        <div class="cat-form-group">
          <label for="prod-in-name">Product Name *</label>
          <input type="text" id="prod-in-name" value="${prodToEdit ? escapeHtml(prodToEdit.name) : ''}" placeholder="e.g. Vels Shakti 55 HP 4WD Utility Tractor" required />
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-cat">Category *</label>
            <select id="prod-in-cat">
              ${AGRO_CATEGORIES.map(c => `<option value="${c}" ${activeCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-brand">Brand</label>
            <select id="prod-in-brand">
              ${['Vels Agro', 'Captain', 'Shaktiman', 'Lemken', 'Maschio', 'Mahindra'].map(b => `<option value="${b}" ${prodToEdit?.brand === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-sku">SKU / Part Number *</label>
            <input type="text" id="prod-in-sku" value="${prodToEdit ? escapeHtml(prodToEdit.sku) : 'VELS-' + Date.now().toString().slice(-6)}" placeholder="e.g. VELS-TRAC-55X" required />
          </div>
        </div>

        <!-- 2. Agricultural Technical Specifications -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-hp">Horsepower (HP)</label>
            <input type="number" id="prod-in-hp" value="${prodToEdit?.hp || 0}" min="0" max="250" placeholder="e.g. 55" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-drive">Drive System</label>
            <select id="prod-in-drive">
              <option value="4WD" ${prodToEdit?.driveType === '4WD' ? 'selected' : ''}>4WD (Four Wheel)</option>
              <option value="2WD" ${prodToEdit?.driveType === '2WD' ? 'selected' : ''}>2WD (Rear Wheel)</option>
              <option value="Track" ${prodToEdit?.driveType === 'Track' ? 'selected' : ''}>Rubber Track</option>
              <option value="N/A" ${!prodToEdit?.driveType || prodToEdit?.driveType === 'N/A' ? 'selected' : ''}>N/A (Implement / Part)</option>
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-hitch">3-Point Hitch</label>
            <select id="prod-in-hitch">
              <option value="Cat-2" ${prodToEdit?.hitch === 'Cat-2' ? 'selected' : ''}>Cat-2 (Medium/Heavy)</option>
              <option value="Cat-1" ${prodToEdit?.hitch === 'Cat-1' ? 'selected' : ''}>Cat-1 (Compact &lt;45HP)</option>
              <option value="Cat-3" ${prodToEdit?.hitch === 'Cat-3' ? 'selected' : ''}>Cat-3 (Heavy &gt;90HP)</option>
              <option value="N/A" ${!prodToEdit?.hitch || prodToEdit?.hitch === 'N/A' ? 'selected' : ''}>N/A / Trailed</option>
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-pto">PTO RPM</label>
            <select id="prod-in-pto">
              <option value="540" ${prodToEdit?.ptoRPM === 540 ? 'selected' : ''}>540 RPM Standard</option>
              <option value="1000" ${prodToEdit?.ptoRPM === 1000 ? 'selected' : ''}>1000 RPM High Speed</option>
              <option value="0" ${!prodToEdit?.ptoRPM ? 'selected' : ''}>None / Unpowered</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-size">Working Size / Spec Summary</label>
            <input type="text" id="prod-in-size" value="${prodToEdit ? escapeHtml(prodToEdit.size) : '55 HP · 4WD'}" placeholder="e.g. 55 HP · 4WD or 7 Ft · 48 Blades" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-hsn">HSN Code</label>
            <input type="text" id="prod-in-hsn" value="${prodToEdit?.hsnCode || '870192'}" placeholder="e.g. 870192 (Tractor) or 8432 (Implements)" />
          </div>
        </div>

        <!-- 3. Machine & Model Compatibility -->
        <div class="cat-form-group">
          <label for="prod-in-compat">Compatible Machinery Models (Comma separated)</label>
          <input type="text" id="prod-in-compat" value="${prodToEdit?.compatibleModels ? escapeHtml(prodToEdit.compatibleModels.join(', ')) : 'Vels 55HP 4WD, Vels 45HP 2WD, Captain 28HP'}" placeholder="e.g. Vels 55HP 4WD, Captain 28HP, Universal Cat-2" />
        </div>

        <!-- 4. Pricing, MRP & GST Rate -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-mrp">MRP (₹) *</label>
            <input type="number" id="prod-in-mrp" value="${prodToEdit?.mrp || 785000}" min="0" step="500" required />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-price">Selling Price (₹) *</label>
            <input type="number" id="prod-in-price" value="${prodToEdit?.price || 720000}" min="0" step="500" required />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-wholesale">Dealer Price (₹)</label>
            <input type="number" id="prod-in-wholesale" value="${prodToEdit?.wholesale || 660000}" min="0" step="500" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-gst">GST Slab *</label>
            <select id="prod-in-gst">
              <option value="12" ${prodToEdit?.gstPct === 12 || (!prodToEdit?.gstPct && activeCategory !== 'Spares') ? 'selected' : ''}>12% (Machinery & Tractors)</option>
              <option value="18" ${prodToEdit?.gstPct === 18 || (!prodToEdit?.gstPct && activeCategory === 'Spares') ? 'selected' : ''}>18% (Spares & Parts)</option>
              <option value="5" ${prodToEdit?.gstPct === 5 ? 'selected' : ''}>5% (Special Concession)</option>
            </select>
          </div>
        </div>

        <!-- 5. Machinery Photo Selector -->
        <div class="cat-form-group cat-img-picker">
          <label>Machinery Photo / Banner</label>
          <div class="cat-img-presets" id="prod-img-presets">
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_tractor') ? 'is-selected' : ''}" data-url="/brand/cat_tractor.jpg">
              <img src="/brand/cat_tractor.jpg" alt="Tractor" />
              <span>Tractor</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('tractor_bg') ? 'is-selected' : ''}" data-url="/brand/tractor_bg.jpg">
              <img src="/brand/tractor_bg.jpg" alt="Field" />
              <span>Field 2WD</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_harvester') ? 'is-selected' : ''}" data-url="/brand/cat_harvester.jpg">
              <img src="/brand/cat_harvester.jpg" alt="Harvester" />
              <span>Harvester</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_tiller') ? 'is-selected' : ''}" data-url="/brand/cat_tiller.jpg">
              <img src="/brand/cat_tiller.jpg" alt="Tiller" />
              <span>Rotavator</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_sprayer') ? 'is-selected' : ''}" data-url="/brand/cat_sprayer.jpg">
              <img src="/brand/cat_sprayer.jpg" alt="Sprayer" />
              <span>Sprayer</span>
            </button>
            <button type="button" class="cat-img-preset-btn ${activeImage.includes('cat_spares') ? 'is-selected' : ''}" data-url="/brand/cat_spares.jpg">
              <img src="/brand/cat_spares.jpg" alt="Spares" />
              <span>Spares</span>
            </button>
          </div>
          <input type="text" id="prod-in-image" value="${activeImage}" placeholder="Photo URL (e.g. /brand/cat_tractor.jpg)" />
        </div>

        <!-- 6. Initial Warehouse Stock -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-stock-dc">Riverside Central DC</label>
            <input type="number" id="prod-in-stock-dc" value="${prodToEdit?.stock?.dc ?? 12}" min="0" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-stock-lab">Salem Regional Depot</label>
            <input type="number" id="prod-in-stock-lab" value="${prodToEdit?.stock?.lab ?? 6}" min="0" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-stock-shop">Coimbatore Hub</label>
            <input type="number" id="prod-in-stock-shop" value="${prodToEdit?.stock?.shop ?? 4}" min="0" />
          </div>
        </div>

        <!-- 7. Technical Description -->
        <div class="cat-form-group">
          <label for="prod-in-blurb">Technical Description & Engineering Notes</label>
          <textarea id="prod-in-blurb" rows="2" placeholder="Summary for catalog, dealer sheets and storefront...">${prodToEdit ? escapeHtml(prodToEdit.blurb || '') : ''}</textarea>
        </div>
      </div>
      <footer class="cat-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary" id="btn-save-prod-modal">${isEdit ? 'Save Changes' : 'Create Product'}</button>
      </footer>
    </div>
  `;

  if (!modalEl.open) modalEl.showModal();
  const dialogContent = queryOne('.cat-dialog', modalEl);
  if (dialogContent) animatePop(dialogContent);

  const closeModal = () => {
    gsap.to(modalEl, {
      opacity: 0,
      y: 10,
      scale: 0.98,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        modalEl.close();
        modalEl.innerHTML = '';
        gsap.set(modalEl, { opacity: 1, y: 0, scale: 1 });
      },
    });
  };

  domQueryAll('.btn-close-modal', modalEl).forEach((b) => b.addEventListener('click', closeModal));
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  // Handle Preset Image click
  const presetsWrap = queryOne('#prod-img-presets', modalEl);
  const imgInput = queryOne('#prod-in-image', modalEl) as HTMLInputElement;
  presetsWrap?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.cat-img-preset-btn') as HTMLElement;
    if (!btn) return;
    domQueryAll('.cat-img-preset-btn', presetsWrap).forEach(b => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
    if (btn.dataset.url && imgInput) {
      imgInput.value = btn.dataset.url;
    }
  });

  // Handle Save
  queryOne('#btn-save-prod-modal', modalEl)?.addEventListener('click', () => {
    const name = (queryOne('#prod-in-name', modalEl) as HTMLInputElement)?.value?.trim();
    const sku = (queryOne('#prod-in-sku', modalEl) as HTMLInputElement)?.value?.trim();
    if (!name || !sku) {
      showToast('Product Name and SKU are required', { ico: 'alert' });
      return;
    }

    const category = (queryOne('#prod-in-cat', modalEl) as HTMLSelectElement)?.value || 'Tractors';
    const brand = (queryOne('#prod-in-brand', modalEl) as HTMLSelectElement)?.value || 'Vels Agro';
    const hp = Number((queryOne('#prod-in-hp', modalEl) as HTMLInputElement)?.value) || 0;
    const driveType = (queryOne('#prod-in-drive', modalEl) as HTMLSelectElement)?.value || '4WD';
    const hitch = (queryOne('#prod-in-hitch', modalEl) as HTMLSelectElement)?.value || 'Cat-2';
    const ptoRPM = Number((queryOne('#prod-in-pto', modalEl) as HTMLSelectElement)?.value) || 0;
    const size = (queryOne('#prod-in-size', modalEl) as HTMLInputElement)?.value || `${hp ? hp + ' HP · ' + driveType : 'Standard'}`;
    const hsnCode = (queryOne('#prod-in-hsn', modalEl) as HTMLInputElement)?.value || '870192';
    const compatRaw = (queryOne('#prod-in-compat', modalEl) as HTMLInputElement)?.value || '';
    const compatibleModels = compatRaw.split(',').map(s => s.trim()).filter(Boolean);

    const mrp = Number((queryOne('#prod-in-mrp', modalEl) as HTMLInputElement)?.value) || 0;
    const price = Number((queryOne('#prod-in-price', modalEl) as HTMLInputElement)?.value) || mrp;
    const wholesale = Number((queryOne('#prod-in-wholesale', modalEl) as HTMLInputElement)?.value) || Math.round(price * 0.9);
    const gstPct = Number((queryOne('#prod-in-gst', modalEl) as HTMLSelectElement)?.value) || 12;
    const image = (queryOne('#prod-in-image', modalEl) as HTMLInputElement)?.value || '/brand/cat_tractor.jpg';
    const stockDc = Number((queryOne('#prod-in-stock-dc', modalEl) as HTMLInputElement)?.value) || 0;
    const stockLab = Number((queryOne('#prod-in-stock-lab', modalEl) as HTMLInputElement)?.value) || 0;
    const stockShop = Number((queryOne('#prod-in-stock-shop', modalEl) as HTMLInputElement)?.value) || 0;
    const blurb = (queryOne('#prod-in-blurb', modalEl) as HTMLTextAreaElement)?.value || '';
    const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    if (isEdit && prodToEdit) {
      prodToEdit.name = name;
      prodToEdit.sku = sku;
      prodToEdit.category = category;
      prodToEdit.brand = brand;
      prodToEdit.hp = hp;
      prodToEdit.driveType = driveType;
      prodToEdit.hitch = hitch;
      prodToEdit.ptoRPM = ptoRPM;
      prodToEdit.size = size;
      prodToEdit.hsnCode = hsnCode;
      prodToEdit.compatibleModels = compatibleModels;
      prodToEdit.mrp = mrp;
      prodToEdit.price = price;
      prodToEdit.wholesale = wholesale;
      prodToEdit.gstPct = gstPct;
      prodToEdit.image = image;
      prodToEdit.photo = image;
      prodToEdit.stock = { dc: stockDc, lab: stockLab, shop: stockShop };
      prodToEdit.blurb = blurb;
      prodToEdit.discountPct = discountPct;
      showToast(`${name} updated successfully!`, { ico: 'check' });
    } else {
      const newProd: any = {
        id: 'agro-' + Date.now().toString(36),
        sku,
        name,
        category,
        brand,
        hp,
        driveType,
        hitch,
        ptoRPM,
        size,
        hsnCode,
        compatibleModels,
        mrp,
        price,
        wholesale,
        cost: Math.round(price * 0.75),
        gstPct,
        image,
        photo: image,
        active: true,
        reorderAt: 10,
        reorderQty: 25,
        bin: 'YARD-NEW',
        shelfMonths: 48,
        barcode: '890' + Date.now().toString().slice(-10),
        blurb,
        discountPct,
        stock: { dc: stockDc, lab: stockLab, shop: stockShop },
      };
      store.products.unshift(newProd);
      showToast(`${name} added to machinery catalog!`, { ico: 'check' });
    }

    try {
      localStorage.setItem('Vels:data:v2', JSON.stringify(store));
    } catch {}

    closeModal();
    At();
    if (P('item') && prodToEdit) {
      $t(prodToEdit.id, true);
    }
  });
}

function Dt(t) {
  let n = renderProgressBar(t);
  let i = Math.max(1, getProductStock(t));
  let a = formatProductFullName(t);
  let o = bt.trim();
  let discPct = t.discountPct || (t.mrp && t.mrp > t.price ? Math.round(((t.mrp - t.price) / t.mrp) * 100) : 0);
  let gst = t.gstPct || (t.category === 'Spares' ? 18 : 12);
  let fitsList = t.compatibleModels || [];

  return `<article class="pcard pcard--agro" data-key="${t.id}" data-id="${t.id}">
    <a class="pcard__photo" href="/products/item/${t.id}" tabindex="-1" aria-hidden="true">
      ${renderProductThumb(t, `xl`)}
      <span class="pcard-gst-badge">${gst}% GST</span>
      <span class="pcard__flag" data-f="flag" data-s="${F(t)}">${t.active ? ft(t) : 'Archived'}</span>
    </a>
    <div class="pcard__name">
      <div class="pcard-brand-row">
        <span class="pcard-brand">${escapeHtml(t.brand || 'Vels Agro')}</span>
        <span class="mono pcard-sku">${highlightSearchMatch(t.sku, o)}</span>
      </div>
      <a href="/products/item/${t.id}" class="pcard-title-link"><b>${highlightSearchMatch(t.name, o)}</b></a>
      <div class="pcard-tags-row">
        <span class="tag pcard__cat" style="--c:var(--${CATEGORY_TONES[t.category] || 'pine'})">${escapeHtml(t.category)}</span>
        <span class="tag pcard__size">${escapeHtml(t.size || (t.hp ? `${t.hp} HP` : 'Standard'))}</span>
      </div>

      <!-- Agricultural Specs Chips -->
      <div class="pcard-specs-row">
        ${t.hp ? `<span class="pcard-spec-chip hp-chip">${renderIcon('truck')}<b>${t.hp} HP</b></span>` : ''}
        ${t.driveType && t.driveType !== 'N/A' ? `<span class="pcard-spec-chip drive-chip">${t.driveType}</span>` : ''}
        ${t.hitch && t.hitch !== 'N/A' ? `<span class="pcard-spec-chip hitch-chip">${t.hitch}</span>` : ''}
        ${t.ptoRPM ? `<span class="pcard-spec-chip pto-chip">${t.ptoRPM} RPM</span>` : ''}
      </div>

      <!-- Compatible Models Preview -->
      ${fitsList.length ? `
        <div class="pcard-compat">
          <span class="pcard-compat-label">Fits:</span>
          <span class="pcard-compat-tags">
            ${fitsList.slice(0, 2).map((m: any) => `<span class="compat-pill">${escapeHtml(m)}</span>`).join('')}
            ${fitsList.length > 2 ? `<span class="compat-more">+${fitsList.length - 2}</span>` : ''}
          </span>
        </div>
      ` : ''}

      <!-- Commercial Pricing Row -->
      <div class="pcard-price-row">
        <div class="pcard-price-main">
          <span class="pcard-price-curr">${formatMoney(t.price)}</span>
          ${t.mrp && t.mrp > t.price ? `<span class="pcard-price-mrp">${formatMoney(t.mrp)}</span>` : ''}
          ${discPct ? `<span class="pcard-price-disc">${discPct}% OFF</span>` : ''}
        </div>
        <div class="pcard-dealer-price"><small>Dealer:</small> <b>${formatMoney(t.wholesale || Math.round(t.price * 0.9))}</b></div>
      </div>
    </div>

    <!-- Stock By Location -->
    <div class="pcard__locs" role="list" aria-label="Stock by location">
      ${store.locations.map((e) => `<div class="pcard__loc" role="listitem"><span>${ot(e)}</span><span class="meter">${I(getProductStock(t, e.id) / i, rt[e.kind], `data-m="${e.id}"`)}</span><b class="num" data-f="loc-${e.id}">${formatInt(getProductStock(t, e.id))}</b></div>`).join(``)}
    </div>

    <div class="pcard__avail">
      <span><b class="num" data-f="avail">${formatInt(getMaterialStock(t))}</b> available</span>
      <span><b class="num" data-f="res">${formatInt(getActiveOrdersForLocation(t.id))}</b> reserved</span>
    </div>

    <div class="pcard__acts">
      <span class="pcard__adj" role="group" aria-label="Count fix at Central DC">
        ${renderIconButton(`minus`, `One less at Central DC`, `data-adj="-1"`, `ibtn--sm`)}
        <span class="pcard__dc"><b class="num" data-f="adj-dc">${formatInt(getProductStock(t, `dc`))}</b><small>at DC</small></span>
        ${renderIconButton(`plus`, `One more at Central DC`, `data-adj="1"`, `ibtn--sm`)}
      </span>
      <button type="button" class="ibtn ibtn--sm btn-edit-prod" data-edit-id="${t.id}" title="Edit product information" aria-label="Edit product">${renderIcon('edit')}</button>
      ${renderIconButton(`swap`, `Move stock between depots`, `data-do="move"`, `ibtn--sm`)}
    </div>
  </article>`;
}
function Ot() {
  let t = M(`catalog`);
  t.innerHTML = `${renderPageHeader({
    eyebrow: `Agricultural tractors, combine harvesters, tillers and OEM spares across Central DC and dealers`,
    title: `Machinery & Spares Catalog`,
    stats: Et(),
    actions: `<button type="button" class="btn btn--primary" id="btn-add-agro-prod">${renderIcon('plus')}<span>Add Product</span></button><button type="button" class="btn btn--ghost pc-export" data-do="export">${renderIcon(`download`)}<span>Export CSV</span></button><button type="button" class="btn btn--ghost" data-do="move">${renderIcon(`swap`)}<span>Move stock</span></button>`,
  })}
  <div class="pc-bar">
    <div class="chips pc-cats" role="group" aria-label="Category">${[[`all`, `All`], ...AGRO_CATEGORIES.map((e) => [e, e])].map(([t, n]) => `<button type="button" class="chip" data-cat="${t}" aria-pressed="${z === t}">${t === `all` ? `` : `<i class="dot" style="--c:var(--${CATEGORY_TONES[t] || 'pine'})"></i>`}${escapeHtml(n)} <b data-cn="${t}">0</b></button>`).join(``)}</div>
    <div class="pc-tools">
      <button type="button" class="chip pc-low" data-low aria-pressed="${H}">${renderIcon(`alert`)}Low only <b data-k="low-n">0</b></button>
      <label class="search pc-search">${renderIcon(`search`)}<input type="search" placeholder="Name, SKU or barcode…" aria-label="Search products" data-k="q" /></label>
      <button type="button" class="btn btn--ghost btn--sm pc-sort" data-k="sort" aria-haspopup="menu" aria-expanded="false">${renderIcon(`filter`)}<span>Sort: ${yt.find((e) => e[0] === V)[1]}</span>${renderIcon(`down`)}</button>
      ${renderSegmentedControl(
        `View`,
        [
          [`grid`, `Grid`],
          [`list`, `List`],
        ],
        B,
        `pc-view`
      )}
    </div>
  </div>
  <div class="pc-wrap" data-k="wrap" data-view="${B}">
    <div class="pc-lhead" aria-hidden="true"><span></span><span>Product</span><span>Stock by location</span><span>Free to sell</span><span>Cover</span><span>Count fix at the DC</span></div>
    <div class="pc-grid" data-k="grid"></div>
  </div>
  <p class="pc-foot" data-k="foot"></p>`;
  openMoveStockModal(t);
  St = initSegmentedControl(domQuery(`.pc-view`, t), (e) => Nt(e));
  W(false);
  N(`q`).addEventListener(`input`, (e) => {
    bt = e.target.value;
    W(true);
  });
  N(`sort`).addEventListener(`click`, (e) => {
    let e_currentTarget = e.currentTarget;
    openNewTransferModal(e_currentTarget);
    createCustomElement(
      e_currentTarget,
      yt.map(([e, n, label]) => ({
        label,
        checked: e === V,
        onSelect: () => {
          if (e !== V) {
            V = e;
            domQuery(`span`, e_currentTarget).textContent = `Sort: ${n}`;
            W(true);
          }
        },
      })),
      {
        align: `end`,
      }
    );
  });
  t.addEventListener(`click`, (e) => {
    let e_target = e.target as HTMLElement;

    // Add Product Modal trigger
    let addBtn = e_target.closest('#btn-add-agro-prod');
    if (addBtn) {
      showAddEditAgroProductModal();
      return;
    }

    // Edit Product Modal trigger
    let editBtn = e_target.closest('.btn-edit-prod') as HTMLElement;
    if (editBtn) {
      e.stopPropagation();
      let prodId = editBtn.dataset.editId;
      let prod = store.products.find((p) => p.id === prodId);
      if (prod) showAddEditAgroProductModal(prod);
      return;
    }

    let r = e_target.closest(`[data-adj]`);
    if (r) {
      Mt(r);
      return;
    }
    let i = e_target.closest(`[data-cat]`);
    if (i) {
      openNewTransferModal(i);
      if (z !== i.dataset.cat) {
        z = i.dataset.cat;
        W(true);
      }
      return;
    }
    let a = e_target.closest(`[data-low]`);
    if (a) {
      openNewTransferModal(a);
      H = !H;
      a.setAttribute(`aria-pressed`, String(H));
      W(true);
      return;
    }
    let o = e_target.closest(`[data-do]`);
    if (o) {
      openNewTransferModal(o);
      let e = o.closest(`.pcard`)?.dataset.id;
      if (o.dataset.do === `batch`) {
        openMakeBatchModal(e, o);
      } else if (o.dataset.do === `move`) {
        openNewBatchModal(
          {
            from: `dc`,
            to: `shop`,
            productId: e,
          },
          o
        );
      } else if (o.dataset.do === `export`) {
        exportStockCsv();
      } else if (o.dataset.do === `clear`) {
        z = `all`;
        bt = ``;
        H = false;
        domQuery(`[data-k="q"]`, t).value = ``;
        domQuery(`[data-low]`, t).setAttribute(`aria-pressed`, `false`);
        W(true);
      }
      return;
    }
    let s = e_target.closest(`.pcard`);
    if (s && !e_target.closest(`a, button, input, label`)) {
      (window as any).navigateTo(`/products/item/${s.dataset.id}`)
    }
  });
  let n = N(`grid`);
  let r = (e, t) => {
    if (!(!e || !isHoverCapable.matches || bindMagnetic() || !ANIMATION_FLAGS.v)) {
      gsap.to(
        e,
        t && B === `grid`
          ? {
              y: -5,
              duration: 0.45,
              ease: `power3.out`,
              overwrite: `auto`,
            }
          : {
              y: 0,
              duration: 0.5,
              ease: `power3.out`,
              overwrite: `auto`,
              clearProps: `transform`,
            }
      );
    }
  };
  n.addEventListener(`pointerover`, (e) => {
    let t = e.target.closest(`.pcard`);
    if (t !== U) {
      r(U, false);
      U = t;
      r(t, true);
    }
  });
  n.addEventListener(`pointerleave`, () => {
    r(U, false);
    U = null;
  });
}
function kt() {
  domQueryAll(`[data-cn]`, k).forEach((e) => {
    let t = e.dataset.cn;
    e.textContent = String(
      store.products.filter((e) => Ct(e, false) && (t === `all` || e.category === t)).length
    );
  });
  domQueryAll(`[data-cat]`, k).forEach((e) =>
    e.setAttribute(`aria-pressed`, String(e.dataset.cat === z))
  );
  L(queryOne(`[data-k="low-n"]`, k), String(getLowStockProducts().length));
}
function W(e) {
  let t = N(`grid`);
  let n = Tt();
  let i = n.length
    ? n.map(Dt).join(``)
    : `<div class="card pc-empty">${store.products.length ? renderEmptyState(`No products match`, `Try another category, clear the search or turn off Low only.`, `search`, `<button type="button" class="btn btn--ghost btn--sm" data-do="clear">${renderIcon(`refresh`)}Clear filters</button>`) : renderEmptyState(`No products yet`, `Add a product and its stock shows up here.`, `box`)}</div>`;
  U = null;
  if (e) {
    bindModalDismiss(t, () => {
      t.innerHTML = i;
    });
  } else {
    t.innerHTML = i;
  }
  if (!n.length && e) {
    animatePop(queryOne(`.pc-empty`, t), {
      from: 0.92,
    });
  }
  kt();
  let a = N(`foot`);
  a.hidden = !n.length;
  a.textContent = `Showing ${n.length} of ${pluralize(store.products.length, `product`)} · ${yt.find((e) => e[0] === V)[2].toLowerCase()}`;
}
function At() {
  let e = N(`grid`);
  let t = Tt();
  if (
    t.map((e) => e.id).join() ===
    domQueryAll(`.pcard`, e)
      .map((e) => e.dataset.key)
      .join()
  ) {
    t.forEach((t) => {
      let n = queryOne(`.pcard[data-key="${t.id}"]`, e);
      if (n) {
        jt(n, t);
      }
    });
  } else {
    W(true);
  }
  kt();
  ht(M(`catalog`), Et(), true);
}
function jt(e, t) {
  let n = Math.max(1, getProductStock(t));
  let i = renderProgressBar(t);
  store.locations.forEach((r) => {
    L(queryOne(`[data-f="loc-${r.id}"]`, e), formatInt(getProductStock(t, r.id)));
    pt(queryOne(`[data-m="${r.id}"]`, e), getProductStock(t, r.id) / n);
  });
  L(queryOne(`[data-f="avail"]`, e), formatInt(getMaterialStock(t)));
  L(queryOne(`[data-f="res"]`, e), formatInt(getActiveOrdersForLocation(t.id)));
  L(queryOne(`[data-f="adj-dc"]`, e), formatInt(getProductStock(t, `dc`)));
  L(queryOne(`[data-f="cover"]`, e), dt(i));
  pt(queryOne(`[data-m="cover"]`, e), ut(i), lt(t, i));
  domQueryAll(`[data-f="flag"]`, e).forEach((e) => {
    if (e.dataset.s !== F(t)) {
      e.dataset.s = F(t);
      e.innerHTML = ft(t);
      animatePop(e.firstElementChild, {
        from: 0.4,
      });
    }
  });
}
function Mt(e) {
  let t = e.closest(`.pcard`);
  let n = findProductById(t?.dataset.id ?? ``);
  if (!t || !n) {
    return;
  }
  openNewTransferModal(e);
  let r = Number(e.dataset.adj);
  let i = queryOne(`[data-f="adj-dc"]`, t);
  if (r < 0 && getProductStock(n, `dc`) <= 0) {
    showToast(`No ${formatProductFullName(n)} on the shelf at Riverside DC`, {
      ico: `info`,
    });
    if (i && !bindMagnetic()) {
      gsap.fromTo(
        i,
        {
          x: -5,
        },
        {
          x: 0,
          duration: 0.5,
          ease: `elastic.out(1, 0.3)`,
          clearProps: `transform`,
        }
      );
    }
    return;
  }
  animateMagneticElement(i, r > 0 ? `+1` : `−1`);
  let lastElementChild = document.body.lastElementChild;
  if (r < 0 && lastElementChild?.classList.contains(`float-up`)) {
    lastElementChild.classList.add(`is-neg`);
  }
  adjustStock(n.id, `dc`, r, r > 0 ? `Found in stock` : `Damaged`);
}
function Nt(e) {
  if (e === B) {
    return;
  }
  B = e;
  let t = N(`wrap`);
  let n = domQueryAll(`.pcard`, t);
  let r = domQueryAll(`.pcard > *`, t);
  gsap.killTweensOf(n);
  gsap.set(n, {
    clearProps: `transform`,
  });
  U = null;
  let i = Flip.getState(n);
  t.dataset.view = e;
  if (!bindMagnetic()) {
    gsap.set(r, {
      opacity: 0,
    });
    Flip.from(i, {
      duration: 0.6,
      ease: `power3.inOut`,
      scale: true,
      stagger: 0.014,
      onComplete: () =>
        gsap.set(n, {
          clearProps: `transform`,
        }),
    });
    gsap.fromTo(
      r,
      {
        opacity: 0,
        y: 6,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        delay: 0.42,
        stagger: 0.004,
        ease: `power3.out`,
        clearProps: `transform,opacity`,
      }
    );
    if (e === `list`) {
      gsap.fromTo(
        domQuery(`.pc-lhead`, t),
        {
          opacity: 0,
          y: -6,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.3,
          ease: `power3.out`,
          clearProps: `transform,opacity`,
        }
      );
    }
  }
}
function Pt() {
  let e = M(`catalog`);
  ht(e, Et(), false);
  St?.place(false);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateRows(domQueryAll(`.pc-cats > .chip, .pc-tools > *`, e), {
        y: 10,
        stagger: 0.03,
      }),
      0.12
    )
    .add(
      animateCards(domQueryAll(`.pcard, .pc-empty, .pc-wrap[data-view="list"] .pc-lhead`, e), {
        y: 28,
        stagger: 0.045,
      }),
      0.18
    )
    .add(
      animateRows(domQueryAll(`.pc-foot`, e), {
        y: 6,
      }),
      0.6
    );
  mt(domQueryAll(`.pcard .meter__fill`, e), 0.5);
  const flagSpills = domQueryAll(`.pcard__photo .pcard__flag > .spill, .pcard__photo .pcard-gst-badge`, e);
  if (flagSpills.length) {
    animatePop(flagSpills, {
      from: 0.4,
      delay: 0.85,
      stagger: 0.08,
    });
  }
}
let G = ``;
let K = 30;
let Ft = 0;
let It = 0;
let Lt = null;
function Rt(e, t) {
  let values_1 = generateDateSeries(e.id, t);
  let values = values_1.map((e, t) => {
    let r = values_1.slice(Math.max(0, t - 6), t + 1);
    return Math.round((r.reduce((acc, item) => acc + item, 0) / r.length) * 10) / 10;
  });
  return {
    labels: values_1.map((e, n) => formatDate(startOfToday() - (t - 1 - n) * ONE_DAY_MS)),
    series: [
      {
        name: `Units sold`,
        values: values_1,
        tone: `pine`,
      },
      {
        name: `7-day average`,
        values,
        tone: `ochre`,
        dashed: true,
      },
    ],
  };
}
function zt(e, t) {
  let n = startOfToday() - (t - 1) * ONE_DAY_MS;
  let units = 0;
  let rev = 0;
  store.orders.forEach((t) => {
    if (!(t.createdAt < n || t.status === `cancelled`)) {
      t.lines.forEach((t) => {
        if (t.productId === e.id) {
          units += t.qty;
          rev += t.qty * t.price;
        }
      });
    }
  });
  return {
    units,
    rev,
  };
}
const Bt = (e, t) => {
  let n = getActiveOrdersForLocation(e.id, t.id);
  if (t.kind === `dc`) {
    return `Bin ${e.bin}${n ? ` · ${formatInt(n)} reserved` : ``}`;
  }
  if (t.kind === `lab`) {
    return `QA hold and retained samples`;
  }
  if (n) {
    return `${formatInt(n)} reserved`;
  }
  return t.city;
};
function Vt(per, unit) {
  if (unit === `kg`) {
    return `${formatNumber(per * 1000)} g`;
  }
  if (unit === `L`) {
    return `${formatNumber(per * 1000)} ml`;
  }
  if (unit === `rolls`) {
    return pluralize(Math.round(per * 1000), `label`);
  }
  return pluralize(per, `piece`);
}
const Ht = (e) =>
  store.batches.filter((t) => t.productId === e.id).sort((e, t) => t.madeAt - e.madeAt);
const Ut = (e) =>
  store.orders
    .filter(
      (t) => ACTIVE_ORDER_STAGES.includes(t.status) && t.lines.some((t) => t.productId === e.id)
    )
    .sort((e, t) => e.shipBy - t.shipBy);
const Wt = (e) =>
  e.bom.reduce((acc, item) => {
    let n = findMaterialById(item.materialId);
    if (n && item.per > 0) {
      return Math.min(acc, Math.floor(n.onHand / item.per));
    }
    return acc;
  }, Infinity);
function Gt(t) {
  let Bn_products = store.products;
  let i = Bn_products.indexOf(t);
  let n_length = Bn_products.length;
  let o = Bn_products[(i - 1 + n_length) % n_length];
  let s = Bn_products[(i + 1) % n_length];
  let c = (t.price - t.cost) / t.price;
  let ee = (t.wholesale - t.cost) / t.wholesale;
  let l = Math.max(1, getProductStock(t));
  return `${renderPageHeader({
    back: `/products/catalog`,
    title: escapeHtml(t.name),
    eyebrow: `${escapeHtml(t.category)} · ${escapeHtml(t.line)} line · ${escapeHtml(t.size)}`,
    actions: `<span class="pi-nav" role="group" aria-label="Browse products"><a class="ibtn ibtn--sm" href="/products/item/${o.id}" data-dir="-1" aria-label="Previous: ${escapeHtml(formatProductFullName(o))}" title="Previous: ${escapeHtml(formatProductFullName(o))}">${renderIcon(`chevL`)}</a><span class="pi-pos">${i + 1} of ${n_length}</span><a class="ibtn ibtn--sm" href="/products/item/${s.id}" data-dir="1" aria-label="Next: ${escapeHtml(formatProductFullName(s))}" title="Next: ${escapeHtml(formatProductFullName(s))}">${renderIcon(`chevR`)}</a></span>
      <button type="button" class="btn btn--primary" data-do="edit-prod">${renderIcon('edit')}<span>Edit Product</span></button><button type="button" class="btn btn--ghost" data-do="move">${renderIcon(`swap`)}<span>Move stock</span></button><button type="button" class="btn btn--ghost" data-do="order">${renderIcon(`orders`)}<span>New order</span></button>`,
  })}
  <div class="pi-grid">
    <aside class="card pi-hero" aria-label="Product facts">
      <div class="pi-photo">${renderProductThumb(t, `xl`)}<span class="pcard__flag" data-i="flag" data-s=""></span></div>
      <div class="pi-about">
        <div class="pi-tags">
          <span class="tag" style="--c:var(--${CATEGORY_TONES[t.category] || 'pine'})">${escapeHtml(t.category)}</span>
          <span class="tag">${escapeHtml(t.size || (t.hp ? `${t.hp} HP` : 'Standard'))}</span>
          <span class="tag" style="--c:var(--teal)">${t.gstPct || 12}% GST Slab</span>
          ${t.active ? renderPill(`On sale`, `sage`) : renderPill(`Archived`, `faint`)}
        </div>
        ${t.hp || t.hitch ? `
          <div class="pi-specs-card">
            <h3 style="margin:0 0 8px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--primary);">Agricultural Specifications</h3>
            <div class="pi-specs-grid">
              ${t.hp ? `<div class="pi-spec-item"><dt>Horsepower</dt><dd>${t.hp} HP Rating</dd></div>` : ''}
              ${t.driveType ? `<div class="pi-spec-item"><dt>Drive Type</dt><dd>${t.driveType}</dd></div>` : ''}
              ${t.hitch ? `<div class="pi-spec-item"><dt>3-Point Hitch</dt><dd>${t.hitch}</dd></div>` : ''}
              ${t.ptoRPM ? `<div class="pi-spec-item"><dt>PTO Speed</dt><dd>${t.ptoRPM} RPM</dd></div>` : ''}
              ${t.hsnCode ? `<div class="pi-spec-item"><dt>HSN Code</dt><dd class="mono">${t.hsnCode}</dd></div>` : ''}
              ${t.brand ? `<div class="pi-spec-item"><dt>Brand / OEM</dt><dd>${escapeHtml(t.brand)}</dd></div>` : ''}
            </div>
            ${t.compatibleModels?.length ? `
              <div style="margin-top:12px; padding-top:10px; border-top:1px dashed var(--line);">
                <dt style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">Compatible Machinery Models</dt>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                  ${t.compatibleModels.map((m: any) => `<span class="tag" style="font-size:11px; background:var(--surface-2); border:1px solid var(--line);">${escapeHtml(m)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
        <p class="pi-blurb">${escapeHtml(t.blurb)}</p>
        <dl class="pi-ids">
          <div><dt>SKU</dt><dd class="mono">${escapeHtml(t.sku)}</dd></div>
          <div><dt>Barcode</dt><dd class="mono pi-code">${renderIcon(`barcode`)}${escapeHtml(t.barcode)}</dd></div>
          <div><dt>Bin</dt><dd>${escapeHtml(t.bin)} · Riverside DC</dd></div>
          <div><dt>Shelf life</dt><dd>${t.shelfMonths} months</dd></div>
          <div><dt>Reorder</dt><dd>At ${formatInt(t.reorderAt)} · runs of ${formatInt(t.reorderQty)}</dd></div>
        </dl>
        <div class="d-facts pi-money">
          <div><small>Retail price</small><b>${formatMoney(t.price)}</b><span>${formatMoney(t.price - t.cost)} a unit</span></div>
          <div><small>Wholesale</small><b>${formatMoney(t.wholesale)}</b><span>${formatPercent(ee)} margin</span></div>
          <div><small>Unit cost</small><b>${formatMoney(t.cost)}</b><span>Materials and fill</span></div>
          <div><small>Retail margin</small><b>${formatPercent(c)}</b><span>Before shipping</span></div>
        </div>
      </div>
    </aside>
    <div class="pi-main">
      <section class="card pi-stock" aria-labelledby="pist-t">
        <header class="card__head"><div><h2 class="card__title" id="pist-t">Stock</h2><p class="card__sub">Finished units on the shelves, by location</p></div>
          <div class="card__tools"><button type="button" class="btn btn--ghost btn--sm" data-do="move">${renderIcon(`swap`)}Move stock</button></div></header>
        <dl class="pi-figs">
          <div class="pi-fig"><dt>On hand</dt><dd><b class="num" data-if="onhand">0</b><small>units</small></dd></div>
          <div class="pi-fig"><dt>Reserved</dt><dd><b class="num" data-if="res">0</b><small>on open orders</small></dd></div>
          <div class="pi-fig"><dt>Available</dt><dd><b class="num" data-if="avail">0</b><small>free to sell</small></dd></div>
          <div class="pi-fig" data-i="cover-fig"><dt>Cover</dt><dd><b class="num" data-if="cover">0</b><small>days at the 30-day pace</small></dd></div>
        </dl>
        <div class="pi-locs">${store.locations
          .map(
            (
              n
            ) => `<div class="pi-loc">${renderTag(it[n.kind], rt[n.kind])}<span class="pi-loc__txt"><b>${escapeHtml(n.name)}</b><small data-il="${n.id}">${escapeHtml(Bt(t, n))}</small></span>
          <span class="meter pi-loc__meter">${I(getProductStock(t, n.id) / l, rt[n.kind], `data-im="${n.id}"`)}</span><b class="num pi-loc__n" data-if="loc-${n.id}">0</b>
          <button type="button" class="btn btn--ghost btn--xs pi-loc__adj" data-adjust="${n.id}" aria-label="Adjust stock at ${escapeHtml(n.name)}">${renderIcon(`edit`)}Adjust</button></div>`
          )
          .join(``)}</div>
      </section>
      <section class="card pi-sales" aria-labelledby="pis-t">
        <header class="card__head"><div><h2 class="card__title" id="pis-t">Units sold</h2><p class="card__sub" data-i="sales-sub"></p></div>
          <div class="card__tools">${renderSegmentedControl(
            `Range`,
            [
              [`30`, `30 days`],
              [`90`, `90 days`],
            ],
            String(K),
            `pi-range`
          )}</div></header>
        <div class="pi-chart" data-i="chart"></div>
        <div class="legend pi-legend"><span><i class="tone--pine"></i>Units sold a day</span><span><i class="tone--ochre"></i>7-day average</span></div>
      </section>
      <div class="pi-pair">
        <section class="card" aria-labelledby="pib-t"><header class="card__head"><div><h2 class="card__title" id="pib-t">Batches</h2><p class="card__sub" data-i="batches-sub"></p></div>
          <div class="card__tools"><a class="btn btn--ghost btn--xs" href="/products/batches">${renderIcon(`layers`)}All lots</a></div></header><div class="rows" data-i="batches"></div></section>
        <section class="card" aria-labelledby="pio-t"><header class="card__head"><div><h2 class="card__title" id="pio-t">Open orders</h2><p class="card__sub" data-i="orders-sub"></p></div>
          <div class="card__tools"><button type="button" class="btn btn--ghost btn--xs" data-do="order">${renderIcon(`plus`)}New order</button></div></header><div class="rows" data-i="orders"></div></section>
      </div>
      <div class="pi-pair">
        <section class="card" aria-labelledby="pim-t"><header class="card__head"><div><h2 class="card__title" id="pim-t">Recent movements</h2><p class="card__sub">Every unit in or out, newest first</p></div></header><div class="rows" data-i="moves"></div></section>
        <section class="card" aria-labelledby="pibom-t"><header class="card__head"><div><h2 class="card__title" id="pibom-t">Bill of materials</h2><p class="card__sub" data-i="bom-sub"></p></div></header><div class="rows" data-i="bom"></div></section>
      </div>
    </div>
  </div>`;
}
function Kt(n) {
  let r = Ht(n);
  if (r.length) {
    return r
      .map((n) => {
        let r = R(n);
        let i = daysUntilExpiry(n);
        return `<div class="row pi-batch" data-key="${n.id}"><a class="row__txt" href="/products/batches/${n.id}"><b class="mono">${escapeHtml(n.lot)}</b><small>${
          i > 0 && i <= 90
            ? `Expires ${formatDate(n.expiresAt)} · <span class="pb-d pb-d--${vt(n)}">${i} d left</span>`
            : i <= 0
              ? `<span class="pb-d pb-d--rose">Past its date</span>`
              : `Made ${formatDate(n.madeAt)} · expires ${new Date(n.expiresAt).toLocaleDateString(
                  `en-US`,
                  {
                    month: `short`,
                    year: `numeric`,
                  }
                )}`
        }</small></a>
      <span class="row__end"><b class="num">${formatInt(n.left)}</b>of ${formatInt(n.qty)}</span>${renderPill(formatFileSize[r], BATCH_STATUS_TONES[r])}${_t(n)}</div>`;
      })
      .join(``);
  }
  return renderEmptyState(
    `No batches yet`,
    `Make one and it shows here while it waits on QA.`,
    `flask`
  );
}
function qt(t) {
  let r = Ut(t);
  if (r.length) {
    return r
      .map((r) => {
        let i = r.lines
          .filter((e) => e.productId === t.id)
          .reduce((acc, item) => acc + item.qty, 0);
        return `<a class="row" href="/orders/all/${r.id}" data-key="${r.id}">${renderAvatar(r.customerId, `md`)}<span class="row__txt"><b>${escapeHtml(findCustomerById(r.customerId)?.name ?? ``)}</b><small><span class="mono">${escapeHtml(r.number)}</span> · ${pluralize(i, `unit`)} · ship by ${formatRelativeDay(r.shipBy).toLowerCase()}</small></span>${renderOrderStatusBadge(r.status)}</a>`;
      })
      .join(``);
  }
  return renderEmptyState(
    `No open orders`,
    `Nothing is waiting on this product right now.`,
    `orders`
  );
}
function Jt(t) {
  let n = store.moves.filter((e) => e.itemId === t.id).slice(0, 7);
  if (n.length) {
    return n
      .map((t) => {
        let [n, r] = at[t.kind];
        return `<div class="row" data-key="${t.id}">${renderTag(n, r, `sm`)}<span class="row__txt"><b>${escapeHtml(STOCK_MOVE_REASON_NAMES[t.kind])}${t.kind === `transfer` ? (t.qty < 0 ? ` out` : ` in`) : ``}</b><small>${ct(t.ref) ? `<span class="mono">${escapeHtml(t.ref)}</span>` : escapeHtml(t.ref)} · ${escapeHtml(exportDataBackup(t.locId)?.name ?? ``)}</small></span>
      <span class="row__end"><b class="${t.qty >= 0 ? `pp-up` : `pp-down`}">${t.qty >= 0 ? `+` : `−`}${formatInt(Math.abs(t.qty))}</b>${formatRelativeTime(t.at)}</span></div>`;
      })
      .join(``);
  }
  return renderEmptyState(
    `No movements yet`,
    `Sales, released lots and adjustments land here.`,
    `layers`
  );
}
function Yt(t) {
  let n = Wt(t);
  if (t.bom.length) {
    return t.bom
      .map((t) => {
        let r = findMaterialById(t.materialId);
        if (!r) {
          return ``;
        }
        let i = t.per > 0 ? Math.floor(r.onHand / t.per) : Infinity;
        let a = i === n;
        return `<a class="row pi-bom${a ? ` is-limit` : ``}" href="/purchasing/materials/${r.id}" data-key="${r.id}">${renderTag(r.kind === `Ingredient` ? `drop` : `box`, r.kind === `Ingredient` ? `teal` : `ocean`, `sm`)}<span class="row__txt"><b>${escapeHtml(r.name)}</b><small><span class="mono">${escapeHtml(r.code)}</span> · ${Vt(t.per, r.unit)} a unit</small></span>
      <span class="row__end"><b class="num">${formatNumber(r.onHand)} ${escapeHtml(r.unit)}</b>${isFinite(i) ? `${a ? `limits at ` : `enough for `}${formatInt(i)}` : ``}</span></a>`;
      })
      .join(``);
  }
  return renderEmptyState(
    `No bill of materials`,
    `Add the ingredients and packaging one unit uses.`,
    `drop`
  );
}
function q(e, t = false) {
  let n = findProductById(G);
  if (!n) {
    return;
  }
  let i = M(`item`);
  let a = (t) => e === `all` || e.includes(t);
  let o = (e, n) => {
    let r = queryOne(`[data-i="${e}"]`, i);
    if (r) {
      if (t) {
        r.innerHTML = n;
      } else {
        bindModalDismiss(r, () => {
          r.innerHTML = n;
        });
      }
    }
  };
  if (a(`figs`)) {
    let e = queryOne(`[data-i="flag"]`, i);
    if (e && e.dataset.s !== F(n)) {
      e.dataset.s = F(n);
      e.innerHTML = ft(n);
      if (!t) {
        animatePop(e.firstElementChild, {
          from: 0.4,
        });
      }
    }
    let a = renderProgressBar(n);
    [
      [`onhand`, getProductStock(n)],
      [`res`, getActiveOrdersForLocation(n.id)],
      [`avail`, getMaterialStock(n)],
      [`cover`, isFinite(a) ? Math.max(0, a) : -1],
      ...store.locations.map((e) => [`loc-${e.id}`, getProductStock(n, e.id)]),
    ].forEach(([e, n]) => {
      let r = queryOne(`[data-if="${e}"]`, i);
      if (!r) {
        return;
      }
      if (n < 0) {
        r.textContent = `—`;
        r.dataset.v = `-1`;
        return;
      }
      let a = Number(r.dataset.v ?? NaN);
      r.dataset.v = String(n);
      if (t) {
        getAvailableLocations(r, n, formatInt, {
          from: 0,
          duration: 1.3,
          delay: 0.3,
        });
      } else if (a !== n) {
        getAvailableLocations(r, n, formatInt, {
          duration: 0.8,
        });
        getAvailableSuppliers(r);
      }
    });
    domQuery(`[data-i="cover-fig"]`, i).dataset.tone = lt(n, a);
    let o = Math.max(1, getProductStock(n));
    store.locations.forEach((e) => {
      if (!t) {
        pt(queryOne(`[data-im="${e.id}"]`, i), getProductStock(n, e.id) / o);
      }
      let r = queryOne(`[data-il="${e.id}"]`, i);
      if (r) {
        r.textContent = Bt(n, e);
      }
    });
  }
  if (a(`chart`)) {
    let e = zt(n, K);
    domQuery(`[data-i="sales-sub"]`, i).textContent =
      `${pluralize(e.units, `unit`)} in ${K} days · ${formatNumber(e.units / K)} a day · ${formatMoneyRound(e.rev)}`;
    if (!t && Lt) {
      let e = Rt(n, K);
      Lt.update(e.series, e.labels);
    }
  }
  if (a(`batches`)) {
    let e = Ht(n);
    domQuery(`[data-i="batches-sub"]`, i).textContent =
      `${pluralize(e.length, `lot`)} · ${pluralize(
        e.filter((e) => e.status === `released`).reduce((acc, item) => acc + item.left, 0),
        `unit`
      )} left in released lots`;
    o(`batches`, Kt(n));
  }
  if (a(`orders`)) {
    let e = Ut(n);
    domQuery(`[data-i="orders-sub"]`, i).textContent = e.length
      ? `${pluralize(e.length, `order`)} holding ${pluralize(getActiveOrdersForLocation(n.id), `unit`)}`
      : `None waiting`;
    o(`orders`, qt(n));
  }
  if (a(`moves`)) {
    o(`moves`, Jt(n));
  }
  if (a(`bom`)) {
    let e = Wt(n);
    domQuery(`[data-i="bom-sub"]`, i).textContent = isFinite(e)
      ? `Per unit · the lab can make ${formatInt(e)} more`
      : `Per unit`;
    o(`bom`, Yt(n));
  }
}
function Xt(e) {
  let t = M(`item`);
  let n = findProductById(e);
  G = n ? e : ``;
  Lt = null;
  if (!n) {
    t.innerHTML = `${renderPageHeader({
      back: `/products/catalog`,
      eyebrow: `Products`,
      title: `Product not found`,
    })}<section class="card">${renderEmptyState(`That product isn’t in the catalog`, `It may have been removed. Pick another from the catalog.`, `box`, `<a class="btn btn--ghost btn--sm" href="/products/catalog">${renderIcon(`back`)}Back to the catalog</a>`)}</section>`;
    return;
  }
  t.innerHTML = Gt(n);
  let r = Rt(n, K);
  Lt = createLineChart(domQuery(`[data-i="chart"]`, t), {
    labels: r.labels,
    series: r.series,
    format: (e) => formatNumber(e),
    height: 230,
    label: `Units of ${formatProductFullName(n)} sold a day`,
  });
  initSegmentedControl(domQuery(`.pi-range`, t), (e) => {
    K = Number(e);
    q([`chart`]);
  });
  q(`all`, true);
  openMoveStockModal(t);
}
function Zt() {
  M(`item`).addEventListener(`click`, (e) => {
    let e_target = e.target;
    let n = e_target.closest(`[data-dir]`);
    if (n) {
      Ft = Number(n.dataset.dir);
      openNewTransferModal(n);
      return;
    }
    let r = e_target.closest(`[data-adjust]`);
    if (r) {
      openNewTransferModal(r);
      openStockAdjustModal(G, r);
      let e = queryOne(`#modal select[name="loc"]`);
      if (e) {
        e.value = r.dataset.adjust;
      }
      return;
    }
    let i = e_target.closest(`[data-rel]`);
    if (i) {
      openNewTransferModal(i);
      releaseBatch(i.dataset.rel);
      return;
    }
    let a = e_target.closest(`[data-hold]`);
    if (a) {
      openNewTransferModal(a);
      gt(a.dataset.hold, a);
      return;
    }
    let o = e_target.closest(`[data-do]`);
    if (!(!o || !G)) {
      openNewTransferModal(o);
      if (o.dataset.do === `edit-prod`) {
        let prod = findProductById(G);
        if (prod) showAddEditAgroProductModal(prod);
        return;
      }
      if (o.dataset.do === `order`) {
        openNewOrderModal(
          {
            productId: G,
          },
          o
        );
      } else if (o.dataset.do === `move`) {
        openNewBatchModal(
          {
            from: `dc`,
            to: `shop`,
            productId: G,
          },
          o
        );
      } else if (o.dataset.do === `batch`) {
        openMakeBatchModal(G, o);
      }
    }
  });
}
function Qt(e) {
  let t = M(`item`);
  let n = gsap.timeline().add(animatePageTransition(t), 0);
  if (!e) {
    n.add(
      animateCards(domQueryAll(`.pi-hero, .pi-main .card, :scope > .card`, t), {
        stagger: 0.06,
      }),
      0.06
    );
  }
  n.add(
    animateRows(domQueryAll(`.pi-loc, .pi-fig, .pi-main .rows > *`, t).slice(0, 34), {
      y: 10,
      stagger: 0.022,
    }),
    e ? 0.08 : 0.32
  );
  mt(domQueryAll(`.pi-main .meter__fill`, t), e ? 0.15 : 0.45);
  Lt?.play(e ? 0.12 : 0.45);
  animatePop(domQueryAll(`[data-i="flag"] > .spill`, t), {
    from: 0.4,
    delay: 0.7,
  });
}
function $t(e, t) {
  let n = A;
  if (n === `catalog` && P(`catalog`)) {
    xt = window.scrollY;
  }
  wn(`item`);
  if (!j.has(`item`)) {
    j.add(`item`);
    Zt();
  }
  if (!t && n === `item` && e === G) {
    return;
  }
  let r = M(`item`);
  let i = Ft;
  Ft = 0;
  let a = ++It;
  if (!t && n === `item` && i && !bindMagnetic()) {
    gsap.to(r, {
      x: -32 * i,
      opacity: 0,
      duration: 0.18,
      ease: `power2.in`,
      overwrite: true,
      onComplete: () => {
        if (a === It) {
          Xt(e);
          window.scrollTo({
            top: 0,
          });
          gsap.fromTo(
            r,
            {
              x: 32 * i,
              opacity: 0,
            },
            {
              x: 0,
              opacity: 1,
              duration: 0.5,
              ease: `power3.out`,
              clearProps: `transform,opacity`,
            }
          );
          Qt(true);
        }
      },
    });
    return;
  }
  gsap.set(r, {
    clearProps: `transform,opacity`,
  });
  Xt(e);
  if (n !== `item` || !t) {
    window.scrollTo({
      top: 0,
    });
  }
  Qt(false);
}
const en = [
  [`all`, `All`],
  [`quarantine`, `In QA`],
  [`released`, `Released`],
  [`hold`, `On hold`],
  [`expired`, `Expired`],
];
let J = `all`;
let Y = ``;
let tn = null;
var X = ``;
function nn() {
  let e = store.batches.filter((e) => e.status === `quarantine`);
  let t = store.batches.filter((e) => e.status === `hold`);
  let n = getExpiringBatches();
  let i = n[0];
  return [
    {
      key: `qa`,
      icon: `flask`,
      label: `Waiting on QA`,
      value: e.length,
      badge: pluralize(
        e.reduce((acc, item) => acc + item.qty, 0),
        `unit`
      ),
      tone: `plain`,
      ico: `ocean`,
    },
    {
      key: `rel`,
      icon: `shield`,
      label: `Units in released lots`,
      value: store.batches
        .filter((e) => R(e) === `released`)
        .reduce((acc, item) => acc + item.left, 0),
      ico: `sage`,
    },
    {
      key: `exp`,
      icon: `calX`,
      label: `Expiring in ${store.settings.prefs.expiryWarnDays} days`,
      value: n.length,
      badge: i ? `next in ${pluralize(daysUntilExpiry(i), `day`)}` : `none soon`,
      tone: i && daysUntilExpiry(i) < 30 ? `bad` : i ? `warn` : `good`,
      ico: `ochre`,
    },
    {
      key: `hold`,
      icon: `pause`,
      label: `On hold`,
      value: t.length,
      badge: pluralize(
        t.reduce((acc, item) => acc + item.left, 0),
        `unit`
      ),
      tone: t.length ? `warn` : `plain`,
      ico: `rose`,
    },
  ];
}
function rn() {
  let e = Y.trim().toLowerCase();
  return store.batches
    .filter((t) => {
      let n = findProductById(t.productId);
      return (
        (J === `all` || R(t) === J) &&
        (!e ||
          `${t.lot} ${n ? `${formatProductFullName(n)} ${n.sku}` : ``}`.toLowerCase().includes(e))
      );
    })
    .sort((e, t) => t.madeAt - e.madeAt);
}
function an(n) {
  let r = findProductById(n.productId);
  if (!r) {
    r = {
      id: n.productId,
      name: (n as any).productName || 'Agricultural Machinery',
      size: 'Heavy Spec',
      photo: 'cat_tractor',
      sku: n.lot || 'AGRO',
    } as any;
  }
  let i = R(n);
  let a = daysUntilExpiry(n);
  let o = Y.trim();
  let s = Math.max(1, (n.expiresAt - n.madeAt) / ONE_DAY_MS);
  let c = findMemberById(n.chemistId);
  return `<tr class="is-link" data-key="${n.id}" data-open="${n.id}">
    <td class="a-t"><span class="prod">${renderProductThumb(r, `sm`)}<span><b>${highlightSearchMatch(r.name, o)}</b><small>${escapeHtml(r.size)}</small></span></span></td>
    <td class="a-s"><a class="mono pb-lot" href="/products/batches/${n.id}">${highlightSearchMatch(n.lot, o)}</a><small class="pb-made-s">Made ${formatDate(n.madeAt)}</small></td>
    <td class="a-h pb-made">${formatDate(n.madeAt, true)}</td>
    <td class="a-m"><span class="pb-exp"><span><b>${formatDate(n.expiresAt, true)}</b><small class="pb-d pb-d--${i === `expired` ? `rose` : vt(n)}">${a <= 0 ? `Expired` : `${formatInt(a)} d left`}</small></span><span class="meter">${I(a / s, i === `expired` ? `rose` : vt(n))}</span></span></td>
    <td class="a-p r"><span class="pb-qty"><span><b class="num">${formatInt(n.left)}</b> of ${formatInt(n.qty)}</span><span class="meter">${I(n.left / Math.max(1, n.qty), `teal`)}</span></span></td>
    <td class="a-h"><span class="pb-chem">${renderAvatar(n.chemistId, `sm`)}<span>${escapeHtml(c?.name?.split(` `)[0] ?? `QC`)}</span></span></td>
    <td class="a-r">${renderPill(formatFileSize[i], BATCH_STATUS_TONES[i])}</td>
    <td class="a-x r">${_t(n)}</td>
  </tr>`;
}
function on() {
  let t = M(`batches`);
  t.innerHTML = `${renderPageHeader({
    eyebrow: `Production lots · QA release and expiry`,
    title: `Batches`,
    stats: nn(),
    actions: `<button type="button" class="btn btn--primary magnetic" data-do="make">${renderIcon(`flask`)}Make a batch</button>`,
  })}
  <section class="card pb-card" aria-label="Production lots">
    <div class="toolbar pb-bar">
      <div class="seg pb-seg" role="group" aria-label="Status"><span class="seg__pill" aria-hidden="true"></span>${en.map(([t, n]) => `<button type="button" class="seg__btn" data-value="${t}" aria-pressed="${t === J}">${escapeHtml(n)}<b class="pb-n" data-bn="${t}">0</b></button>`).join(``)}</div>
      <span class="toolbar__spacer"></span>
      <label class="search pb-search">${renderIcon(`search`)}<input type="search" placeholder="Lot or product…" aria-label="Search lots" data-k="bq" /></label>
    </div>
    <div class="table-wrap"><table class="table table--stack pb-table">
      <thead><tr><th scope="col">Product</th><th scope="col">Lot</th><th scope="col">Made</th><th scope="col">Expires</th><th scope="col" class="r">Left</th><th scope="col">Chemist</th><th scope="col">Status</th><th scope="col" class="r"><span class="sr">Action</span></th></tr></thead>
      <tbody data-k="btable"></tbody>
    </table></div>
    <div class="pb-more" data-k="bmore" hidden></div>
    <div data-k="bempty"></div>
  </section>`;
  openMoveStockModal(t);
  tn = initSegmentedControl(domQuery(`.pb-seg`, t), (e) => {
    J = e;
    Z = 12;
    Q(true);
  });
  N(`bq`).addEventListener(`input`, (e) => {
    Y = e.target.value;
    Z = 12;
    Q(true);
  });
  Q(false);
  t.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let r = e_target.closest(`[data-rel]`);
    if (r) {
      openNewTransferModal(r);
      X = r.dataset.rel;
      releaseBatch(X);
      return;
    }
    let i = e_target.closest(`[data-hold]`);
    if (i) {
      openNewTransferModal(i);
      gt(i.dataset.hold, i);
      return;
    }
    let a = e_target.closest(`[data-do]`);
    if (a) {
      openNewTransferModal(a);
      if (a.dataset.do === `make`) {
        openMakeBatchModal(undefined, a);
      } else if (a.dataset.do === `bmore`) {
        Z += 12;
        Q(true);
      } else if (a.dataset.do === `bclear`) {
        J = `all`;
        Y = ``;
        domQuery(`[data-k="bq"]`, t).value = ``;
        tn?.select(`all`, {
          silent: true,
        });
        Q(true);
      }
      return;
    }
    if (e_target.closest(`a, button, input, label`)) {
      return;
    }
    let o = e_target.closest(`tr[data-open]`);
    if (o) {
      (window as any).navigateTo(`/products/batches/${o.dataset.open}`)
    }
  });
}
var Z = 12;
function Q(e) {
  let t = rn();
  let n = N(`btable`);
  let i = t.slice(0, Z);
  let a = i.map(an).join(``);
  let o = N(`bmore`);
  o.hidden = t.length <= Z;
  o.innerHTML = `<button type="button" class="btn btn--ghost btn--sm" data-do="bmore">Show more <span class="pb-more-n">${formatInt(Math.min(12, t.length - Z))} of ${formatInt(t.length - Z)}</span></button>`;
  if (e) {
    bindModalDismiss(n, () => {
      n.innerHTML = a;
    });
  } else {
    n.innerHTML = a;
  }
  n.closest(`.table-wrap`).hidden = !i.length;
  let s = N(`bempty`);
  s.innerHTML = i.length
    ? ``
    : store.batches.length
      ? renderEmptyState(
          J === `expired` && !Y.trim() ? `No expired lots` : `No lots match`,
          J === `expired` && !Y.trim()
            ? `Every lot on the shelves is in date. Lots past their date show here.`
            : `Try another status or clear the search.`,
          J === `expired` ? `calX` : `search`,
          `<button type="button" class="btn btn--ghost btn--sm" data-do="bclear">${renderIcon(`refresh`)}Show every lot</button>`
        )
      : renderEmptyState(
          `No batches yet`,
          `Make a batch and it waits here for QA.`,
          `flask`,
          `<button type="button" class="btn btn--primary btn--sm" data-do="make">${renderIcon(`flask`)}Make a batch</button>`
        );
  if (!i.length && e) {
    animatePop(s.firstElementChild, {
      from: 0.92,
    });
  }
  en.forEach(([e]) => {
    let t = queryOne(`[data-bn="${e}"]`, k);
    if (t) {
      t.textContent = String(
        e === `all` ? store.batches.length : store.batches.filter((t) => R(t) === e).length
      );
    }
  });
  tn?.place(false);
  X &&=
    (animatePop(queryOne(`tr[data-key="${X}"] .spill`, n), {
      from: 0.4,
    }),
    ``);
}
function sn() {
  let e = M(`batches`);
  ht(e, nn(), false);
  tn?.place(false);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(animateCards(domQueryAll(`.pb-card`, e)), 0.1)
    .add(
      animateRows(domQueryAll(`.pb-bar > *`, e), {
        y: 8,
        stagger: 0.05,
      }),
      0.2
    )
    .add(
      animateRows(domQueryAll(`.pb-table thead tr, .pb-table tbody tr`, e).slice(0, 16), {
        y: 10,
        stagger: 0.03,
      }),
      0.28
    );
  mt(domQueryAll(`.pb-table .meter__fill`, e), 0.45);
}
let $ = ``;
let cn = ``;
var ln = ``;
const un = new Map();
const dn = (e) => {
  let t = un.get(e);
  if (!t) {
    un.set(e, (t = new Set()));
  }
  return t;
};
const fn = (e) => [
  e.photo === `oil` || e.photo === `balm`
    ? [`look`, `Appearance & odour`, `Matches the retained standard; no graininess or bloom`]
    : [`ph`, `pH`, `Reads 5.0–5.8 at 20 °C`],
  [`visc`, `Viscosity`, `Within spec on the Brookfield, spindle 4 at 20 rpm`],
  [`micro`, `Micro`, `Total aerobic count and yeast & mould under 100 cfu/g`],
  [`fill`, `Fill weight`, `Ten units weighed, all within ±2% of the label`],
];
function pn(e) {
  let t = R(e);
  if (t === `quarantine`) {
    return ``;
  }
  let [n, r, i] =
    t === `released`
      ? [`Released`, `QA passed`, `sage`]
      : t === `hold`
        ? [`On hold`, `Off sale`, `rose`]
        : [`Expired`, `Do not sell`, `slate`];
  return `<span class="pb-stamp__ink" style="--c:var(--${i})"><span class="pb-stamp__ring" aria-hidden="true"></span>${n}<small>${r}</small></span>`;
}
function mn(n) {
  let r = R(n);
  let i = findMemberById(n.chemistId);
  return `${renderPill(formatFileSize[r], BATCH_STATUS_TONES[r])}<span class="pb-chip">${renderAvatar(n.chemistId, `xs`)}Made by ${escapeHtml(i?.name ?? `the lab`)}</span><span class="pb-chip">${renderIcon(`warehouse`)}${escapeHtml(exportDataBackup(n.locId)?.name ?? ``)}</span>`;
}
function hn(e, t) {
  let n = daysUntilExpiry(e);
  return `<div><small>Made on</small><b>${formatDate(e.madeAt, true)}</b><span>${formatRelativeTime(e.madeAt)}</span></div>
    <div><small>Expires</small><b>${formatDate(e.expiresAt, true)}</b><span class="pb-d pb-d--${vt(e)}">${n <= 0 ? `Past its date` : `in ${pluralize(n, `day`)}`}</span></div>
    <div><small>Run size</small><b>${pluralize(e.qty, `unit`)}</b><span>${formatMoneyRound(e.qty * t.cost)} at cost</span></div>
    <div><small>Left</small><b>${pluralize(e.left, `unit`)}</b><span>${e.status === `quarantine` ? `Not on sale until released` : `${formatMoneyRound(e.left * t.price)} at retail`}</span></div>`;
}
function gn(t, n) {
  let r = R(t);
  let i = fn(n);
  if (r === `quarantine`) {
    let n = dn(t.id);
    let r = i.filter(([e]) => n.has(e)).length;
    return `<div class="pb-qahead"><h3>QA checklist</h3><b class="num" data-qan>${r} of ${i.length}</b></div>
      <span class="meter pb-qameter">${I(r / i.length, `good`, `data-qam`)}</span>
      <ul class="pb-qa">${i.map(([t, r, i]) => `<li><label class="pb-check"><input type="checkbox" class="check" data-qa="${t}"${n.has(t) ? ` checked` : ``} /><span><b>${escapeHtml(r)}</b><small>${escapeHtml(i)}</small></span></label></li>`).join(``)}</ul>
      ${t.note ? `<p class="note">${renderIcon(`info`)}<span>${escapeHtml(t.note)}</span></p>` : ``}`;
  }
  if (r === `released`) {
    return `<h3>QA</h3><p class="note">${renderIcon(`shield`)}<span>Passed ${i
      .map(([, e]) => {
        if (e === `pH`) {
          return e;
        }
        return e.toLowerCase();
      })
      .join(`, `)
      .replace(/, ([^,]*)$/, ` and $1`)}. Signed off by <b>Hana Sato</b>.</span></p>`;
  }
  if (r === `hold`) {
    return `<h3>Why it’s on hold</h3><p class="note note--warn">${renderIcon(`alert`)}<span>${escapeHtml(t.note ?? `No reason recorded.`)}</span></p>`;
  }
  return `<h3>Past its date</h3><p class="note note--warn">${renderIcon(`calX`)}<span>Pull any units left and record them as damaged.</span></p>`;
}
function _n(t) {
  let n = store.moves.filter((e) => e.ref === t.lot);
  let i = Math.max(0, t.qty - t.left);
  let a = i / Math.max(1, t.qty);
  return `<h3>Where its units went</h3>
    <div class="pb-drawn"><span>${formatInt(i)} of ${pluralize(t.qty, `unit`)} shipped or drawn down</span><b class="num">${formatPercent(a)}</b></div>
    <span class="meter">${I(a, `pine`)}</span>
    <div class="rows">${
      n.length
        ? n
            .map((t) => {
              let [n, r] = at[t.kind];
              return `<div class="row">${renderTag(n, r, `sm`)}<span class="row__txt"><b>${escapeHtml(STOCK_MOVE_REASON_NAMES[t.kind])}</b><small>${escapeHtml(exportDataBackup(t.locId)?.name ?? ``)} · ${formatRelativeTime(t.at)}</small></span><span class="row__end"><b class="${t.qty >= 0 ? `pp-up` : `pp-down`}">${t.qty >= 0 ? `+` : `−`}${formatInt(Math.abs(t.qty))}</b></span></div>`;
            })
            .join(``)
        : `<p class="pb-none">${t.status === `quarantine` ? `Nothing yet — its units join stock at Riverside DC when QA releases the lot.` : `Nothing logged under this lot in the last six weeks. Orders draw on the oldest lots first.`}</p>`
    }</div>`;
}
function vn(e, t) {
  let n = R(e);
  let r = `<a class="btn btn--ghost" href="/products/item/${t.id}">${renderIcon(`box`)}Open product</a>`;
  if (n === `quarantine`) {
    let n = fn(t);
    let i = n.filter(([t]) => dn(e.id).has(t)).length;
    let a = i === n.length;
    return `<button type="button" class="btn btn--primary" data-drel ${a ? `` : `disabled`}>${renderIcon(`shield`)}Release lot</button>${r}<span class="pb-hint" data-hint>${a ? `Every check passed` : `Tick ${n.length - i} more to release`}</span>`;
  }
  if (n === `hold`) {
    return `<button type="button" class="btn btn--primary" data-drel>${renderIcon(`shield`)}Release lot</button>${r}`;
  }
  if (n === `released` && e.left > 0) {
    return `<button type="button" class="btn btn--ghost" data-dhold>${renderIcon(`pause`)}Put on hold</button>${r}`;
  }
  return r;
}
function yn(t, n) {
  return `<header class="d-head pb-dhead">${renderProductThumb(n, `lg`)}<div class="pb-dtitle"><h2 class="mono">${escapeHtml(t.lot)}</h2><small>${escapeHtml(formatProductFullName(n))} · <span class="mono">${escapeHtml(n?.sku || '')}</span></small></div><span class="pb-stamp" data-ds="stamp">${pn(t)}</span></header>
    <div class="d-pills" data-ds="pills">${mn(t)}</div>
    <div class="d-facts" data-ds="facts">${hn(t, n)}</div>
    <section class="d-sec" data-ds="qa">${gn(t, n)}</section>
    <section class="d-sec" data-ds="went">${_n(t)}</section>
    <div class="d-actions" data-ds="acts">${vn(t, n)}</div>`;
}
function bn(e) {
  let t = findBatchById(e);
  let n = t ? findProductById(t.productId) : undefined;
  if (!t || !n) {
    showToast(`That lot isn’t on file any more`, {
      ico: `info`,
    });
    history.replaceState(null, ``, `/products/batches`);
    return;
  }
  $ = e;
  cn = t.status;
  let { el } = openDrawer(yn(t, n), {
    label: `Lot ${t.lot}`,
    onClose: () => {
      $ = ``;
      if (location.pathname.startsWith(`/products/batches/`)) {
        history.replaceState(null, ``, `/products/batches`);
      }
    },
  });
  mt(domQueryAll(`.meter__fill`, el), 0.3);
  el.addEventListener(`change`, (e) => {
    let t = e.target.closest(`[data-qa]`);
    if (!t) {
      return;
    }
    let n = dn($);
    if (t.checked) {
      n.add(t.dataset.qa);
    } else {
      n.delete(t.dataset.qa);
    }
    if (t.checked) {
      animatePop(t, {
        from: 0.5,
      });
    }
    xn(el);
  });
  el.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let n = e_target.closest(`[data-drel]`);
    if (n && !n.disabled) {
      openNewTransferModal(n);
      ln = $;
      X = $;
      releaseBatch($);
      return;
    }
    let r = e_target.closest(`[data-dhold]`);
    if (r) {
      openNewTransferModal(r);
      gt($, r);
    }
  });
}
function xn(e) {
  let t = findBatchById($);
  let n = t ? findProductById(t.productId) : undefined;
  if (!t || !n) {
    return;
  }
  let r = fn(n);
  let length = r.filter(([e]) => dn(t.id).has(e)).length;
  let a = length === r.length;
  L(queryOne(`[data-qan]`, e), `${length} of ${r.length}`);
  pt(queryOne(`[data-qam]`, e), length / r.length);
  let o = queryOne(`[data-drel]`, e);
  if (o) {
    let e = o.disabled;
    o.disabled = !a;
    if (e && a && !bindMagnetic()) {
      gsap.fromTo(
        o,
        {
          scale: 0.9,
        },
        {
          scale: 1,
          duration: 0.6,
          ease: `back.out(3)`,
          clearProps: `transform`,
        }
      );
    }
  }
  let s = queryOne(`[data-hint]`, e);
  if (s) {
    s.textContent = a ? `Every check passed` : `Tick ${r.length - length} more to release`;
  }
}
function Sn() {
  let e = findBatchById($);
  let t = e ? findProductById(e.productId) : undefined;
  let n = queryOne(`#drawer .drawer__inner`);
  if (!e || !t || !n) {
    return;
  }
  let r = {
    stamp: pn(e),
    pills: mn(e),
    facts: hn(e, t),
    qa: gn(e, t),
    went: _n(e),
    acts: vn(e, t),
  };
  Object.entries(r).forEach(([e, t]) => {
    let r = queryOne(`[data-ds="${e}"]`, n);
    if (r) {
      r.innerHTML = t;
    }
  });
  let i = cn !== e.status;
  cn = e.status;
  if (i) {
    animateRows(domQueryAll(`[data-ds="qa"] > *, [data-ds="acts"] > *, [data-ds="facts"] > *`, n), {
      y: 8,
      stagger: 0.04,
    });
    animatePop(queryOne(`[data-ds="pills"] > .spill`, n), {
      from: 0.4,
    });
    mt(domQueryAll(`[data-ds="went"] .meter__fill`, n), 0.2);
  }
  if (ln === e.id) {
    ln = ``;
    Cn(n);
  }
}
function Cn(e) {
  let t = queryOne(`.pb-stamp__ink`, e);
  let n = queryOne(`.pb-stamp__ring`, e);
  let r = queryOne(`.pb-dhead`, e);
  if (!t || bindMagnetic()) {
    return;
  }
  let i = gsap.timeline();
  i.fromTo(
    t,
    {
      scale: 2.8,
      opacity: 0,
      rotation: -18,
    },
    {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 0.34,
      ease: `power4.in`,
      clearProps: `transform,opacity`,
    }
  );
  if (r) {
    i.fromTo(
      r,
      {
        y: 4,
      },
      {
        y: 0,
        duration: 0.6,
        ease: `elastic.out(1.1, 0.35)`,
        clearProps: `transform`,
      }
    );
  }
  if (n) {
    i.fromTo(
      n,
      {
        scale: 0.92,
        opacity: 0.6,
      },
      {
        scale: 1.5,
        opacity: 0,
        duration: 0.7,
        ease: `power2.out`,
      },
      `<`
    );
  }
}
function wn(e) {
  A = e;
  domQueryAll(`:scope > [data-sub]`, k).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
}
function Tn(e, t) {
  let n = A;
  wn(e);
  if (e === `catalog`) {
    let r = !j.has(`catalog`);
    if (r) {
      j.add(`catalog`);
      Ot();
    }
    if (!t) {
      return;
    }
    if (!r) {
      W(false);
    }
    Pt();
    if (n === `item` && xt) {
      let top = xt;
      requestAnimationFrame(() =>
        window.scrollTo({
          top,
        })
      );
    } else {
      if (n !== e) {
        window.scrollTo({
          top: 0,
        });
      }
    }
  } else {
    let r = !j.has(`batches`);
    if (r) {
      j.add(`batches`);
      on();
    }
    if (!t) {
      return;
    }
    if (!r) {
      Q(false);
    }
    sn();
    if (n !== e) {
      window.scrollTo({
        top: 0,
      });
    }
  }
}
export const page = {
  title: (e) => {
    if (e[0] === `item`) {
      let t = findProductById(e[1] ?? ``);
      if (t) {
        return formatProductFullName(t);
      }
      return `Product`;
    }
    if (e[0] === `batches`) {
      let t = findBatchById(e[1] ?? ``);
      if (t) {
        return `Lot ${t.lot}`;
      }
      return `Batches`;
    }
    return `Catalog`;
  },
  mount(e) {
    k = e;
    k.innerHTML = `<div data-sub="catalog" hidden></div><div data-sub="item" hidden></div><div data-sub="batches" hidden></div>`;
    findLocationById(`products`, () => {
      if (P(`catalog`)) {
        At();
      } else if (P(`item`)) {
        q([`figs`]);
      } else if (P(`batches`)) {
        ht(M(`batches`), nn(), true);
      }
    });
    findLocationById(`orders`, () => {
      if (P(`catalog`)) {
        At();
      } else if (P(`item`)) {
        q([`figs`, `orders`, `chart`]);
      }
    });
    findLocationById(`batches`, () => {
      if (P(`batches`)) {
        Q(true);
        ht(M(`batches`), nn(), true);
      } else if (P(`item`)) {
        q([`batches`]);
      }
      if ($) {
        Sn();
      }
    });
    findLocationById(`moves`, () => {
      if (P(`item`)) {
        q([`moves`]);
      }
    });
    findLocationById(`materials`, () => {
      if (P(`item`)) {
        q([`bom`]);
      }
    });
    document.addEventListener(`keydown`, (e) => {
      if (
        !P(`item`) ||
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (e.key !== `ArrowLeft` && e.key !== `ArrowRight`) ||
        e.target.closest(`input, textarea, select, [contenteditable="true"], .chart`) ||
        document.querySelector(`dialog[open]`)
      ) {
        return;
      }
      let t = queryOne(`.pi-nav [data-dir="${e.key === `ArrowLeft` ? -1 : 1}"]`, M(`item`));
      if (t) {
        Ft = e.key === `ArrowLeft` ? -1 : 1;
        openNewTransferModal(t);
        (window as any).navigateTo(t.getAttribute(`href`))
      }
    });
  },
  enter({ params, same }) {
    let n = params[0] === `item` ? `item` : params[0] === `batches` ? `batches` : `catalog`;
    if ($ && !(n === `batches` && params[1])) {
      closeDrawer();
    }
    if (n === `item`) {
      if (params[1]) {
        $t(params[1], !same);
        return;
      }
      history.replaceState(null, ``, `/products/catalog`);
      Tn(`catalog`, !same || A !== `catalog` || !j.has(`catalog`));
      return;
    }
    Tn(n, !same || A !== n || !j.has(n));
    if (n === `batches` && params[1] && params[1] !== $) {
      bn(params[1]);
    }
  },
  leave() {
    if ($) {
      closeDrawer();
    }
    U = null;
  },
};
