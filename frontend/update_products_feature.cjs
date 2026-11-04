const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/features/products/products.ts');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update yt, Ct, Tt
const oldYtAndFilters = `const yt = [
  [\`name\`, \`Name\`, \`Name, A to Z\`],
  [\`stock\`, \`Stock\`, \`Most on hand\`],
  [\`cover\`, \`Cover\`, \`Fewest days of cover\`],
  [\`price\`, \`Price\`, \`Highest price\`],
];
let z = \`all\`;
let B = \`grid\`;
let V = \`name\`;
let bt = \`\`;
let H = false;
let xt = 0;
let St = null;
let U = null;
function Ct(e, t = true) {
  let n = bt.trim().toLowerCase();
  return (
    (!t || z === \`all\` || e.category === z) &&
    (!H || isProductLowStock(e)) &&
    (!n || \`\${e.name} \${e.size} \${e.sku} \${e.line} \${e.barcode}\`.toLowerCase().includes(n))
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
  };
  return store.products
    .filter((e) => Ct(e))
    .sort(
      (t, n) =>
        e[V](t, n) ||
        formatProductFullName(t).localeCompare(formatProductFullName(n), \`en\`, {
          numeric: true,
        })
    );
}`;

const newYtAndFilters = `const AGRO_CATEGORIES = ['Tractors', 'Harvesters', 'Tillers', 'Sprayers', 'Spares', 'Implements'];

const yt = [
  [\`name\`, \`Name\`, \`Name, A to Z\`],
  [\`stock\`, \`Stock\`, \`Most on hand\`],
  [\`cover\`, \`Cover\`, \`Fewest days of cover\`],
  [\`price\`, \`Price\`, \`Highest price\`],
  [\`hp\`, \`Horsepower\`, \`Highest HP (Tractors & Implements)\`],
];
let z = \`all\`;
let B = \`grid\`;
let V = \`name\`;
let bt = \`\`;
let H = false;
let xt = 0;
let St = null;
let U = null;
function Ct(e, t = true) {
  let n = bt.trim().toLowerCase();
  return (
    (!t || z === \`all\` || e.category === z) &&
    (!H || isProductLowStock(e)) &&
    (!n || \`\${e.name} \${e.size} \${e.sku} \${e.line || ''} \${e.brand || ''} \${e.modelCode || ''} \${e.category} \${e.barcode} \${e.compatibleModels?.join(' ') || ''}\`.toLowerCase().includes(n))
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
        formatProductFullName(t).localeCompare(formatProductFullName(n), \`en\`, {
          numeric: true,
        })
    );
}`;

// Normalize newlines before replace
code = code.replace(/\r\n/g, '\n');

if (code.includes(oldYtAndFilters.replace(/\r\n/g, '\n'))) {
  code = code.replace(oldYtAndFilters.replace(/\r\n/g, '\n'), newYtAndFilters);
  console.log('Step 1: Updated yt, Ct, Tt');
} else {
  console.error('Step 1 failed: oldYtAndFilters not found');
}

// 2. Update Et()
const oldEt = `function Et() {
  let length = getAlertItems().length;
  let length_1 = getLowStockProducts().length;
  return [
    {
      key: \`skus\`,
      icon: \`box\`,
      label: \`SKUs\`,
      value: store.products.filter((e) => e.active).length,
      badge: \`\${formatShortDate.length} categories\`,
      tone: \`plain\`,
      ico: \`pine\`,
    },
    {
      key: \`units\`,
      icon: \`boxes\`,
      label: \`Units on hand\`,
      value: getTotalStockUnits(),
      ico: \`teal\`,
      badge: \`3 locations\`,
      tone: \`plain\`,
    },
    {
      key: \`retail\`,
      icon: \`tag\`,
      label: \`Retail value\`,
      value: getTotalRetailValue(),
      fmt: \`money\`,
      ico: \`ochre\`,
    },
    {
      key: \`low\`,
      icon: \`alert\`,
      label: \`Low or out\`,
      value: length_1,
      badge: length ? \`\${length} out at the DC\` : \`none out\`,
      tone: length ? \`bad\` : \`good\`,
      ico: \`rose\`,
    },
  ];
}`;

const newEt = `function Et() {
  let alertCount = getAlertItems().length;
  let lowCount = getLowStockProducts().length;
  let activeCount = store.products.filter((e) => e.active).length;
  let totalUnits = getTotalStockUnits();
  let totalValue = getTotalRetailValue();

  return [
    {
      key: \`skus\`,
      icon: \`box\`,
      label: \`Machinery SKUs\`,
      value: activeCount,
      badge: \`\${AGRO_CATEGORIES.length} categories\`,
      tone: \`plain\`,
      ico: \`pine\`,
    },
    {
      key: \`units\`,
      icon: \`boxes\`,
      label: \`Units on hand\`,
      value: totalUnits,
      ico: \`teal\`,
      badge: \`Central DC & Yards\`,
      tone: \`plain\`,
    },
    {
      key: \`retail\`,
      icon: \`tag\`,
      label: \`Fleet inventory value\`,
      value: totalValue,
      fmt: \`money\`,
      ico: \`ochre\`,
    },
    {
      key: \`low\`,
      icon: \`alert\`,
      label: \`Low stock alerts\`,
      value: lowCount,
      badge: alertCount ? \`\${alertCount} critical at Central DC\` : \`Stock healthy\`,
      tone: alertCount ? \`bad\` : \`good\`,
      ico: \`rose\`,
    },
  ];
}`;

if (code.includes(oldEt)) {
  code = code.replace(oldEt, newEt);
  console.log('Step 2: Updated Et');
} else {
  console.error('Step 2 failed: oldEt not found');
}

// 3. Add showAddEditAgroProductModal and replace Dt(t)
const modalAndDt = `// -------------------------------------------------------------
// ADD / EDIT AGRO PRODUCT MODAL
// -------------------------------------------------------------
function showAddEditAgroProductModal(prodToEdit?: any): void {
  const modalEl = queryOne('#modal') as HTMLDialogElement;
  if (!modalEl) return;
  const isEdit = !!prodToEdit;
  let activeImage = prodToEdit?.image || prodToEdit?.photo || '/brand/cat_tractor.jpg';
  let activeCategory = prodToEdit?.category || 'Tractors';

  modalEl.innerHTML = \`
    <div class="cat-dialog agro-prod-dialog">
      <header class="cat-dialog__header">
        <div class="cat-dialog__header-left">
          <h3 class="cat-dialog__title">\${isEdit ? 'Edit Agricultural Machinery & Specs' : 'Add New Agricultural Machinery / Part'}</h3>
          <p class="cat-dialog__sub">Configure machinery specifications, horsepower, hitch category, PTO speed, pricing and model compatibility</p>
        </div>
        <button type="button" class="btn btn--icon btn--ghost btn-close-modal" aria-label="Close modal">\${renderIcon('close')}</button>
      </header>
      <div class="cat-dialog__body">
        <!-- 1. Basic Product Info -->
        <div class="cat-form-group">
          <label for="prod-in-name">Product Name *</label>
          <input type="text" id="prod-in-name" value="\${prodToEdit ? escapeHtml(prodToEdit.name) : ''}" placeholder="e.g. Vels Shakti 55 HP 4WD Utility Tractor" required />
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-cat">Category *</label>
            <select id="prod-in-cat">
              \${AGRO_CATEGORIES.map(c => \`<option value="\${c}" \${activeCategory === c ? 'selected' : ''}>\${c}</option>\`).join('')}
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-brand">Brand</label>
            <select id="prod-in-brand">
              \${['Vels Agro', 'Captain', 'Shaktiman', 'Lemken', 'Maschio', 'Mahindra'].map(b => \`<option value="\${b}" \${prodToEdit?.brand === b ? 'selected' : ''}>\${b}</option>\`).join('')}
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-sku">SKU / Part Number *</label>
            <input type="text" id="prod-in-sku" value="\${prodToEdit ? escapeHtml(prodToEdit.sku) : 'VELS-' + Date.now().toString().slice(-6)}" placeholder="e.g. VELS-TRAC-55X" required />
          </div>
        </div>

        <!-- 2. Agricultural Technical Specifications -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-hp">Horsepower (HP)</label>
            <input type="number" id="prod-in-hp" value="\${prodToEdit?.hp || 0}" min="0" max="250" placeholder="e.g. 55" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-drive">Drive System</label>
            <select id="prod-in-drive">
              <option value="4WD" \${prodToEdit?.driveType === '4WD' ? 'selected' : ''}>4WD (Four Wheel)</option>
              <option value="2WD" \${prodToEdit?.driveType === '2WD' ? 'selected' : ''}>2WD (Rear Wheel)</option>
              <option value="Track" \${prodToEdit?.driveType === 'Track' ? 'selected' : ''}>Rubber Track</option>
              <option value="N/A" \${!prodToEdit?.driveType || prodToEdit?.driveType === 'N/A' ? 'selected' : ''}>N/A (Implement / Part)</option>
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-hitch">3-Point Hitch</label>
            <select id="prod-in-hitch">
              <option value="Cat-2" \${prodToEdit?.hitch === 'Cat-2' ? 'selected' : ''}>Cat-2 (Medium/Heavy)</option>
              <option value="Cat-1" \${prodToEdit?.hitch === 'Cat-1' ? 'selected' : ''}>Cat-1 (Compact &lt;45HP)</option>
              <option value="Cat-3" \${prodToEdit?.hitch === 'Cat-3' ? 'selected' : ''}>Cat-3 (Heavy &gt;90HP)</option>
              <option value="N/A" \${!prodToEdit?.hitch || prodToEdit?.hitch === 'N/A' ? 'selected' : ''}>N/A / Trailed</option>
            </select>
          </div>
          <div class="cat-form-group">
            <label for="prod-in-pto">PTO RPM</label>
            <select id="prod-in-pto">
              <option value="540" \${prodToEdit?.ptoRPM === 540 ? 'selected' : ''}>540 RPM Standard</option>
              <option value="1000" \${prodToEdit?.ptoRPM === 1000 ? 'selected' : ''}>1000 RPM High Speed</option>
              <option value="0" \${!prodToEdit?.ptoRPM ? 'selected' : ''}>None / Unpowered</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-size">Working Size / Spec Summary</label>
            <input type="text" id="prod-in-size" value="\${prodToEdit ? escapeHtml(prodToEdit.size) : '55 HP · 4WD'}" placeholder="e.g. 55 HP · 4WD or 7 Ft · 48 Blades" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-hsn">HSN Code</label>
            <input type="text" id="prod-in-hsn" value="\${prodToEdit?.hsnCode || '870192'}" placeholder="e.g. 870192 (Tractor) or 8432 (Implements)" />
          </div>
        </div>

        <!-- 3. Machine & Model Compatibility -->
        <div class="cat-form-group">
          <label for="prod-in-compat">Compatible Machinery Models (Comma separated)</label>
          <input type="text" id="prod-in-compat" value="\${prodToEdit?.compatibleModels ? escapeHtml(prodToEdit.compatibleModels.join(', ')) : 'Vels 55HP 4WD, Vels 45HP 2WD, Captain 28HP'}" placeholder="e.g. Vels 55HP 4WD, Captain 28HP, Universal Cat-2" />
        </div>

        <!-- 4. Pricing, MRP & GST Rate -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-mrp">MRP (₹) *</label>
            <input type="number" id="prod-in-mrp" value="\${prodToEdit?.mrp || 785000}" min="0" step="500" required />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-price">Selling Price (₹) *</label>
            <input type="number" id="prod-in-price" value="\${prodToEdit?.price || 720000}" min="0" step="500" required />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-wholesale">Dealer Price (₹)</label>
            <input type="number" id="prod-in-wholesale" value="\${prodToEdit?.wholesale || 660000}" min="0" step="500" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-gst">GST Slab *</label>
            <select id="prod-in-gst">
              <option value="12" \${prodToEdit?.gstPct === 12 || (!prodToEdit?.gstPct && activeCategory !== 'Spares') ? 'selected' : ''}>12% (Machinery & Tractors)</option>
              <option value="18" \${prodToEdit?.gstPct === 18 || (!prodToEdit?.gstPct && activeCategory === 'Spares') ? 'selected' : ''}>18% (Spares & Parts)</option>
              <option value="5" \${prodToEdit?.gstPct === 5 ? 'selected' : ''}>5% (Special Concession)</option>
            </select>
          </div>
        </div>

        <!-- 5. Machinery Photo Selector -->
        <div class="cat-form-group cat-img-picker">
          <label>Machinery Photo / Banner</label>
          <div class="cat-img-presets" id="prod-img-presets">
            <button type="button" class="cat-img-preset-btn \${activeImage.includes('cat_tractor') ? 'is-selected' : ''}" data-url="/brand/cat_tractor.jpg">
              <img src="/brand/cat_tractor.jpg" alt="Tractor" />
              <span>Tractor</span>
            </button>
            <button type="button" class="cat-img-preset-btn \${activeImage.includes('tractor_bg') ? 'is-selected' : ''}" data-url="/brand/tractor_bg.jpg">
              <img src="/brand/tractor_bg.jpg" alt="Field" />
              <span>Field 2WD</span>
            </button>
            <button type="button" class="cat-img-preset-btn \${activeImage.includes('cat_harvester') ? 'is-selected' : ''}" data-url="/brand/cat_harvester.jpg">
              <img src="/brand/cat_harvester.jpg" alt="Harvester" />
              <span>Harvester</span>
            </button>
            <button type="button" class="cat-img-preset-btn \${activeImage.includes('cat_tiller') ? 'is-selected' : ''}" data-url="/brand/cat_tiller.jpg">
              <img src="/brand/cat_tiller.jpg" alt="Tiller" />
              <span>Rotavator</span>
            </button>
            <button type="button" class="cat-img-preset-btn \${activeImage.includes('cat_sprayer') ? 'is-selected' : ''}" data-url="/brand/cat_sprayer.jpg">
              <img src="/brand/cat_sprayer.jpg" alt="Sprayer" />
              <span>Sprayer</span>
            </button>
            <button type="button" class="cat-img-preset-btn \${activeImage.includes('cat_spares') ? 'is-selected' : ''}" data-url="/brand/cat_spares.jpg">
              <img src="/brand/cat_spares.jpg" alt="Spares" />
              <span>Spares</span>
            </button>
          </div>
          <input type="text" id="prod-in-image" value="\${activeImage}" placeholder="Photo URL (e.g. /brand/cat_tractor.jpg)" />
        </div>

        <!-- 6. Initial Warehouse Stock -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div class="cat-form-group">
            <label for="prod-in-stock-dc">Riverside Central DC</label>
            <input type="number" id="prod-in-stock-dc" value="\${prodToEdit?.stock?.dc ?? 12}" min="0" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-stock-lab">Salem Regional Depot</label>
            <input type="number" id="prod-in-stock-lab" value="\${prodToEdit?.stock?.lab ?? 6}" min="0" />
          </div>
          <div class="cat-form-group">
            <label for="prod-in-stock-shop">Coimbatore Hub</label>
            <input type="number" id="prod-in-stock-shop" value="\${prodToEdit?.stock?.shop ?? 4}" min="0" />
          </div>
        </div>

        <!-- 7. Technical Description -->
        <div class="cat-form-group">
          <label for="prod-in-blurb">Technical Description & Engineering Notes</label>
          <textarea id="prod-in-blurb" rows="2" placeholder="Summary for catalog, dealer sheets and storefront...">\${prodToEdit ? escapeHtml(prodToEdit.blurb || '') : ''}</textarea>
        </div>
      </div>
      <footer class="cat-dialog__footer">
        <button type="button" class="btn btn--ghost btn-close-modal">Cancel</button>
        <button type="button" class="btn btn--primary" id="btn-save-prod-modal">\${isEdit ? 'Save Changes' : 'Create Product'}</button>
      </footer>
    </div>
  \`;

  if (!modalEl.open) modalEl.showModal();
  bindModalDismiss(modalEl);
  animatePop(queryOne('.cat-dialog', modalEl));

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

  // Handle Close
  domQueryAll('.btn-close-modal', modalEl).forEach(b => b.addEventListener('click', () => modalEl.close()));

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
    const size = (queryOne('#prod-in-size', modalEl) as HTMLInputElement)?.value || \`\${hp ? hp + ' HP · ' + driveType : 'Standard'}\`;
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
      showToast(\`\${name} updated successfully!\`, { ico: 'check' });
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
      showToast(\`\${name} added to machinery catalog!\`, { ico: 'check' });
    }

    try {
      localStorage.setItem('Vels:data:v2', JSON.stringify(store));
    } catch {}

    modalEl.close();
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

  return \`<article class="pcard pcard--agro" data-key="\${t.id}" data-id="\${t.id}">
    <a class="pcard__photo" href="/products/item/\${t.id}" tabindex="-1" aria-hidden="true">
      \${renderProductThumb(t, \`xl\`)}
      <span class="pcard-gst-badge">\${gst}% GST</span>
      <span class="pcard__flag" data-f="flag" data-s="\${F(t)}">\${t.active ? ft(t) : 'Archived'}</span>
    </a>
    <div class="pcard__name">
      <div class="pcard-brand-row">
        <span class="pcard-brand">\${escapeHtml(t.brand || 'Vels Agro')}</span>
        <span class="mono pcard-sku">\${highlightSearchMatch(t.sku, o)}</span>
      </div>
      <a href="/products/item/\${t.id}" class="pcard-title-link"><b>\${highlightSearchMatch(t.name, o)}</b></a>
      <div class="pcard-tags-row">
        <span class="tag pcard__cat" style="--c:var(--\${CATEGORY_TONES[t.category] || 'pine'})">\${escapeHtml(t.category)}</span>
        <span class="tag pcard__size">\${escapeHtml(t.size || (t.hp ? \`\${t.hp} HP\` : 'Standard'))}</span>
      </div>

      <!-- Agricultural Specs Chips -->
      <div class="pcard-specs-row">
        \${t.hp ? \`<span class="pcard-spec-chip hp-chip">\${renderIcon('truck')}<b>\${t.hp} HP</b></span>\` : ''}
        \${t.driveType && t.driveType !== 'N/A' ? \`<span class="pcard-spec-chip drive-chip">\${t.driveType}</span>\` : ''}
        \${t.hitch && t.hitch !== 'N/A' ? \`<span class="pcard-spec-chip hitch-chip">\${t.hitch}</span>\` : ''}
        \${t.ptoRPM ? \`<span class="pcard-spec-chip pto-chip">\${t.ptoRPM} RPM</span>\` : ''}
      </div>

      <!-- Compatible Models Preview -->
      \${fitsList.length ? \`
        <div class="pcard-compat">
          <span class="pcard-compat-label">Fits:</span>
          <span class="pcard-compat-tags">
            \${fitsList.slice(0, 2).map((m: any) => \`<span class="compat-pill">\${escapeHtml(m)}</span>\`).join('')}
            \${fitsList.length > 2 ? \`<span class="compat-more">+\${fitsList.length - 2}</span>\` : ''}
          </span>
        </div>
      \` : ''}

      <!-- Commercial Pricing Row -->
      <div class="pcard-price-row">
        <div class="pcard-price-main">
          <span class="pcard-price-curr">\${formatMoney(t.price)}</span>
          \${t.mrp && t.mrp > t.price ? \`<span class="pcard-price-mrp">\${formatMoney(t.mrp)}</span>\` : ''}
          \${discPct ? \`<span class="pcard-price-disc">\${discPct}% OFF</span>\` : ''}
        </div>
        <div class="pcard-dealer-price"><small>Dealer:</small> <b>\${formatMoney(t.wholesale || Math.round(t.price * 0.9))}</b></div>
      </div>
    </div>

    <!-- Stock By Location -->
    <div class="pcard__locs" role="list" aria-label="Stock by location">
      \${store.locations.map((e) => \`<div class="pcard__loc" role="listitem"><span>\${ot(e)}</span><span class="meter">\${I(getProductStock(t, e.id) / i, rt[e.kind], \`data-m="\${e.id}"\`)}</span><b class="num" data-f="loc-\${e.id}">\${formatInt(getProductStock(t, e.id))}</b></div>\`).join(\`\`)}
    </div>

    <div class="pcard__avail">
      <span><b class="num" data-f="avail">\${formatInt(getMaterialStock(t))}</b> available</span>
      <span><b class="num" data-f="res">\${formatInt(getActiveOrdersForLocation(t.id))}</b> reserved</span>
    </div>

    <div class="pcard__acts">
      <span class="pcard__adj" role="group" aria-label="Count fix at Central DC">
        \${renderIconButton(\`minus\`, \`One less at Central DC\`, \`data-adj="-1"\`, \`ibtn--sm\`)}
        <span class="pcard__dc"><b class="num" data-f="adj-dc">\${formatInt(getProductStock(t, \`dc\`))}</b><small>at DC</small></span>
        \${renderIconButton(\`plus\`, \`One more at Central DC\`, \`data-adj="1"\`, \`ibtn--sm\`)}
      </span>
      <button type="button" class="ibtn ibtn--sm btn-edit-prod" data-edit-id="\${t.id}" title="Edit product information" aria-label="Edit product">\${renderIcon('edit')}</button>
      \${renderIconButton(\`swap\`, \`Move stock between depots\`, \`data-do="move"\`, \`ibtn--sm\`)}
    </div>
  </article>\`;
}`;

// Find Dt definition and replace it
const dtRegex = /function Dt\(t\) \{[\s\S]*?<\/article>\`;\s*\}/;
if (dtRegex.test(code)) {
  code = code.replace(dtRegex, modalAndDt);
  console.log('Step 3: Added showAddEditAgroProductModal and updated Dt');
} else {
  console.error('Step 3 failed: dtRegex did not match');
}

// 4. Update Ot() header and category chips
const oldOtHeader = `function Ot() {
  let t = M(\`catalog\`);
  t.innerHTML = \`\${renderPageHeader({
    eyebrow: \`Finished goods across Riverside DC, the lab and the Studio Shop\`,
    title: \`Catalog\`,
    stats: Et(),
    actions: \`<button type="button" class="btn btn--ghost pc-export" data-do="export">\${renderIcon(\`download\`)}<span>Export CSV</span></button><button type="button" class="btn btn--ghost" data-do="move">\${renderIcon(\`swap\`)}<span>Move stock</span></button><button type="button" class="btn btn--primary magnetic" data-do="batch">\${renderIcon(\`flask\`)}<span>Make a batch</span></button>\`,
  })}
  <div class="pc-bar">
    <div class="chips pc-cats" role="group" aria-label="Category">\${[[\`all\`, \`All\`], ...formatShortDate.map((e) => [e, e])].map(([t, n]) => \`<button type="button" class="chip" data-cat="\${t}" aria-pressed="\${z === t}">\${t === \`all\` ? \`\` : \`<i class="dot" style="--c:var(--\${CATEGORY_TONES[t]})"></i>\`}\${escapeHtml(n)} <b data-cn="\${t}">0</b></button>\`).join(\`\`)}</div>`;

const newOtHeader = `function Ot() {
  let t = M(\`catalog\`);
  t.innerHTML = \`\${renderPageHeader({
    eyebrow: \`Agricultural tractors, combine harvesters, tillers and OEM spares across Central DC and dealers\`,
    title: \`Machinery & Spares Catalog\`,
    stats: Et(),
    actions: \`<button type="button" class="btn btn--primary" id="btn-add-agro-prod">\${renderIcon('plus')}<span>Add Product</span></button><button type="button" class="btn btn--ghost pc-export" data-do="export">\${renderIcon(\`download\`)}<span>Export CSV</span></button><button type="button" class="btn btn--ghost" data-do="move">\${renderIcon(\`swap\`)}<span>Move stock</span></button>\`,
  })}
  <div class="pc-bar">
    <div class="chips pc-cats" role="group" aria-label="Category">\${[[\`all\`, \`All\`], ...AGRO_CATEGORIES.map((e) => [e, e])].map(([t, n]) => \`<button type="button" class="chip" data-cat="\${t}" aria-pressed="\${z === t}">\${t === \`all\` ? \`\` : \`<i class="dot" style="--c:var(--\${CATEGORY_TONES[t] || 'pine'})\"></i>\`}\${escapeHtml(n)} <b data-cn="\${t}">0</b></button>\`).join(\`\`)}</div>`;

if (code.includes(oldOtHeader)) {
  code = code.replace(oldOtHeader, newOtHeader);
  console.log('Step 4: Updated Ot header and category chips');
} else {
  console.error('Step 4 failed: oldOtHeader not found');
}

// 5. Wire up click listeners in Ot() for Add Product and Edit Product
const oldClickListener = `  t.addEventListener(\`click\`, (e) => {
    let e_target = e.target;
    let r = e_target.closest(\`[data-adj]\`);`;

const newClickListener = `  t.addEventListener(\`click\`, (e) => {
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

    let r = e_target.closest(\`[data-adj]\`);`;

if (code.includes(oldClickListener)) {
  code = code.replace(oldClickListener, newClickListener);
  console.log('Step 5: Updated Ot click listeners');
} else {
  console.error('Step 5 failed: oldClickListener not found');
}

// 6. Update Xt(t) Item Detail Page to show Agricultural Specs Sheet & Compatibility Matrix
const oldXtHeader = `    actions: \`<span class="pi-nav" role="group" aria-label="Browse products"><a class="ibtn ibtn--sm" href="/products/item/\${o.id}" data-dir="-1" aria-label="Previous: \${escapeHtml(formatProductFullName(o))}" title="Previous: \${escapeHtml(formatProductFullName(o))}">\${renderIcon(\`chevL\`)}</a><span class="pi-pos">\${i + 1} of \${n_length}</span><a class="ibtn ibtn--sm" href="/products/item/\${s.id}" data-dir="1" aria-label="Next: \${escapeHtml(formatProductFullName(s))}" title="Next: \${escapeHtml(formatProductFullName(s))}">\${renderIcon(\`chevR\`)}</a></span>
      <button type="button" class="btn btn--ghost" data-do="order">\${renderIcon(\`orders\`)}<span>New order</span></button><button type="button" class="btn btn--ghost" data-do="move">\${renderIcon(\`swap\`)}<span>Move stock</span></button><button type="button" class="btn btn--primary magnetic" data-do="batch">\${renderIcon(\`flask\`)}<span>Make a batch</span></button>\`,`;

const newXtHeader = `    actions: \`<span class="pi-nav" role="group" aria-label="Browse products"><a class="ibtn ibtn--sm" href="/products/item/\${o.id}" data-dir="-1" aria-label="Previous: \${escapeHtml(formatProductFullName(o))}" title="Previous: \${escapeHtml(formatProductFullName(o))}">\${renderIcon(\`chevL\`)}</a><span class="pi-pos">\${i + 1} of \${n_length}</span><a class="ibtn ibtn--sm" href="/products/item/\${s.id}" data-dir="1" aria-label="Next: \${escapeHtml(formatProductFullName(s))}" title="Next: \${escapeHtml(formatProductFullName(s))}">\${renderIcon(\`chevR\`)}</a></span>
      <button type="button" class="btn btn--primary" data-do="edit-prod">\${renderIcon('edit')}<span>Edit Product</span></button><button type="button" class="btn btn--ghost" data-do="move">\${renderIcon(\`swap\`)}<span>Move stock</span></button><button type="button" class="btn btn--ghost" data-do="order">\${renderIcon(\`orders\`)}<span>New order</span></button>\`,`;

if (code.includes(oldXtHeader)) {
  code = code.replace(oldXtHeader, newXtHeader);
  console.log('Step 6: Updated Xt header actions');
} else {
  console.error('Step 6 failed: oldXtHeader not found');
}

// 7. Add Agricultural Specs card into Xt(t) body
const oldXtAboutTags = `<div class="pi-tags"><span class="tag" style="--c:var(--\${CATEGORY_TONES[t.category]})">\${escapeHtml(t.category)}</span><span class="tag">\${escapeHtml(t.size)}</span>\${t.active ? renderPill(\`On sale\`, \`sage\`) : renderPill(\`Archived\`, \`faint\`)}</div>`;

const newXtAboutTags = `<div class="pi-tags">
          <span class="tag" style="--c:var(--\${CATEGORY_TONES[t.category] || 'pine'})">\${escapeHtml(t.category)}</span>
          <span class="tag">\${escapeHtml(t.size || (t.hp ? \`\${t.hp} HP\` : 'Standard'))}</span>
          <span class="tag" style="--c:var(--teal)">\${t.gstPct || 12}% GST Slab</span>
          \${t.active ? renderPill(\`On sale\`, \`sage\`) : renderPill(\`Archived\`, \`faint\`)}
        </div>
        \${t.hp || t.hitch ? \`
          <div class="pi-specs-card">
            <h3 style="margin:0 0 8px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--primary);">Agricultural Specifications</h3>
            <div class="pi-specs-grid">
              \${t.hp ? \`<div class="pi-spec-item"><dt>Horsepower</dt><dd>\${t.hp} HP Rating</dd></div>\` : ''}
              \${t.driveType ? \`<div class="pi-spec-item"><dt>Drive Type</dt><dd>\${t.driveType}</dd></div>\` : ''}
              \${t.hitch ? \`<div class="pi-spec-item"><dt>3-Point Hitch</dt><dd>\${t.hitch}</dd></div>\` : ''}
              \${t.ptoRPM ? \`<div class="pi-spec-item"><dt>PTO Speed</dt><dd>\${t.ptoRPM} RPM</dd></div>\` : ''}
              \${t.hsnCode ? \`<div class="pi-spec-item"><dt>HSN Code</dt><dd class="mono">\${t.hsnCode}</dd></div>\` : ''}
              \${t.brand ? \`<div class="pi-spec-item"><dt>Brand / OEM</dt><dd>\${escapeHtml(t.brand)}</dd></div>\` : ''}
            </div>
            \${t.compatibleModels?.length ? \`
              <div style="margin-top:12px; padding-top:10px; border-top:1px dashed var(--line);">
                <dt style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">Compatible Machinery Models</dt>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                  \${t.compatibleModels.map((m: any) => \`<span class="tag" style="font-size:11px; background:var(--surface-2); border:1px solid var(--line);">\${escapeHtml(m)}</span>\`).join('')}
                </div>
              </div>
            \` : ''}
          </div>
        \` : ''}`;

if (code.includes(oldXtAboutTags)) {
  code = code.replace(oldXtAboutTags, newXtAboutTags);
  console.log('Step 7: Updated Xt about tags & added specs card');
} else {
  console.error('Step 7 failed: oldXtAboutTags not found');
}

// 8. Wire up edit product button in Item view click listener
const oldItemClick = `    if (o) {
      openNewTransferModal(o);
      if (o.dataset.do === \`order\`) {`;

const newItemClick = `    if (o) {
      openNewTransferModal(o);
      if (o.dataset.do === \`edit-prod\`) {
        let prod = findProductById(G);
        if (prod) showAddEditAgroProductModal(prod);
        return;
      }
      if (o.dataset.do === \`order\`) {`;

if (code.includes(oldItemClick)) {
  code = code.replace(oldItemClick, newItemClick);
  console.log('Step 8: Updated Item view click listener for edit product');
} else {
  console.error('Step 8 failed: oldItemClick not found');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated products.ts!');
