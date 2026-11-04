import { store, notifyStoreSubscribers } from '../../../core/store';
import {
  animateCounter,
  animateCards,
  animateRows,
  motionDuration,
  playHaptic,
  flashElement,
  prefersReducedMotion,
  Flip,
  gsap,
} from '../../../core/motion';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import { formatDate, formatMoney, formatMoneyRound, pluralize } from '../../../utils/formatters';
import { renderIcon, renderIconButton, renderPill } from '../../../utils/icons';
import {
  renderPageHeader,
  renderTag,
  renderAvatarStack,
  renderSegmentedControl,
  initSegmentedControl,
  renderEmptyState,
  renderFilterBar,
  formatCsvRow,
  downloadFile,
  showToast,
  confirmDialog,
  openQuickCreateModal,
  openDrawer,
  bindModalDismiss,
  bindTabControls,
  animatePageTransition,
  renderStepper,
} from '../../../main';
import { SubscriptionPlan, BillingInvoice, CreditCardInfo } from '../../../types/settings';
import { triggerSavedBadge, SAVED_BADGE_HTML } from '../components/form-controls';
import { getActiveMembersCount } from './team';

export const PLANS: SubscriptionPlan[] = [
  {
    name: 'Studio',
    price: 49,
    cap: 5,
    blurb: 'One maker, one shelf',
    feats: [
      'Up to 5 seats',
      '1 stock location',
      'Batches with expiry dates',
      'Online and studio orders',
    ],
  },
  {
    name: 'Growth',
    price: 149,
    cap: 15,
    blurb: 'A lab that sells wholesale',
    feats: [
      'Up to 15 seats',
      '3 stock locations',
      'QA release and lot holds',
      'Wholesale orders and stockists',
      'Purchase orders and suppliers',
    ],
  },
  {
    name: 'Scale',
    price: 349,
    cap: 50,
    blurb: 'Several sites and a team',
    feats: [
      'Up to 50 seats',
      'Unlimited locations',
      'Everything in Growth',
      'API and webhooks',
      'SSO and audit export',
    ],
  },
];

export const getPlanPrice = (plan: SubscriptionPlan | undefined, cycle: string): number => {
  if (!plan) return 0;
  return cycle === 'yearly' ? plan.price * 0.8 : plan.price;
};

let activeInvoiceFilter = 'all';

export function getNextInvoiceDate(): number {
  const now = new Date(Date.now());
  return new Date(now.getFullYear(), now.getMonth() + +(now.getDate() >= 3), 3).getTime();
}

export function detectCardBrand(num: string): string {
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'Amex';
  if (/^6/.test(num)) return 'Discover';
  return 'Card';
}

export function getPlanNameByPrice(amount: number): string {
  return (
    PLANS.find((p) => p.price === amount || getPlanPrice(p, 'yearly') === amount)?.name ??
    store.settings.billing.plan
  );
}

export function renderBillingSubtab(): string {
  const billing = store.settings.billing;
  const currentPlan = PLANS.find((p) => p.name === billing.plan);
  const usedSeats = getActiveMembersCount();
  const currentYear = new Date(Date.now()).getFullYear();

  const paidThisYear = billing.invoices
    .filter((inv) => inv.status === 'paid' && new Date(inv.at).getFullYear() === currentYear)
    .reduce((sum, inv) => sum + inv.amount, 0);

  return `${renderPageHeader({
    eyebrow: 'Your plan, seats and invoices',
    title: 'Billing',
    stats: [
      {
        key: 'bill',
        icon: 'dollar',
        label: 'Per month',
        value: getPlanPrice(currentPlan, billing.cycle),
        fmt: 'money',
        ico: 'pine',
      },
      {
        key: 'seats',
        icon: 'users',
        label: 'Seats in use',
        value: usedSeats,
        suffix: `of ${billing.seats}`,
        ico: 'sky',
      },
      {
        key: 'paid',
        icon: 'receipt',
        label: 'Paid this year',
        value: paidThisYear,
        fmt: 'money',
        ico: 'sage',
      },
    ],
  })}
  <section class="card st-plans-card" aria-labelledby="bi-p-t">
    <header class="card__head"><div><h2 class="card__title" id="bi-p-t">Plan</h2><p class="card__sub" data-k="bi-next"></p></div>
      <div class="card__tools">${renderSegmentedControl(
        'Billing cycle',
        [
          ['monthly', 'Monthly'],
          ['yearly', 'Yearly · save 20%'],
        ],
        billing.cycle,
        'st-seg-cycle'
      )}</div></header>
    <div class="st-plans" data-k="bi-plans">${PLANS.map(
      (p) => `<div class="st-plan${p.name === billing.plan ? ' is-current' : ''}" data-plan="${p.name}">
      <div class="st-plan__top"><b class="st-plan__name">${escapeHtml(p.name)}</b>${p.name === billing.plan ? `<span class="st-current" data-k="bi-badge">${renderIcon('check')}Current</span>` : ''}</div>
      <p class="st-plan__blurb">${escapeHtml(p.blurb)}</p>
      <p class="st-plan__price"><b class="num" data-price="${p.name}">${formatMoneyRound(getPlanPrice(p, billing.cycle))}</b><span>/ month</span></p>
      <p class="st-plan__bill" data-billed="${p.name}"></p>
      <ul class="st-plan__feats">${p.feats.map((feat) => `<li>${renderIcon('check')}${escapeHtml(feat)}</li>`).join('')}</ul>
      <button type="button" class="btn ${p.name === billing.plan ? 'btn--ghost' : 'btn--soft'} btn--sm st-plan__go" data-switch="${p.name}" ${p.name === billing.plan ? 'disabled' : ''}>${p.name === billing.plan ? 'Your plan' : `Switch to ${escapeHtml(p.name)}`}</button>
    </div>`
    ).join('')}</div>
  </section>
  <div class="st-grid st-grid--billing">
    <section class="card st-pay" aria-labelledby="bi-c-t">
      <header class="card__head"><div><h2 class="card__title" id="bi-c-t">Payment method</h2><p class="card__sub">Charged on the 3rd of each ${billing.cycle === 'yearly' ? 'year' : 'month'}</p></div></header>
      <div class="st-cc-wrap"><div class="st-cc" data-k="bi-card"></div></div>
      <div class="st-pay__foot"><button type="button" class="btn btn--ghost btn--sm" data-k="bi-update">${renderIcon('edit')}Update card</button></div>
    </section>
    <section class="card st-seatcard" aria-labelledby="bi-s-t">
      <header class="card__head"><div><h2 class="card__title" id="bi-s-t">Seats</h2><p class="card__sub" data-k="bi-seat-sub"></p></div>${SAVED_BADGE_HTML}</header>
      <div class="st-seatrow" data-k="bi-seatrow">${renderStepper('seats', billing.seats, 'seats', usedSeats)}<div><b class="num" data-k="bi-seat-cost"></b><small data-k="bi-seat-note"></small></div></div>
      <span class="meter"><span class="meter__fill" data-k="bi-seat-meter" style="--c:var(--sky)"></span></span>
      <p class="st-seats__note" data-k="bi-seat-help"></p>
      <div class="st-holders"><small>Who holds a seat</small><div class="st-holders__row"><span data-k="bi-holders"></span><a class="btn btn--ghost btn--sm" href="/settings/team">${renderIcon('users')}Manage team</a></div></div>
    </section>
  </div>
  <section class="card st-inv tcard" aria-labelledby="bi-i-t">
    <header class="card__head"><div><h2 class="card__title" id="bi-i-t">Invoices</h2><p class="card__sub" data-k="bi-inv-sub"></p></div>
      <div class="card__tools">${renderSegmentedControl(
        'Show invoices',
        [
          ['all', 'All'],
          ['paid', 'Paid'],
          ['due', 'Due'],
        ],
        activeInvoiceFilter,
        'st-seg-inv'
      )}</div></header>
    <div class="table-wrap"><table class="table table--stack st-itable" style="--areas:'t r' 's p'">
      <thead><tr><th scope="col">Invoice</th><th scope="col">Description</th><th scope="col">Status</th><th scope="col" class="r">Amount</th><th scope="col"><span class="sr">Download</span></th></tr></thead>
      <tbody data-k="bi-rows"></tbody>
    </table></div>
  </section>`;
}

export function renderCreditCardHtml(container: HTMLElement): void {
  const card = store.settings.billing.card;
  const cardEl = queryOne<HTMLElement>('[data-k="bi-card"]', container);
  if (!cardEl) return;

  cardEl.innerHTML = `<div class="st-cc__face"><div class="st-cc__top"><span class="st-cc__chip" aria-hidden="true"></span><b class="st-cc__brand">${escapeHtml(card.brand)}</b></div>
    <p class="st-cc__num num" aria-label="Card ending ${escapeHtml(card.last4)}"><span>••••</span><span>••••</span><span>••••</span><span>${escapeHtml(card.last4)}</span></p>
    <div class="st-cc__bot"><span><small>Card holder</small><b>${escapeHtml(card.name)}</b></span><span><small>Expires</small><b class="num">${escapeHtml(card.exp)}</b></span></div></div>`;
}

export function renderInvoicesTable(container: HTMLElement, withDismiss = false): void {
  const invoices = store.settings.billing.invoices;
  const filtered = invoices.filter((inv) => activeInvoiceFilter === 'all' || inv.status === activeInvoiceFilter);

  const rowsHtml = filtered.length
    ? filtered
        .map(
          (inv) => `<tr class="is-link" data-key="${inv.id}" data-inv="${inv.id}">
      <td class="a-t"><b class="mono">${escapeHtml(inv.id)}</b><small class="st-sub">${formatDate(inv.at, true)}</small></td>
      <td class="a-s">Vels ${escapeHtml(getPlanNameByPrice(inv.amount))} · ${new Date(inv.at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
      <td class="a-p">${renderPill(inv.status === 'paid' ? 'Paid' : 'Due', inv.status === 'paid' ? 'sage' : 'ochre')}</td>
      <td class="a-r r"><b class="num">${formatMoney(inv.amount)}</b></td>
      <td class="a-h r">${renderIconButton('download', `Download ${inv.id}`, `data-dl="${inv.id}"`, 'ibtn--sm')}</td></tr>`
        )
        .join('')
    : `<tr><td colspan="5">${renderEmptyState(activeInvoiceFilter === 'due' ? 'Nothing due' : 'No invoices', activeInvoiceFilter === 'due' ? 'Every invoice is paid. The next one arrives on the 3rd.' : 'Invoices appear after your first billing date.', 'receipt', activeInvoiceFilter === 'all' ? '' : '<button type="button" class="btn btn--ghost btn--sm" data-k="bi-all">Show all invoices</button>')}</td></tr>`;

  const tbody = queryOne<HTMLElement>('[data-k="bi-rows"]', container);
  if (tbody) {
    if (withDismiss) {
      bindModalDismiss(tbody, () => {
        tbody.innerHTML = rowsHtml;
      });
    } else {
      tbody.innerHTML = rowsHtml;
    }
  }

  const subEl = queryOne<HTMLElement>('[data-k="bi-inv-sub"]', container);
  if (subEl) {
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    subEl.textContent = `${pluralize(invoices.length, 'invoice')} · ${formatMoney(total)} in total`;
  }
}

export function updatePlanPrices(container: HTMLElement, animate = false): void {
  const billing = store.settings.billing;
  const currentPlan = PLANS.find((p) => p.name === billing.plan);

  PLANS.forEach((plan) => {
    const priceEl = queryOne<HTMLElement>(`[data-price="${plan.name}"]`, container);
    if (priceEl) {
      animateCounter(priceEl, getPlanPrice(plan, billing.cycle), formatMoneyRound, {
        duration: animate ? 0.8 : 0,
      });
    }
    const billedEl = queryOne<HTMLElement>(`[data-billed="${plan.name}"]`, container);
    if (billedEl) {
      billedEl.textContent =
        billing.cycle === 'yearly'
          ? `${formatMoneyRound(getPlanPrice(plan, 'yearly') * 12)} billed yearly`
          : 'Billed monthly, cancel any time';
    }
  });

  const nextEl = queryOne<HTMLElement>('[data-k="bi-next"]', container);
  if (nextEl) {
    const nextAmount = billing.cycle === 'yearly' ? getPlanPrice(currentPlan, 'yearly') * 12 : (currentPlan?.price ?? 0);
    nextEl.textContent = `${billing.plan} · next invoice ${formatMoney(nextAmount)} on ${formatDate(getNextInvoiceDate(), true)}`;
  }

  const billStatEl = queryOne<HTMLElement>('[data-stat="bill"] b[data-count]', container);
  if (billStatEl) renderFilterBar(billStatEl, getPlanPrice(currentPlan, billing.cycle));

  const seatsStatEl = queryOne<HTMLElement>('[data-stat="seats"] b[data-count]', container);
  if (seatsStatEl) renderFilterBar(seatsStatEl, getActiveMembersCount());

  const suffixEl = queryOne<HTMLElement>('[data-stat="seats"] .stat__suffix', container);
  if (suffixEl) suffixEl.textContent = `of ${billing.seats}`;
}

export function updateSeatsControls(container: HTMLElement, animate = false): void {
  const billing = store.settings.billing;
  const cap = PLANS.find((p) => p.name === billing.plan)?.cap ?? billing.seats;
  const used = getActiveMembersCount();

  const stepperInput = queryOne<HTMLInputElement>('.stepper__in', queryOne('[data-k="bi-seatrow"]', container));
  if (stepperInput) {
    if (document.activeElement !== stepperInput) {
      stepperInput.value = String(billing.seats);
    }
    stepperInput.min = String(used);
    stepperInput.max = String(cap);
  }

  const subEl = queryOne<HTMLElement>('[data-k="bi-seat-sub"]', container);
  if (subEl) subEl.textContent = `${billing.plan} covers up to ${cap}`;

  const costEl = queryOne<HTMLElement>('[data-k="bi-seat-cost"]', container);
  if (costEl) costEl.textContent = `${billing.seats} seats`;

  const noteEl = queryOne<HTMLElement>('[data-k="bi-seat-note"]', container);
  if (noteEl) noteEl.textContent = `${used} in use · ${Math.max(0, billing.seats - used)} free`;

  const meterEl = queryOne<HTMLElement>('[data-k="bi-seat-meter"]', container);
  if (meterEl) {
    gsap.to(meterEl, {
      scaleX: Math.max(0.02, billing.seats / cap),
      duration: motionDuration(0.7),
      delay: motionDuration(animate ? 0.4 : 0),
      ease: 'power3.inOut',
    });
  }

  const holdersEl = queryOne<HTMLElement>('[data-k="bi-holders"]', container);
  if (holdersEl) {
    holdersEl.innerHTML = renderAvatarStack(
      store.team.filter((m) => m.status !== 'invited').map((m) => m.id),
      'sm'
    );
  }

  const helpEl = queryOne<HTMLElement>('[data-k="bi-seat-help"]', container);
  if (helpEl) {
    helpEl.innerHTML =
      billing.seats >= cap
        ? `${renderIcon('info')}<span>This is the most ${billing.plan} allows — Scale goes to 50.</span>`
        : `${renderIcon('info')}<span>Seats can’t go below the ${used} people using one.</span>`;
  }
}

export function setBillingSeats(container: HTMLElement, value: number): void {
  const billing = store.settings.billing;
  const cap = PLANS.find((p) => p.name === billing.plan)?.cap ?? billing.seats;
  const used = getActiveMembersCount();
  const clamped = Math.max(used, Math.min(cap, Math.round(value) || used));

  if (clamped === billing.seats) {
    updateSeatsControls(container, false);
    return;
  }

  billing.seats = clamped;
  notifyStoreSubscribers('settings');
  triggerSavedBadge(domQuery('.st-seatcard', container));
}

export async function switchPlan(container: HTMLElement, newPlanName: string): Promise<void> {
  const billing = store.settings.billing;
  const targetPlan = PLANS.find((p) => p.name === newPlanName);
  if (!targetPlan) return;

  const used = getActiveMembersCount();
  if (used > targetPlan.cap) {
    showToast(`${targetPlan.name} covers ${targetPlan.cap} seats — ${used} people use one now`, { ico: 'alert' });
    return;
  }

  const monthlyPrice = formatMoneyRound(getPlanPrice(targetPlan, billing.cycle));
  const cycleNote = billing.cycle === 'yearly' ? ', billed yearly' : '';
  const seatDropNote = targetPlan.cap < billing.seats ? ` Seats drop to ${targetPlan.cap}.` : '';

  const confirmed = await confirmDialog(
    `Switch to ${targetPlan.name}?`,
    `${monthlyPrice} a month${cycleNote}, from the invoice on ${formatDate(getNextInvoiceDate(), true)}.${seatDropNote}`,
    `Switch to ${targetPlan.name}`,
    false
  );
  if (!confirmed) return;

  const badgeEl = queryOne<HTMLElement>('[data-k="bi-badge"]', container);
  const flipState = badgeEl ? Flip.getState(badgeEl) : null;

  billing.plan = newPlanName;
  billing.seats = Math.min(billing.seats, targetPlan.cap);

  domQueryAll('.st-plan', container).forEach((planCard) => {
    const isThis = (planCard as HTMLElement).dataset.plan === newPlanName;
    planCard.classList.toggle('is-current', isThis);
    const switchBtn = domQuery<HTMLButtonElement>('[data-switch]', planCard);
    if (switchBtn) {
      switchBtn.disabled = isThis;
      switchBtn.className = `btn ${isThis ? 'btn--ghost' : 'btn--soft'} btn--sm st-plan__go`;
      switchBtn.textContent = isThis ? 'Your plan' : `Switch to ${(planCard as HTMLElement).dataset.plan}`;
    }
  });

  const targetPlanCard = domQuery<HTMLElement>(`.st-plan[data-plan="${newPlanName}"]`, container);
  const targetTop = targetPlanCard ? domQuery<HTMLElement>('.st-plan__top', targetPlanCard) : null;

  if (badgeEl && targetTop) {
    targetTop.append(badgeEl);
    if (flipState && !prefersReducedMotion.matches) {
      Flip.from(flipState, {
        duration: motionDuration(0.7),
        ease: 'power3.inOut',
        scale: true,
        clearProps: 'transform',
      });
    }
  }

  notifyStoreSubscribers('settings');
  const priceEl = domQuery<HTMLElement>(`[data-price="${newPlanName}"]`, container);
  if (priceEl) flashElement(priceEl);

  showToast(`You’re on ${newPlanName} now`, { ico: 'sparkle' });
}

export function openUpdateCardModal(fromEl?: HTMLElement): void {
  openQuickCreateModal({
    title: 'Update card',
    sub: 'Your next invoice goes on this card. We never store the full number.',
    from: fromEl,
    submit: 'Save card',
    fields: [
      {
        name: 'number',
        label: 'Card number',
        required: true,
        placeholder: '4242 4242 4242 4242',
        wide: true,
      },
      {
        name: 'exp',
        label: 'Expiry',
        required: true,
        placeholder: 'MM/YY',
      },
      {
        name: 'cvc',
        label: 'Security code',
        required: true,
        placeholder: '3 or 4 digits',
      },
      {
        name: 'name',
        label: 'Name on card',
        required: true,
        value: store.settings.billing.card.name,
        wide: true,
      },
    ],
    onMount: (form) => {
      const numInput = form.elements.namedItem('number') as HTMLInputElement;
      const expInput = form.elements.namedItem('exp') as HTMLInputElement;
      const cvcInput = form.elements.namedItem('cvc') as HTMLInputElement;

      numInput.inputMode = 'numeric';
      expInput.inputMode = 'numeric';
      cvcInput.inputMode = 'numeric';
      numInput.autocomplete = 'cc-number';
      expInput.autocomplete = 'cc-exp';

      numInput.addEventListener('input', () => {
        numInput.value = numInput.value
          .replace(/\D/g, '')
          .slice(0, 19)
          .replace(/(\d{4})(?=\d)/g, '$1 ');
      });

      expInput.addEventListener('input', () => {
        const val = expInput.value.replace(/\D/g, '').slice(0, 4);
        expInput.value = val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val;
      });
    },
    onSubmit: (values) => {
      const numClean = (values.number ?? '').replace(/\D/g, '');
      const brand = detectCardBrand(numClean);

      if (numClean.length < 15 || numClean.length > 16 || (brand === 'Amex' && numClean.length !== 15)) {
        return 'That card number is the wrong length.';
      }

      let checkSum = 0;
      [...numClean].reverse().forEach((char, idx) => {
        let n = Number(char);
        if (idx % 2) {
          n *= 2;
          if (n > 9) n -= 9;
        }
        checkSum += n;
      });

      if (checkSum % 10 !== 0) {
        return 'That card number doesn’t check out — look for a typo.';
      }

      const expMatch = /^(\d{2})\/(\d{2})$/.exec(values.exp ?? '');
      if (!expMatch || Number(expMatch[1]) < 1 || Number(expMatch[1]) > 12) {
        return 'Write the expiry as MM/YY.';
      }

      const now = new Date(Date.now());
      const expYear = 2000 + Number(expMatch[2]);
      const expMonth = Number(expMatch[1]);
      if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
        return 'That card has expired.';
      }

      if (!/^\d{3,4}$/.test(values.cvc ?? '')) {
        return 'The security code is 3 or 4 digits.';
      }

      store.settings.billing.card = {
        brand,
        last4: numClean.slice(-4),
        exp: values.exp,
        name: values.name,
      };

      notifyStoreSubscribers('settings');

      const cardContainer = document.querySelector<HTMLElement>('[data-k="bi-card"]');
      if (cardContainer) {
        if (prefersReducedMotion.matches) {
          renderCreditCardHtml(cardContainer.parentElement!);
        } else {
          gsap
            .timeline()
            .to(cardContainer, { rotationY: 90, duration: 0.28, ease: 'power2.in' })
            .add(() => renderCreditCardHtml(cardContainer.parentElement!))
            .fromTo(cardContainer, { rotationY: -90 }, { rotationY: 0, duration: 0.5, ease: 'back.out(1.6)', clearProps: 'transform' });
        }
      }

      showToast(`${brand} ending ${numClean.slice(-4)} saved`, { ico: 'card' });
    },
  });
}

export function downloadInvoiceCsv(invoiceId: string, fromEl?: HTMLElement): void {
  const invoice = store.settings.billing.invoices.find((inv) => inv.id === invoiceId);
  if (!invoice) return;

  if (fromEl) playHaptic(fromEl);

  downloadFile(
    `${invoice.id}.csv`,
    formatCsvRow([
      ['Invoice', 'Date', 'Description', 'Amount (INR)', 'Status'],
      [
        invoice.id,
        new Date(invoice.at).toISOString().slice(0, 10),
        `Vels ${getPlanNameByPrice(invoice.amount)} plan`,
        invoice.amount.toFixed(2),
        invoice.status,
      ],
    ]),
    'text/csv'
  );

  showToast(`${invoice.id} downloaded`, { ico: 'download' });
}

export function openInvoiceDrawer(invoiceId: string): void {
  const invoice = store.settings.billing.invoices.find((inv) => inv.id === invoiceId);
  if (!invoice) {
    history.replaceState(null, '', '/settings/billing');
    return;
  }

  const company = store.settings.company;
  const card = store.settings.billing.card;

  openDrawer(
    `<div class="d-head">${renderTag('receipt', invoice.status === 'paid' ? 'sage' : 'ochre')}<div><h2 class="mono">${escapeHtml(invoice.id)}</h2><small>Issued ${formatDate(invoice.at, true)}</small></div></div>
    <div class="d-pills">${renderPill(invoice.status === 'paid' ? 'Paid' : 'Due', invoice.status === 'paid' ? 'sage' : 'ochre')}</div>
    <div class="d-facts"><div><small>Amount</small><b>${formatMoney(invoice.amount)}</b><span>INR, tax included</span></div><div><small>Paid with</small><b>${escapeHtml(card.brand)} •• ${escapeHtml(card.last4)}</b><span>${invoice.status === 'paid' ? `on ${formatDate(invoice.at + ONE_DAY_MS)}` : 'Pending'}</span></div></div>
    <div class="d-sec"><h3>Lines</h3><ul class="bom"><li><span>Vels ${escapeHtml(getPlanNameByPrice(invoice.amount))} plan</span><small>${new Date(invoice.at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</small><b>${formatMoney(invoice.amount)}</b></li></ul></div>
    <div class="d-sec"><h3>Billed to</h3><p class="st-billto"><b>${escapeHtml(company.legal)}</b><br>${escapeHtml(company.address)}<br>EIN ${escapeHtml(company.taxId)}</p></div>
    <div class="d-actions"><button type="button" class="btn btn--primary" data-d-dl="${invoice.id}">${renderIcon('download')}Download CSV</button></div>`,
    {
      label: `Invoice ${invoice.id}`,
      onClose: () => {
        if (window.location.pathname.startsWith('/settings/billing/')) {
          history.replaceState(null, '', '/settings/billing');
        }
      },
      onMount: (drawerEl) =>
        drawerEl.querySelector<HTMLElement>('[data-d-dl]')?.addEventListener('click', (e) =>
          downloadInvoiceCsv(invoiceId, e.currentTarget as HTMLElement)
        ),
    }
  );
}

export function initBillingSubtab(container: HTMLElement): void {
  renderCreditCardHtml(container);
  renderInvoicesTable(container, false);
  updatePlanPrices(container, false);
  updateSeatsControls(container, false);

  const cycleCtrl = domQuery('.st-seg-cycle', container);
  if (cycleCtrl) {
    initSegmentedControl(cycleCtrl, (val) => {
      store.settings.billing.cycle = val as any;
      notifyStoreSubscribers('settings');
      showToast(
        val === 'yearly'
          ? 'Yearly billing — 20% off from the next invoice'
          : 'Monthly billing from the next invoice',
        { ico: 'calendar' }
      );
    });
  }

  const invCtrl = domQuery('.st-seg-inv', container);
  if (invCtrl) {
    initSegmentedControl(invCtrl, (val) => {
      activeInvoiceFilter = val;
      renderInvoicesTable(container, true);
    });
  }

  const seatrowEl = queryOne<HTMLElement>('[data-k="bi-seatrow"]', container);
  if (seatrowEl) {
    bindTabControls(seatrowEl, (e: any) => setBillingSeats(container, Number(e.value)));
    const stepperIn = domQuery<HTMLInputElement>('.stepper__in', seatrowEl);
    if (stepperIn) {
      stepperIn.addEventListener('blur', () => updateSeatsControls(container, false));
    }
  }

  queryOne<HTMLElement>('[data-k="bi-update"]', container)?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    playHaptic(target);
    openUpdateCardModal(target);
  });

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const switchBtn = target.closest<HTMLElement>('[data-switch]');
    if (switchBtn) {
      playHaptic(switchBtn);
      switchPlan(container, switchBtn.dataset.switch as string);
      return;
    }

    const dlBtn = target.closest<HTMLElement>('[data-dl]');
    if (dlBtn) {
      downloadInvoiceCsv(dlBtn.dataset.dl as string, dlBtn);
      return;
    }

    if (target.closest('[data-k="bi-all"]')) {
      domQueryAll('.st-seg-inv .seg__btn', container)[0]?.click();
      return;
    }

    const invRow = target.closest<HTMLElement>('[data-inv]');
    if (invRow && !target.closest('button, a')) {
      (window as any).navigateTo(`/settings/billing/${invRow.dataset.inv}`);
    }
  });
}

export function animateBillingSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.07 }), 0.12)
    .add(animateCards(domQueryAll('.st-plan', container), { stagger: 0.08, y: 22 }), 0.3)
    .add(animateRows(domQueryAll('.st-plan__feats li', container), { x: -6, y: 0, stagger: 0.02 }), 0.55)
    .add(animateRows(domQueryAll('.st-itable tbody tr', container), { y: 8, stagger: 0.04 }), 0.45);

  const cardEl = queryOne<HTMLElement>('[data-k="bi-card"]', container);
  if (cardEl && !prefersReducedMotion.matches) {
    gsap.fromTo(
      cardEl,
      { rotationY: -24, rotationX: 8, y: 16, opacity: 0 },
      {
        rotationY: 0,
        rotationX: 0,
        y: 0,
        opacity: 1,
        duration: motionDuration(1.1),
        delay: motionDuration(0.35),
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      }
    );
  }

  updateSeatsControls(container, true);
}
