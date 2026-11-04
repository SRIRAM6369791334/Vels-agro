import { store, findMemberById, notifyStoreSubscribers } from '../../../core/store';
import {
  animateCards,
  animateRows,
  animatePop,
  motionDuration,
  playHaptic,
  flashElement,
  gsap,
} from '../../../core/motion';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import { formatInt, pluralize } from '../../../utils/formatters';
import { renderIcon } from '../../../utils/icons';
import {
  renderPageHeader,
  renderTag,
  renderSegmentedControl,
  initSegmentedControl,
  getLocationStockUnits,
  getExpiringBatches,
  exportStockCsv,
  exportOrdersCsv,
  exportMovementsCsv,
  resetDemoData,
  showToast,
  confirmDialog,
  animatePageTransition,
} from '../../../main';
import { renderFormField, renderSelectField, showFieldError, triggerSavedBadge, SAVED_BADGE_HTML } from '../components/form-controls';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TIMEZONE_OPTIONS: [string, string][] = [
  ['America/New_York', 'Eastern (New York)'],
  ['America/Chicago', 'Central (Chicago)'],
  ['America/Denver', 'Mountain (Denver)'],
  ['America/Los_Angeles', 'Pacific (Los Angeles)'],
];

const CURRENCY_OPTIONS: [string, string][] = [
  ['INR', 'Indian rupee (INR)'],
  ['USD', 'US dollar (USD)'],
  ['CAD', 'Canadian dollar (CAD)'],
  ['EUR', 'Euro (EUR)'],
  ['GBP', 'Pound sterling (GBP)'],
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EIN_REGEX = /^\d{2}-?\d{7}$/;

export function renderCompanySubtab(): string {
  const company = store.settings.company;
  const prefs = store.settings.prefs;

  return `${renderPageHeader({
    eyebrow: 'The business behind Vels',
    title: 'Company',
  })}
  <div class="st-grid st-grid--company">
    <div class="st-stack">
    <section class="card st-co" aria-labelledby="co-d-t">
      <header class="card__head"><div><h2 class="card__title" id="co-d-t">Business details</h2><p class="card__sub">On invoices, packing slips and purchase orders</p></div>${renderTag('building', 'pine', 'sm')}</header>
      <form class="st-form" data-k="co-form" novalidate>
        ${renderFormField({ name: 'name', label: 'Trading name', value: company.name })}
        ${renderFormField({ name: 'legal', label: 'Legal name', value: company.legal })}
        ${renderFormField({ name: 'email', label: 'Contact email', value: company.email, type: 'email' })}
        ${renderFormField({ name: 'phone', label: 'Phone', value: company.phone, type: 'tel' })}
        ${renderFormField({ name: 'address', label: 'Registered address', value: company.address, wide: true })}
        ${renderFormField({ name: 'taxId', label: 'EIN', value: company.taxId, ph: '00-0000000' })}
        ${renderSelectField('currency', 'Currency', company.currency, CURRENCY_OPTIONS)}
        ${renderSelectField('timezone', 'Time zone', company.timezone, TIMEZONE_OPTIONS)}
        ${renderSelectField('fiscalStart', 'Financial year starts', company.fiscalStart, MONTH_NAMES.map((m) => [m, m]))}
        <div class="st-form__foot st-field--wide"><span class="st-dirty" data-k="co-dirty" hidden>${renderIcon('edit')}Unsaved changes</span><button type="submit" class="btn btn--primary btn--sm" data-k="co-save" disabled>${renderIcon('check')}Save details</button></div>
      </form>
    </section>
    <section class="card st-data" aria-labelledby="co-x-t">
      <header class="card__head"><div><h2 class="card__title" id="co-x-t">Your data</h2><p class="card__sub">Everything Vels holds, as CSV</p></div></header>
      <div class="st-exports">
        <button type="button" class="st-export" data-export="stock">${renderTag('boxes', 'pine', 'sm')}<span><b>Stock</b><small>Every product by location</small></span>${renderIcon('download')}</button>
        <button type="button" class="st-export" data-export="orders">${renderTag('orders', 'sky', 'sm')}<span><b>Orders</b><small>${pluralize(store.orders.length, 'sales order')}</small></span>${renderIcon('download')}</button>
        <button type="button" class="st-export" data-export="moves">${renderTag('layers', 'teal', 'sm')}<span><b>Stock ledger</b><small>${pluralize(store.moves.length, 'movement')}</small></span>${renderIcon('download')}</button>
      </div>
      <div class="st-danger">
        <div><b>Reset demo data</b><small>Puts every product, order, batch and setting back to Monday morning. Your theme stays.</small></div>
        <button type="button" class="btn btn--danger btn--sm" data-k="co-reset">${renderIcon('refresh')}Reset data</button>
      </div>
    </section>
    </div>
    <div class="st-stack">
    <section class="card st-prefs" aria-labelledby="co-p-t">
      <header class="card__head"><div><h2 class="card__title" id="co-p-t">Stock preferences</h2><p class="card__sub">Every page reads these the moment they change</p></div></header>
      <div class="st-pref" data-k="pref-exp">
        <div class="st-pref__txt"><b>Expiry warning</b><small>Released lots inside this window raise an “Expiring soon” alert. <span data-k="co-exp-n"></span></small></div>
        <div class="st-pref__ctl">${renderSegmentedControl(
          'Expiry warning',
          [
            ['30', '30 d'],
            ['60', '60 d'],
            ['90', '90 d'],
            ['120', '120 d'],
          ],
          String(prefs.expiryWarnDays),
          'st-seg-exp'
        )}${SAVED_BADGE_HTML}</div>
      </div>
      <div class="st-pref" data-k="pref-low">
        <div class="st-pref__txt"><b>Low stock is judged by</b><small>A fixed reorder point per product, or how many days the stock will last.</small></div>
        <div class="st-pref__ctl">${renderSegmentedControl(
          'Low stock mode',
          [
            ['fixed', 'Reorder point'],
            ['cover', 'Days of cover'],
          ],
          prefs.lowStockMode,
          'st-seg-low'
        )}${SAVED_BADGE_HTML}</div>
      </div>
      <div class="st-pref" data-k="pref-loc">
        <div class="st-pref__txt"><b>Ship from</b><small>The location new sales orders pick from.</small></div>
        <div class="st-pref__ctl"><select class="select" data-k="co-loc" aria-label="Default ship-from location">${store.locations.map((loc) => `<option value="${loc.id}"${loc.id === prefs.defaultLoc ? ' selected' : ''}>${escapeHtml(loc.name)}</option>`).join('')}</select>${SAVED_BADGE_HTML}</div>
      </div>
      <div class="st-pref" data-k="pref-week">
        <div class="st-pref__txt"><b>Week starts on</b><small>For weekly charts, the order heatmap and counts.</small></div>
        <div class="st-pref__ctl">${renderSegmentedControl(
          'Week starts on',
          [
            ['mon', 'Monday'],
            ['sun', 'Sunday'],
          ],
          prefs.weekStart,
          'st-seg-week'
        )}${SAVED_BADGE_HTML}</div>
      </div>
    </section>
    <section class="card st-locs" aria-labelledby="co-l-t">
      <header class="card__head"><div><h2 class="card__title" id="co-l-t">Locations</h2><p class="card__sub">${pluralize(store.locations.length, 'site')} holding stock</p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="/warehouses/locations">${renderIcon('warehouse')}Manage</a></div></header>
      <div class="rows" data-k="co-locs"></div>
    </section>
    </div>
  </div>`;
}

export function isCompanyFormDirty(form: HTMLFormElement): boolean {
  const company = store.settings.company;
  return Object.keys(company).some((key) => {
    const input = form.elements.namedItem(key) as HTMLInputElement;
    return input && input.value.trim() !== (company as any)[key];
  });
}

export function updateCompanyFormState(form: HTMLFormElement, container: HTMLElement): void {
  const dirty = isCompanyFormDirty(form);
  const saveBtn = queryOne<HTMLButtonElement>('[data-k="co-save"]', container);
  const dirtyBadge = queryOne<HTMLElement>('[data-k="co-dirty"]', container);

  if (saveBtn) {
    const wasEnabled = !saveBtn.disabled;
    saveBtn.disabled = !dirty;
    if (dirtyBadge) {
      dirtyBadge.hidden = !dirty;
      if (dirty && !wasEnabled) {
        animatePop(dirtyBadge, { from: 0.8 });
      }
    }
  }
}

export function renderCompanyLocations(container: HTMLElement, animateMeters = false): void {
  const locsEl = queryOne<HTMLElement>('[data-k="co-locs"]', container);
  if (!locsEl) return;

  locsEl.innerHTML = store.locations
    .map((loc) => {
      const stock = getLocationStockUnits(loc.id);
      const ratio = Math.min(1, stock / loc.capacity);
      const tone = loc.kind === 'dc' ? 'pine' : loc.kind === 'lab' ? 'ocean' : 'ochre';
      const icon = loc.kind === 'dc' ? 'warehouse' : loc.kind === 'lab' ? 'flask' : 'store';
      const manager = findMemberById(loc.managerId);

      return `<a class="row st-loc" href="/warehouses/locations/${loc.id}">${renderTag(icon, tone)}<span class="row__txt"><b>${escapeHtml(loc.name)}</b><small>${escapeHtml(loc.address)}, ${escapeHtml(loc.city)} · ${escapeHtml(manager?.name ?? '')}</small><span class="meter"><span class="meter__fill" style="--c:var(--${tone});transform:scaleX(${animateMeters ? 0 : ratio})" data-to="${Math.max(0.02, ratio)}"></span></span></span><span class="row__end"><b>${formatInt(stock)}</b>of ${formatInt(loc.capacity)}</span></a>`;
    })
    .join('');

  if (animateMeters) {
    gsap.to(domQueryAll('.meter__fill', locsEl), {
      scaleX: (_i, el) => Number((el as HTMLElement).dataset.to),
      duration: motionDuration(1),
      stagger: motionDuration(0.08),
      delay: motionDuration(0.45),
      ease: 'power3.inOut',
    });
  }
}

export function updateExpiryCount(container: HTMLElement, initial = false): void {
  const count = getExpiringBatches().length;
  const expEl = queryOne<HTMLElement>('[data-k="co-exp-n"]', container);
  if (!expEl) return;

  expEl.innerHTML = `Right now <b class="num" data-k="co-exp-c">${count}</b> ${count === 1 ? 'lot falls' : 'lots fall'} inside it.`;
  if (!initial) {
    const numEl = queryOne('[data-k="co-exp-c"]', expEl);
    if (numEl) flashElement(numEl);
  }
}

export function initCompanySubtab(container: HTMLElement): void {
  renderCompanyLocations(container, false);
  updateExpiryCount(container, true);

  const form = queryOne<HTMLFormElement>('[data-k="co-form"]', container);
  if (form) {
    form.addEventListener('input', () => updateCompanyFormState(form, container));
    form.addEventListener('change', () => updateCompanyFormState(form, container));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const getField = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

      const validations: [string, string][] = [
        ['name', getField('name').value.trim() ? '' : 'Enter the trading name.'],
        ['legal', getField('legal').value.trim() ? '' : 'Enter the legal name.'],
        ['email', EMAIL_REGEX.test(getField('email').value.trim()) ? '' : 'That email doesn’t look right.'],
        ['taxId', EIN_REGEX.test(getField('taxId').value.trim()) ? '' : 'An EIN is nine digits: 12-3456789.'],
      ];

      validations.forEach(([name, err]) => showFieldError(getField(name), err));
      const firstErr = validations.find(([, err]) => err);
      if (firstErr) {
        getField(firstErr[0]).focus();
        return;
      }

      const company = store.settings.company;
      Object.keys(company).forEach((k) => {
        const input = getField(k);
        if (input) (company as any)[k] = input.value.trim();
      });

      notifyStoreSubscribers('settings');
      updateCompanyFormState(form, container);
      showToast(`${company.name} details saved`, { ico: 'building' });
    });
  }

  const triggerPrefSaved = (key: string, updateFn: () => void, toastMsg: string) => {
    updateFn();
    triggerSavedBadge(queryOne(`[data-k="${key}"]`, container));
    showToast(toastMsg, { ico: 'check' });
  };

  const expCtrl = domQuery('.st-seg-exp', container);
  if (expCtrl) {
    initSegmentedControl(expCtrl, (val) =>
      triggerPrefSaved(
        'pref-exp',
        () => {
          store.settings.prefs.expiryWarnDays = Number(val);
          notifyStoreSubscribers('settings', 'batches');
          updateExpiryCount(container);
        },
        `Expiry alerts now start ${val} days out`
      )
    );
  }

  const lowCtrl = domQuery('.st-seg-low', container);
  if (lowCtrl) {
    initSegmentedControl(lowCtrl, (val) =>
      triggerPrefSaved(
        'pref-low',
        () => {
          store.settings.prefs.lowStockMode = val as any;
          notifyStoreSubscribers('settings');
        },
        val === 'fixed' ? 'Low stock follows each reorder point' : 'Low stock follows days of cover'
      )
    );
  }

  const weekCtrl = domQuery('.st-seg-week', container);
  if (weekCtrl) {
    initSegmentedControl(weekCtrl, (val) =>
      triggerPrefSaved(
        'pref-week',
        () => {
          store.settings.prefs.weekStart = val as any;
          notifyStoreSubscribers('settings');
        },
        `Weeks now start on ${val === 'mon' ? 'Monday' : 'Sunday'}`
      )
    );
  }

  const locSelect = queryOne<HTMLSelectElement>('[data-k="co-loc"]', container);
  if (locSelect) {
    locSelect.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      const loc = store.locations.find((l) => l.id === val);
      triggerPrefSaved(
        'pref-loc',
        () => {
          store.settings.prefs.defaultLoc = val;
          notifyStoreSubscribers('settings');
        },
        `New orders ship from ${loc?.name ?? val}`
      );
    });
  }

  // Exports & Danger Zone
  container.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const exportBtn = target.closest<HTMLButtonElement>('[data-export]');
    if (exportBtn) {
      playHaptic(exportBtn);
      const kind = exportBtn.dataset.export;
      if (kind === 'stock') exportStockCsv();
      else if (kind === 'orders') exportOrdersCsv();
      else exportMovementsCsv();
      return;
    }

    const resetBtn = target.closest<HTMLButtonElement>('[data-k="co-reset"]');
    if (resetBtn) {
      playHaptic(resetBtn);
      const confirmed = await confirmDialog(
        'Reset all demo data?',
        'Every change you made — orders, batches, stock, teammates and settings — goes back to how it was on Monday morning. This can’t be undone.',
        'Reset everything'
      );
      if (!confirmed) return;

      resetDemoData();
      showToast('Demo data reset — reloading', { ico: 'refresh' });
      setTimeout(() => location.reload(), 900);
    }
  });
}

export function animateCompanySubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.07 }), 0.1)
    .add(animateRows(domQueryAll('.st-field, .st-pref, .st-export, .st-danger', container), { y: 10, stagger: 0.025 }), 0.3)
    .add(animateRows(domQueryAll('.st-loc', container), { x: 10, y: 0, stagger: 0.06 }), 0.35);

  domQueryAll('.st-loc .meter__fill', container).forEach((fillEl, idx) =>
    gsap.fromTo(
      fillEl,
      { scaleX: 0 },
      {
        scaleX: Number((fillEl as HTMLElement).dataset.to),
        duration: motionDuration(1),
        delay: motionDuration(0.45 + idx * 0.08),
        ease: 'power3.inOut',
      }
    )
  );
}
