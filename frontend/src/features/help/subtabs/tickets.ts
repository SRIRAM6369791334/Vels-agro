import { store, notifyStoreSubscribers } from '../../../core/store';
import {
  playHaptic,
  prefersReducedMotion,
  motionDuration,
  animateCards,
  animateRows,
  Flip,
  gsap,
} from '../../../core/motion';
import { domQuery, domQueryAll, queryOne, escapeHtml } from '../../../utils/dom';
import { renderIcon, renderPill } from '../../../utils/icons';
import { formatDate, formatRelativeTime, pluralize } from '../../../utils/formatters';
import {
  renderTag,
  renderEmptyState,
  highlightSearchMatch,
  bindModalDismiss,
  showToast,
  renderPageHeader,
  renderFilterBar,
  createHelpTicket,
  animatePageTransition,
} from '../../../main';
import { TICKET_TOPICS, TICKET_STATUS_CONFIG } from '../data/faq-data';
import { getPrefilledTicketSubject } from './center';

let rootContainer: HTMLElement | null = null;
let filterStatus = 'all';
let searchQuery = '';
const expandedTicketIds = new Set<string>();
let recentlySubmittedTicketId = '';

export function renderTicketsTemplate(): string {
  return `${renderPageHeader({
    eyebrow: 'Questions you’ve sent the Vels team',
    title: 'My tickets',
    actions: `<a class="btn btn--ghost" href="#/help/center">${renderIcon('book')}Help center</a>`,
    stats: [
      {
        key: 'open',
        icon: 'inbox',
        label: 'Open',
        value: 0,
        ico: 'sky',
      },
      {
        key: 'answered',
        icon: 'chat',
        label: 'Answered',
        value: 0,
        ico: 'sage',
      },
      {
        key: 'closed',
        icon: 'check',
        label: 'Closed',
        value: 0,
        ico: 'slate',
      },
      {
        key: 'reply',
        icon: 'clock',
        label: 'Typical first reply',
        value: 3,
        suffix: 'hours',
        ico: 'pine',
      },
    ],
  })}
  <div class="hp-tgrid">
    <section class="card hp-new" aria-labelledby="tk-n-t">
      <header class="card__head">
        <div>
          <h2 class="card__title" id="tk-n-t">Ask the team</h2>
          <p class="card__sub">From ${escapeHtml(store.settings?.me?.name ?? 'Admin')} · ${escapeHtml(store.settings?.me?.email ?? 'team@vels.agro')}</p>
        </div>
        ${renderTag('send', 'pine', 'sm')}
      </header>
      <form class="hp-form" data-k="tk-form" novalidate>
        <label class="field">
          <span class="field__label">Subject</span>
          <input name="subject" maxlength="90" placeholder="Barcode labels print off-centre" autocomplete="off" />
          <span class="hp-err" role="alert"></span>
        </label>
        <label class="field">
          <span class="field__label">Topic</span>
          <select name="topic">
            ${TICKET_TOPICS.map((topic) => `<option>${escapeHtml(topic)}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field__label">What happened?</span>
          <textarea name="body" rows="6" maxlength="1200" placeholder="What you did, what you expected and what Vels did instead. Lot numbers and order numbers help."></textarea>
          <span class="hp-count">
            <span class="hp-err" role="alert"></span>
            <small data-k="tk-count">0 / 1200</small>
          </span>
        </label>
        <div class="hp-form__foot">
          <span class="hp-form__note">${renderIcon('clock')}Replies within three working hours</span>
          <button type="submit" class="btn btn--primary">${renderIcon('send')}Send ticket</button>
        </div>
      </form>
    </section>
    <section class="card hp-tlist" aria-labelledby="tk-l-t">
      <header class="card__head">
        <div>
          <h2 class="card__title" id="tk-l-t">Your tickets</h2>
          <p class="card__sub" data-k="tk-sub"></p>
        </div>
        <div class="card__tools">
          <label class="search">
            ${renderIcon('search')}
            <input type="search" placeholder="Search tickets…" aria-label="Search tickets" data-k="tk-q" />
          </label>
        </div>
      </header>
      <div class="toolbar">
        <div class="chips" data-k="tk-filter">
          ${['all', 'open', 'answered', 'closed']
            .map(
              (key) =>
                `<button type="button" class="chip" data-tf="${key}" aria-pressed="${key === filterStatus}">${key === 'all' ? 'All' : TICKET_STATUS_CONFIG[key as keyof typeof TICKET_STATUS_CONFIG][1]} <b data-tn="${key}"></b></button>`
            )
            .join('')}
        </div>
      </div>
      <div class="hp-tickets" data-k="tk-list"></div>
    </section>
  </div>`;
}

export function renderTicketItemHtml(ticket: any, query: string): string {
  const statusConfig = TICKET_STATUS_CONFIG[ticket.status as keyof typeof TICKET_STATUS_CONFIG] ?? ['slate', 'Unknown'];
  const [tone, label] = statusConfig;
  const isOpen = expandedTicketIds.has(ticket.id);

  return `<div class="hp-ticket${isOpen ? ' is-open' : ''}${ticket.id === recentlySubmittedTicketId ? ' is-fresh' : ''}" data-key="${ticket.id}" data-tk="${ticket.id}">
    <button type="button" class="hp-ticket__head" aria-expanded="${isOpen}" aria-controls="tk-${ticket.id}">
      <span class="hp-ticket__txt">
        <b>${highlightSearchMatch(ticket.subject, query)}</b>
        <small><span class="mono">${highlightSearchMatch(String(ticket.number), query)}</span> · ${escapeHtml(ticket.topic)} · ${formatRelativeTime(ticket.at)}</small>
      </span>
      ${renderPill(label, tone)}
      <i class="hp-q__chev">${renderIcon('down')}</i>
    </button>
    <div class="hp-ticket__body" id="tk-${ticket.id}" ${isOpen ? '' : 'hidden'}>
      <div class="hp-a__in">
        <div class="hp-msg hp-msg--me">
          <span class="hp-msg__who">You · ${formatDate(ticket.at, true)}</span>
          <p>${highlightSearchMatch(ticket.body, query)}</p>
        </div>
        ${
          ticket.reply
            ? `<div class="hp-msg hp-msg--team"><span class="hp-msg__who">${renderIcon('logo')}Vels support</span><p>${escapeHtml(ticket.reply)}</p></div>`
            : `<p class="hp-wait">${renderIcon('hourglass')}Waiting for the team — usually within three working hours.</p>`
        }
        <div class="hp-ticket__acts">
          ${ticket.status === 'answered' ? `<button type="button" class="btn btn--soft btn--xs" data-solve="${ticket.id}">${renderIcon('check')}That solved it</button>` : ''}
          ${ticket.status === 'closed' ? `<button type="button" class="btn btn--ghost btn--xs" data-reopen="${ticket.id}">${renderIcon('refresh')}Reopen</button>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}

export function filterAndRenderTicketsList(animate: boolean): void {
  if (!rootContainer) return;
  const trimmed = searchQuery.trim().toLowerCase();

  ['all', 'open', 'answered', 'closed'].forEach((statusKey) => {
    const badgeEl = queryOne<HTMLElement>(`[data-tn="${statusKey}"]`, rootContainer!);
    if (badgeEl) {
      badgeEl.textContent = String(
        statusKey === 'all'
          ? store.tickets.length
          : store.tickets.filter((t: any) => t.status === statusKey).length
      );
    }
  });

  const filteredTickets = store.tickets.filter(
    (ticket: any) =>
      (filterStatus === 'all' || ticket.status === filterStatus) &&
      (!trimmed || `${ticket.subject} ${ticket.body} ${ticket.number} ${ticket.topic}`.toLowerCase().includes(trimmed))
  );

  const listEl = domQuery<HTMLElement>('[data-k="tk-list"]', rootContainer);
  const itemsHtml = filteredTickets.length
    ? filteredTickets.map((t: any) => renderTicketItemHtml(t, trimmed)).join('')
    : store.tickets.length
      ? renderEmptyState(
          trimmed ? `No ticket mentions “${searchQuery.trim()}”` : `No ${TICKET_STATUS_CONFIG[filterStatus as keyof typeof TICKET_STATUS_CONFIG]?.[1]?.toLowerCase() ?? ''} tickets`,
          trimmed ? 'Search by subject, number or what you wrote.' : 'Nothing is in this state right now.',
          'inbox',
          '<button type="button" class="btn btn--ghost btn--sm" data-k="tk-clear">Show every ticket</button>'
        )
      : renderEmptyState(
          'No tickets yet',
          'When something in Vels doesn’t work the way you expect, ask here — the answer lands in this list.',
          'chat'
        );

  if (animate) {
    bindModalDismiss(listEl, () => {
      listEl.innerHTML = itemsHtml;
    });
  } else {
    listEl.innerHTML = itemsHtml;
  }

  const subEl = domQuery<HTMLElement>('[data-k="tk-sub"]', rootContainer);
  if (subEl) {
    subEl.textContent = `${pluralize(store.tickets.length, 'ticket')} · ${store.tickets.filter((t: any) => t.status === 'open').length} waiting on the team`;
  }

  const updateHeaderCount = (statusKey: string, count: number) =>
    renderFilterBar(queryOne(`[data-stat="${statusKey}"] b[data-count]`, rootContainer!), count);

  updateHeaderCount('open', store.tickets.filter((t: any) => t.status === 'open').length);
  updateHeaderCount('answered', store.tickets.filter((t: any) => t.status === 'answered').length);
  updateHeaderCount('closed', store.tickets.filter((t: any) => t.status === 'closed').length);
}

export function toggleTicketItem(ticketEl: HTMLElement, forceOpen?: boolean): void {
  const ticketId = ticketEl.dataset.tk;
  if (!ticketId) return;

  const headBtn = domQuery<HTMLElement>('.hp-ticket__head', ticketEl);
  const bodyRegion = domQuery<HTMLElement>('.hp-ticket__body', ticketEl);
  const shouldOpen = forceOpen ?? headBtn.getAttribute('aria-expanded') !== 'true';

  if (shouldOpen === (headBtn.getAttribute('aria-expanded') === 'true')) {
    return;
  }

  const nextSiblings: Element[] = [];
  for (let sibling = ticketEl.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
    nextSiblings.push(sibling);
  }
  const flipState = Flip.getState(nextSiblings);
  const innerContent = domQuery<HTMLElement>('.hp-a__in', ticketEl);

  const applyToggleState = () => {
    headBtn.setAttribute('aria-expanded', String(shouldOpen));
    ticketEl.classList.toggle('is-open', shouldOpen);
    bodyRegion.hidden = !shouldOpen;
    if (shouldOpen) {
      expandedTicketIds.add(ticketId);
    } else {
      expandedTicketIds.delete(ticketId);
    }
    if (!prefersReducedMotion.matches) {
      Flip.from(flipState, {
        duration: motionDuration(0.45),
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
    }
  };

  gsap.to(domQuery('.hp-q__chev', ticketEl), {
    rotation: shouldOpen ? 180 : 0,
    duration: motionDuration(0.4),
    ease: 'back.out(2)',
  });
  gsap.killTweensOf(innerContent);

  if (shouldOpen) {
    applyToggleState();
    gsap.fromTo(
      innerContent,
      {
        opacity: 0,
        y: -8,
      },
      {
        opacity: 1,
        y: 0,
        duration: motionDuration(0.4),
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      }
    );
    animateRows(domQueryAll('.hp-msg', ticketEl), {
      y: 8,
      stagger: 0.08,
      delay: 0.05,
    });
  } else {
    gsap.to(innerContent, {
      opacity: 0,
      y: -6,
      duration: motionDuration(0.16),
      ease: 'power2.in',
      onComplete: () => {
        applyToggleState();
        gsap.set(innerContent, {
          clearProps: 'opacity,transform',
        });
      },
    });
  }

  if (shouldOpen) {
    history.replaceState(null, '', `#/help/tickets/${ticketId}`);
  } else if (location.hash.startsWith('#/help/tickets/')) {
    history.replaceState(null, '', '#/help/tickets');
  }
}

export function openTicketItemById(ticketId: string): void {
  if (!rootContainer) return;
  let targetEl = queryOne<HTMLElement>(`[data-tk="${CSS.escape(ticketId)}"]`, rootContainer);
  if (!targetEl) {
    if (!store.tickets.some((t: any) => t.id === ticketId)) {
      history.replaceState(null, '', '#/help/tickets');
      return;
    }
    filterStatus = 'all';
    searchQuery = '';
    const searchInput = domQuery<HTMLInputElement>('[data-k="tk-q"]', rootContainer);
    if (searchInput) searchInput.value = '';
    domQueryAll('[data-tf]', rootContainer).forEach((btn) =>
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-tf') === 'all'))
    );
    filterAndRenderTicketsList(false);
    targetEl = queryOne<HTMLElement>(`[data-tk="${CSS.escape(ticketId)}"]`, rootContainer);
    if (!targetEl) return;
  }

  toggleTicketItem(targetEl, true);
  setTimeout(
    () =>
      targetEl!.scrollIntoView({
        block: 'center',
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      }),
    motionDuration(200)
  );
}

export function initTicketsView(subtabContainer: HTMLElement): void {
  rootContainer = subtabContainer;
  rootContainer.innerHTML = renderTicketsTemplate();

  const form = domQuery<HTMLFormElement>('[data-k="tk-form"]', rootContainer);
  const subjectInput = form.elements.namedItem('subject') as HTMLInputElement;
  const bodyInput = form.elements.namedItem('body') as HTMLTextAreaElement;
  const topicSelect = form.elements.namedItem('topic') as HTMLSelectElement;

  const setFieldError = (inputEl: HTMLElement, errorMsg: string) => {
    const errEl = inputEl.closest('.field')?.querySelector<HTMLElement>('.hp-err');
    if (errEl) {
      errEl.textContent = errorMsg;
      inputEl.setAttribute('aria-invalid', String(!!errorMsg));
      if (errorMsg && !prefersReducedMotion.matches) {
        gsap.fromTo(
          errEl,
          { x: -6 },
          {
            x: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)',
            clearProps: 'transform',
          }
        );
      }
    }
  };

  form.addEventListener('input', (evt) => {
    const target = evt.target as HTMLElement;
    if (target === subjectInput || target === bodyInput) {
      setFieldError(target, '');
    }
    const countEl = domQuery<HTMLElement>('[data-k="tk-count"]', rootContainer!);
    if (countEl) {
      countEl.textContent = `${bodyInput.value.length} / 1200`;
    }
  });

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const subjectVal = subjectInput.value.trim();
    const bodyVal = bodyInput.value.trim();

    const subjectErr = subjectVal.length < 6 ? 'Give it a subject of a few words.' : '';
    const bodyErr = bodyVal.length < 20 ? 'Tell us a little more — at least a sentence.' : '';

    setFieldError(subjectInput, subjectErr);
    setFieldError(bodyInput, bodyErr);

    if (subjectErr) {
      subjectInput.focus();
      return;
    }
    if (bodyErr) {
      bodyInput.focus();
      return;
    }

    const ticketNumber = createHelpTicket(subjectVal, bodyVal, topicSelect.value);
    recentlySubmittedTicketId = store.tickets[0]?.id ?? '';

    if (filterStatus !== 'all' && filterStatus !== 'open') {
      filterStatus = 'all';
      domQueryAll('[data-tf]', rootContainer!).forEach((btn) =>
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-tf') === 'all'))
      );
    }
    searchQuery = '';
    const searchInput = domQuery<HTMLInputElement>('[data-k="tk-q"]', rootContainer!);
    if (searchInput) searchInput.value = '';

    filterAndRenderTicketsList(true);

    const freshCardEl = queryOne<HTMLElement>(`[data-tk="${recentlySubmittedTicketId}"]`, rootContainer!);
    if (freshCardEl && !prefersReducedMotion.matches) {
      gsap.fromTo(
        freshCardEl,
        {
          y: -24,
          scale: 0.96,
          opacity: 0,
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: motionDuration(0.7),
          ease: 'back.out(1.6)',
          clearProps: 'transform,opacity',
        }
      );
    }

    form.reset();
    const countEl = domQuery<HTMLElement>('[data-k="tk-count"]', rootContainer!);
    if (countEl) countEl.textContent = '0 / 1200';

    showToast(`${ticketNumber} sent — we’ll reply within three working hours`, {
      ico: 'send',
    });

    setTimeout(() => {
      recentlySubmittedTicketId = '';
      freshCardEl?.classList.remove('is-fresh');
    }, 2400);
  });

  const searchInput = domQuery<HTMLInputElement>('[data-k="tk-q"]', rootContainer);
  searchInput.addEventListener('input', (evt) => {
    searchQuery = (evt.target as HTMLInputElement).value;
    filterAndRenderTicketsList(true);
  });

  const filterContainer = domQuery<HTMLElement>('[data-k="tk-filter"]', rootContainer);
  filterContainer.addEventListener('click', (evt) => {
    const chipBtn = (evt.target as HTMLElement).closest<HTMLElement>('[data-tf]');
    if (chipBtn) {
      playHaptic(chipBtn);
      filterStatus = chipBtn.dataset.tf!;
      domQueryAll('[data-tf]', rootContainer!).forEach((btn) =>
        btn.setAttribute('aria-pressed', String(btn === chipBtn))
      );
      filterAndRenderTicketsList(true);
    }
  });

  rootContainer.addEventListener('click', (evt) => {
    const target = evt.target as HTMLElement;
    const ticketHead = target.closest<HTMLElement>('.hp-ticket__head');
    if (ticketHead) {
      toggleTicketItem(ticketHead.closest<HTMLElement>('.hp-ticket')!);
      return;
    }

    const actionBtn = target.closest<HTMLElement>('[data-solve], [data-reopen]');
    if (actionBtn) {
      playHaptic(actionBtn);
      const ticketId = actionBtn.dataset.solve ?? actionBtn.dataset.reopen;
      const ticket = store.tickets.find((t: any) => t.id === ticketId);
      if (!ticket) return;

      ticket.status = actionBtn.dataset.solve ? 'closed' : ticket.reply ? 'answered' : 'open';
      notifyStoreSubscribers('tickets');
      showToast(
        actionBtn.dataset.solve ? `${ticket.number} closed — glad it’s sorted` : `${ticket.number} reopened`,
        {
          ico: actionBtn.dataset.solve ? 'check' : 'refresh',
        }
      );
      return;
    }

    if (target.closest('[data-k="tk-clear"]')) {
      searchQuery = '';
      filterStatus = 'all';
      searchInput.value = '';
      domQueryAll('[data-tf]', rootContainer!).forEach((btn) =>
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-tf') === 'all'))
      );
      filterAndRenderTicketsList(true);
    }
  });
}

export function animateTicketsEntry(subtabContainer: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(subtabContainer), 0)
    .add(
      animateCards(domQueryAll('.card', subtabContainer), {
        stagger: 0.1,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll('.hp-form .field, .hp-form__foot', subtabContainer), {
        y: 10,
        stagger: 0.05,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll('.hp-ticket, [data-tf]', subtabContainer), {
        y: 10,
        stagger: 0.04,
      }),
      0.35
    );

  const prefilled = getPrefilledTicketSubject();
  if (prefilled) {
    const subjectField = domQuery<HTMLInputElement>('[name="subject"]', subtabContainer);
    if (subjectField) {
      subjectField.value = prefilled.slice(0, 90);
      setTimeout(() => {
        if (matchMedia('(pointer: fine)').matches) {
          domQuery<HTMLTextAreaElement>('[name="body"]', subtabContainer)?.focus();
        }
      }, motionDuration(500));
    }
  }
}
