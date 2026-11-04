import { store } from '../../../core/store';
import {
  playHaptic,
  bindMagnetic,
  prefersReducedMotion,
  motionDuration,
  animatePop,
  animateRows,
  animateCards,
  initLiftAnimations,
  Flip,
  gsap,
} from '../../../core/motion';
import { domQuery, domQueryAll, queryOne, escapeHtml } from '../../../utils/dom';
import { renderIcon } from '../../../utils/icons';
import { pluralize } from '../../../utils/formatters';
import {
  renderTag,
  renderEmptyState,
  highlightSearchMatch,
  bindModalDismiss,
  animatePageTransition,
  animateWobble,
} from '../../../main';
import { FAQ_TOPICS, FAQ_ARTICLES, ExtendedFaqArticle } from '../data/faq-data';

let rootContainer: HTMLElement | null = null;
let activeTopic = 'all';
let searchQuery = '';
const expandedFaqIds = new Set<string>();
let prefilledTicketSubject = '';

export function getPrefilledTicketSubject(): string {
  const subject = prefilledTicketSubject;
  prefilledTicketSubject = '';
  return subject;
}

export function setPrefilledTicketSubject(subject: string): void {
  prefilledTicketSubject = subject;
}

export function renderHelpCenterTemplate(): string {
  return `<section class="hp-hero" aria-labelledby="hp-hero-t">
    <div class="hp-hero__txt">
      <p class="head__eyebrow">Help center</p>
      <h1 class="head__title" id="hp-hero-t" tabindex="-1">How can we help?</h1>
      <p class="hp-hero__sub">Answers about batches, stock, orders and the team — written by the people who run Vels.</p>
    </div>
    <label class="hp-search">
      ${renderIcon('search')}
      <input type="search" placeholder="Search the help center…" aria-label="Search the help center" aria-controls="hp-faq" data-k="hp-q" autocomplete="off" />
      <kbd data-k="hp-n"></kbd>
    </label>
    <div class="hp-popular">
      <span>Popular:</span>
      ${['expiry', 'transfer', 'count', 'return', 'shortcuts']
        .map((term) => `<button type="button" class="chip" data-pop="${term}">${escapeHtml(term)}</button>`)
        .join('')}
    </div>
  </section>
  <div class="hp-cats" role="group" aria-label="Topic" data-k="hp-cats">
    ${Object.keys(FAQ_TOPICS)
      .map((catKey) => {
        const topic = FAQ_TOPICS[catKey];
        const count = FAQ_ARTICLES.filter((a) => a.cat === catKey).length;
        return `<button type="button" class="hp-cat" data-cat="${catKey}" aria-pressed="false" style="--c:var(--${topic.tone})">
          ${renderTag(topic.icon, topic.tone)}
          <span><b>${escapeHtml(topic.name)}</b><small>${escapeHtml(topic.text)}</small></span>
          <em class="num">${count}</em>
        </button>`;
      })
      .join('')}
  </div>
  <div class="hp-grid">
    <section class="card hp-faq" aria-labelledby="hp-faq-t">
      <header class="card__head">
        <div>
          <h2 class="card__title" id="hp-faq-t">Questions and answers</h2>
          <p class="card__sub" data-k="hp-sub"></p>
        </div>
        <div class="card__tools">
          <button type="button" class="btn btn--ghost btn--sm" data-k="hp-all" hidden>${renderIcon('close')}Clear</button>
        </div>
      </header>
      <div class="hp-list" id="hp-faq" data-k="hp-list"></div>
    </section>
    <aside class="hp-side">
      <section class="card hp-stuck" aria-labelledby="hp-st-t">
        ${renderTag('chat', 'pine')}
        <h2 class="card__title" id="hp-st-t">Still stuck?</h2>
        <p>Write to the Vels team. A person — not a bot — replies, usually within three working hours.</p>
        <ul class="hp-stuck__facts">
          <li>${renderIcon('clock')}Mon–Fri, 8 am–6 pm Eastern</li>
          <li>${renderIcon('chat')}<span data-k="hp-open"></span></li>
        </ul>
        <a class="btn btn--primary magnetic" href="#/help/tickets" data-k="hp-ask">${renderIcon('send')}Open a ticket</a>
      </section>
      <section class="card hp-keys" aria-labelledby="hp-k-t">
        <header class="card__head">
          <h2 class="card__title" id="hp-k-t">Quick keys</h2>
        </header>
        <dl class="keys">${[
          [['⌘', 'K'], 'Search'],
          [['g', 'd'], 'Dashboard'],
          [['n'], 'New order'],
          [['?'], 'All shortcuts'],
        ]
          .map(
            ([keys, desc]) =>
              `<div><dt>${escapeHtml(desc as string)}</dt><dd>${(keys as string[]).map((k) => `<kbd>${escapeHtml(k)}</kbd>`).join('')}</dd></div>`
          )
          .join('')}</dl>
      </section>
    </aside>
  </div>`;
}

export function renderFaqItemHtml(article: ExtendedFaqArticle, query: string): string {
  const isOpen =
    expandedFaqIds.has(article.id) ||
    (query.length >= 3 && article.a.toLowerCase().includes(query) && !article.q.toLowerCase().includes(query));

  const topic = FAQ_TOPICS[article.cat];

  return `<div class="hp-item${isOpen ? ' is-open' : ''}" data-key="${article.id}" data-faq="${article.id}">
    <h3>
      <button type="button" class="hp-q" aria-expanded="${isOpen}" aria-controls="ans-${article.id}" id="q-${article.id}">
        ${renderTag(topic.icon, topic.tone, 'sm')}
        <span>${highlightSearchMatch(article.q, query)}</span>
        <i class="hp-q__chev">${renderIcon('down')}</i>
      </button>
    </h3>
    <div class="hp-a" id="ans-${article.id}" role="region" aria-labelledby="q-${article.id}" ${isOpen ? '' : 'hidden'}>
      <div class="hp-a__in">
        <p>${highlightSearchMatch(article.a, query)}</p>
        ${
          article.keys
            ? `<dl class="keys hp-a__keys">${article.keys
                .map(
                  ([keys, desc]) =>
                    `<div><dt>${escapeHtml(desc)}</dt><dd>${keys.map((k) => `<kbd>${escapeHtml(k)}</kbd>`).join('')}</dd></div>`
                )
                .join('')}</dl>`
            : ''
        }
        <div class="hp-a__foot">
          ${article.link ? `<a class="btn btn--soft btn--xs" href="${article.link[0]}">${escapeHtml(article.link[1])}${renderIcon('chevR')}</a>` : ''}
          <span class="hp-a__cat">${escapeHtml(topic.name)}</span>
          <span class="hp-help" data-k="hp-vote-${article.id}">
            <span>Did this help?</span>
            <button type="button" class="btn btn--ghost btn--xs" data-vote="yes:${article.id}">Yes</button>
            <button type="button" class="btn btn--ghost btn--xs" data-vote="no:${article.id}">No</button>
          </span>
        </div>
      </div>
    </div>
  </div>`;
}

export function filterAndRenderFaqList(animate: boolean): void {
  if (!rootContainer) return;
  const trimmed = searchQuery.trim().toLowerCase();
  const matchedArticles = FAQ_ARTICLES.filter(
    (article) =>
      (activeTopic === 'all' || article.cat === activeTopic) &&
      (!trimmed ||
        `${article.q} ${article.a} ${FAQ_TOPICS[article.cat].name} ${article.keys?.map((k) => k[1]).join(' ') ?? ''}`
          .toLowerCase()
          .includes(trimmed))
  );

  const listEl = domQuery<HTMLElement>('[data-k="hp-list"]', rootContainer);
  const contentHtml = matchedArticles.length
    ? matchedArticles.map((a) => renderFaqItemHtml(a, trimmed)).join('')
    : renderEmptyState(
        trimmed ? `Nothing about “${searchQuery.trim()}” yet` : 'No answers here',
        trimmed
          ? 'Try another word — “lot”, “stock”, “ship” — or ask the team, who reply within a working day.'
          : 'This topic has no answers yet.',
        'search',
        '<span class="hp-empty__acts"><button type="button" class="btn btn--ghost btn--sm" data-k="hp-clear">Clear search</button><a class="btn btn--primary btn--sm" href="#/help/tickets" data-k="hp-ask2">' +
          renderIcon('send') +
          'Ask the team</a></span>'
      );

  if (animate) {
    bindModalDismiss(listEl, () => {
      listEl.innerHTML = contentHtml;
    });
  } else {
    listEl.innerHTML = contentHtml;
  }

  const subEl = domQuery<HTMLElement>('[data-k="hp-sub"]', rootContainer);
  if (subEl) {
    subEl.textContent =
      trimmed || activeTopic !== 'all'
        ? `${pluralize(matchedArticles.length, 'answer')}${activeTopic === 'all' ? '' : ` in ${FAQ_TOPICS[activeTopic].name}`}${trimmed ? ` matching “${searchQuery.trim()}”` : ''}`
        : `${pluralize(FAQ_ARTICLES.length, 'answer')} across ${Object.keys(FAQ_TOPICS).length} topics`;
  }

  const countBadgeEl = domQuery<HTMLElement>('[data-k="hp-n"]', rootContainer);
  if (countBadgeEl) {
    countBadgeEl.textContent = trimmed ? String(matchedArticles.length) : '/';
  }

  const clearBtn = domQuery<HTMLElement>('[data-k="hp-all"]', rootContainer);
  if (clearBtn) {
    clearBtn.hidden = !trimmed && activeTopic === 'all';
  }

  domQueryAll('[data-cat]', rootContainer).forEach((btn) =>
    btn.setAttribute('aria-pressed', String(btn.dataset.cat === activeTopic))
  );
}

export function toggleFaqItem(itemEl: HTMLElement, forceOpen?: boolean): void {
  const faqId = itemEl.dataset.faq;
  if (!faqId) return;

  const btn = domQuery<HTMLElement>('.hp-q', itemEl);
  const answerRegion = domQuery<HTMLElement>('.hp-a', itemEl);
  const shouldOpen = forceOpen ?? btn.getAttribute('aria-expanded') !== 'true';

  if (shouldOpen === (btn.getAttribute('aria-expanded') === 'true')) {
    return;
  }

  const nextSiblings: Element[] = [];
  for (let sibling = itemEl.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
    nextSiblings.push(sibling);
  }
  const flipState = Flip.getState(nextSiblings);

  const applyToggleState = () => {
    btn.setAttribute('aria-expanded', String(shouldOpen));
    itemEl.classList.toggle('is-open', shouldOpen);
    answerRegion.hidden = !shouldOpen;
    if (shouldOpen) {
      expandedFaqIds.add(faqId);
    } else {
      expandedFaqIds.delete(faqId);
    }
    if (!prefersReducedMotion.matches) {
      Flip.from(flipState, {
        duration: motionDuration(0.45),
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
    }
  };

  const answerInner = domQuery<HTMLElement>('.hp-a__in', itemEl);
  gsap.killTweensOf(answerInner);
  gsap.to(domQuery('.hp-q__chev', itemEl), {
    rotation: shouldOpen ? 180 : 0,
    duration: motionDuration(0.4),
    ease: 'back.out(2)',
  });

  if (shouldOpen) {
    applyToggleState();
    gsap.fromTo(
      answerInner,
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
  } else {
    gsap.to(answerInner, {
      opacity: 0,
      y: -6,
      duration: motionDuration(0.16),
      ease: 'power2.in',
      onComplete: () => {
        applyToggleState();
        gsap.set(answerInner, {
          clearProps: 'opacity,transform',
        });
      },
    });
  }

  if (shouldOpen && location.hash !== `#/help/center/${faqId}`) {
    history.replaceState(null, '', `#/help/center/${faqId}`);
  } else if (!shouldOpen && location.hash === `#/help/center/${faqId}`) {
    history.replaceState(null, '', '#/help/center');
  }
}

export function openFaqItemById(articleId: string): void {
  if (!rootContainer) return;
  let targetEl = queryOne<HTMLElement>(`[data-faq="${CSS.escape(articleId)}"]`, rootContainer);
  if (!targetEl) {
    if (!FAQ_ARTICLES.some((a) => a.id === articleId)) {
      history.replaceState(null, '', '#/help/center');
      return;
    }
    searchQuery = '';
    activeTopic = 'all';
    const searchInput = domQuery<HTMLInputElement>('[data-k="hp-q"]', rootContainer);
    if (searchInput) searchInput.value = '';
    filterAndRenderFaqList(false);
    targetEl = queryOne<HTMLElement>(`[data-faq="${CSS.escape(articleId)}"]`, rootContainer);
    if (!targetEl) return;
  }

  toggleFaqItem(targetEl, true);
  setTimeout(
    () =>
      targetEl!.scrollIntoView({
        block: 'center',
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      }),
    motionDuration(200)
  );
  animatePop(domQuery('.hp-q .tile', targetEl), {
    from: 0.7,
    delay: 0.2,
  });
}

export function updateOpenTicketsStatus(): void {
  if (!rootContainer) return;
  const openCount = store.tickets.filter((t: any) => t.status === 'open').length;
  const answeredCount = store.tickets.filter((t: any) => t.status === 'answered').length;
  const factSpan = queryOne<HTMLElement>('[data-k="hp-open"]', rootContainer);
  if (factSpan) {
    factSpan.innerHTML = openCount
      ? `<a href="#/help/tickets">${pluralize(openCount, 'ticket')} waiting on the team</a>`
      : answeredCount
        ? `<a href="#/help/tickets">${pluralize(answeredCount, 'reply', 'replies')} to read in your tickets</a>`
        : 'You have no open tickets';
  }
}

export function initHelpCenterView(subtabContainer: HTMLElement): void {
  rootContainer = subtabContainer;
  rootContainer.innerHTML = renderHelpCenterTemplate();
  bindMagnetic(rootContainer);

  const searchInput = domQuery<HTMLInputElement>('[data-k="hp-q"]', rootContainer);
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    filterAndRenderFaqList(true);
  });

  searchInput.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && searchInput.value) {
      evt.stopPropagation();
      searchInput.value = '';
      searchQuery = '';
      filterAndRenderFaqList(true);
    }
  });

  rootContainer.addEventListener('click', (evt) => {
    const target = evt.target as HTMLElement;
    const qButton = target.closest<HTMLElement>('.hp-q');
    if (qButton) {
      toggleFaqItem(qButton.closest<HTMLElement>('.hp-item')!);
      return;
    }

    const catButton = target.closest<HTMLElement>('[data-cat]');
    if (catButton) {
      playHaptic(catButton);
      activeTopic = activeTopic === catButton.dataset.cat ? 'all' : catButton.dataset.cat!;
      filterAndRenderFaqList(true);
      return;
    }

    const popChip = target.closest<HTMLElement>('[data-pop]');
    if (popChip) {
      playHaptic(popChip);
      searchInput.value = popChip.dataset.pop!;
      searchQuery = searchInput.value;
      activeTopic = 'all';
      filterAndRenderFaqList(true);
      searchInput.focus();
      return;
    }

    if (target.closest('[data-k="hp-clear"], [data-k="hp-all"]')) {
      searchInput.value = '';
      searchQuery = '';
      activeTopic = 'all';
      filterAndRenderFaqList(true);
      return;
    }

    if (target.closest('[data-k="hp-ask2"]')) {
      prefilledTicketSubject = searchQuery.trim();
    }

    const voteBtn = target.closest<HTMLElement>('[data-vote]');
    if (voteBtn) {
      const [voteType, articleId] = voteBtn.dataset.vote!.split(':');
      const voteContainer = queryOne<HTMLElement>(`[data-k="hp-vote-${articleId}"]`, rootContainer!);
      if (voteContainer) {
        voteContainer.innerHTML =
          voteType === 'yes'
            ? `<span class="hp-help__done">${renderIcon('check')}Thanks — glad it helped</span>`
            : '<span class="hp-help__done">Sorry about that. <a href="#/help/tickets" data-ask-about="' +
              articleId +
              '">Ask the team</a></span>';
        animatePop(voteContainer.firstElementChild as HTMLElement, {
          from: 0.8,
        });
      }
      return;
    }

    const askAboutLink = target.closest<HTMLElement>('[data-ask-about]');
    if (askAboutLink) {
      const art = FAQ_ARTICLES.find((a) => a.id === askAboutLink.dataset.askAbout);
      prefilledTicketSubject = art?.q ?? '';
    }
  });
}

export function animateHelpCenterEntry(subtabContainer: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(subtabContainer), 0)
    .fromTo(
      domQuery('.hp-hero', subtabContainer),
      {
        opacity: 0,
        y: 20,
        scale: 0.99,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: motionDuration(0.8),
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      },
      0
    )
    .add(
      animateRows(domQueryAll('.hp-hero__sub, .hp-search, .hp-popular > *', subtabContainer), {
        y: 10,
        stagger: 0.04,
      }),
      0.15
    )
    .add(
      animateWobble(domQueryAll('.hp-cat', subtabContainer), {
        stagger: 0.05,
      }),
      0.2
    )
    .add(
      animateCards(domQueryAll('.card', subtabContainer), {
        stagger: 0.08,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll('.hp-item', subtabContainer).slice(0, 12), {
        y: 10,
        stagger: 0.035,
      }),
      0.45
    );

  initLiftAnimations(subtabContainer);
  updateOpenTicketsStatus();
}
