import { store, findMemberById } from '../../../core/store';
import {
  animateCounter,
  animateCards,
  animateRows,
  motionDuration,
  playHaptic,
  bindMagnetic,
  prefersReducedMotion,
  gsap,
} from '../../../core/motion';
import { ROLE_NAMES, ONE_DAY_MS, ROLE_PERMISSIONS } from '../../../core/constants';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import { formatDate, formatInt, pluralize } from '../../../utils/formatters';
import { renderIcon, renderIconButton, renderPill } from '../../../utils/icons';
import {
  renderPageHeader,
  renderTag,
  renderAvatar,
  renderFilterBar,
  renderEmptyState,
  highlightSearchMatch,
  showToast,
  removeTeammate,
  updateMemberRole,
  openInviteTeammateModal,
  openDrawer,
  bindModalDismiss,
  animatePageTransition,
} from '../../../main';
import { TeamMember, MemberRole } from '../../../types/settings';

const ROLES: MemberRole[] = ['owner', 'admin', 'manager', 'staff', 'viewer'];
const ASSIGNABLE_ROLES: MemberRole[] = ['admin', 'manager', 'staff', 'viewer'];

const STATUS_TONES: Record<string, [string, string]> = {
  active: ['sage', 'Active'],
  away: ['ochre', 'Away'],
  invited: ['sky', 'Invited'],
};

let searchQuery = '';
let activeRoleFilter = 'all';

export const getActiveMembersCount = (): number =>
  store.team.filter((m) => m.status !== 'invited').length;

export function renderTeamSubtab(): string {
  const activeCount = getActiveMembersCount();
  const seatsLeft = Math.max(0, store.settings.billing.seats - activeCount);

  return `${renderPageHeader({
    eyebrow: 'Who works in Vels and what they can do',
    title: 'Team & roles',
    actions: `<button type="button" class="btn btn--primary magnetic" data-k="tm-invite">${renderIcon('userPlus')}Invite teammate</button>`,
    stats: [
      {
        key: 'members',
        icon: 'users',
        label: 'Members',
        value: store.team.length,
        ico: 'pine',
      },
      {
        key: 'active',
        icon: 'check',
        label: 'Active today',
        value: store.team.filter((m) => m.status === 'active').length,
        ico: 'sage',
      },
      {
        key: 'invited',
        icon: 'send',
        label: 'Pending invites',
        value: store.team.filter((m) => m.status === 'invited').length,
        ico: 'sky',
      },
      {
        key: 'seats',
        icon: 'key',
        label: 'Seats left',
        value: seatsLeft,
        suffix: `of ${store.settings.billing.seats}`,
        ico: 'ochre',
      },
    ],
  })}
  <section class="card st-members tcard" aria-labelledby="tm-t">
    <header class="card__head"><div><h2 class="card__title" id="tm-t">Members</h2><p class="card__sub" data-k="tm-sub"></p></div>
      <div class="card__tools"><label class="search">${renderIcon('search')}<input type="search" placeholder="Search people…" aria-label="Search people" data-k="tm-q" /></label></div></header>
    <div class="toolbar"><div class="chips" data-k="tm-roles">${['all', ...ASSIGNABLE_ROLES].map((role) => `<button type="button" class="chip" data-role-f="${role}" aria-pressed="${role === activeRoleFilter}">${role === 'all' ? 'Everyone' : escapeHtml(ROLE_NAMES[role])} <b data-rn="${role}"></b></button>`).join('')}</div></div>
    <div class="table-wrap"><table class="table table--stack st-mtable" style="--areas:'t x' 's p' 'r r'">
      <thead><tr><th scope="col">Person</th><th scope="col">Works at</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col"><span class="sr">Actions</span></th></tr></thead>
      <tbody data-k="tm-rows"></tbody>
    </table></div>
  </section>
  <div class="st-grid st-grid--team">
    <section class="card st-perms tcard" aria-labelledby="tm-p-t">
      <header class="card__head"><div><h2 class="card__title" id="tm-p-t">What each role can do</h2><p class="card__sub">Roles are set per person above</p></div></header>
      <div class="table-wrap"><table class="table st-matrix">
        <thead><tr><th scope="col">Permission</th>${ROLES.map((role) => `<th scope="col" class="st-matrix__role" data-col="${role}">${escapeHtml(ROLE_NAMES[role])}<small data-rc="${role}"></small></th>`).join('')}</tr></thead>
        <tbody>${ROLE_PERMISSIONS.map((cat: any) => `<tr><th scope="row">${escapeHtml(cat.label)}</th>${ROLES.map((role) => `<td data-col="${role}">${cat.roles.includes(role) ? `<span class="st-yes" role="img" aria-label="${escapeHtml(ROLE_NAMES[role])} can"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" pathLength="1"/></svg></span>` : `<span class="st-no" role="img" aria-label="${escapeHtml(ROLE_NAMES[role])} cannot"></span>`}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </section>
    <section class="card st-seats" aria-labelledby="tm-s-t">
      <header class="card__head"><div><h2 class="card__title" id="tm-s-t">Seats</h2><p class="card__sub" data-k="tm-plan"></p></div></header>
      <div class="st-seats__fig"><b class="num" data-k="tm-used">0</b><span>of <b data-k="tm-cap"></b> seats in use</span></div>
      <span class="meter st-seats__meter"><span class="meter__fill" data-k="tm-meter" style="--c:var(--pine)"></span><span class="meter__fill st-seats__inv" data-k="tm-meter-inv" style="--c:var(--sky)"></span></span>
      <ul class="st-seats__key"><li><i class="dot" style="--c:var(--pine)"></i>Active and away</li><li><i class="dot" style="--c:var(--sky)"></i>Invited, not joined yet</li></ul>
      <p class="st-seats__note" data-k="tm-note"></p>
      <a class="btn btn--ghost btn--sm" href="/settings/billing">${renderIcon('card')}Change seats</a>
    </section>
  </div>`;
}

function renderMemberRow(member: TeamMember, query: string): string {
  const [tone, statusLabel] = STATUS_TONES[member.status] ?? ['slate', member.status];
  const isMe = member.id === 'm-okafor';
  const isOwner = member.role === 'owner';
  const location = store.locations.find((l) => l.id === member.locId);

  return `<tr class="is-link" data-key="${member.id}" data-open="${member.id}">
    <td class="a-t"><span class="cell-person">${renderAvatar(member.id, 'md')}<span><b>${highlightSearchMatch(member.name, query)}${isMe ? ' <span class="st-this">You</span>' : ''}</b><small>${highlightSearchMatch(member.title, query)} · ${highlightSearchMatch(member.email, query)}</small></span></span></td>
    <td class="a-s" data-label="Works at">${escapeHtml(location?.name ?? '')}</td>
    <td class="a-r"><select class="select st-role" data-role="${member.id}" aria-label="Role for ${escapeHtml(member.name)}" ${isMe || isOwner ? `disabled title="${isMe ? 'You can’t change your own role' : 'The owner’s role is fixed'}"` : ''}>${(isOwner ? ROLES : ASSIGNABLE_ROLES).map((role) => `<option value="${role}"${role === member.role ? ' selected' : ''}>${escapeHtml(ROLE_NAMES[role])}</option>`).join('')}</select></td>
    <td class="a-p">${renderPill(statusLabel, tone)}</td>
    <td class="a-x r">${member.status === 'invited' ? renderIconButton('send', `Resend invite to ${member.name}`, `data-resend="${member.id}"`, 'ibtn--sm') : ''}${isMe || isOwner ? '' : renderIconButton('trash', `Remove ${member.name}`, `data-remove="${member.id}"`, 'ibtn--sm')}</td>
  </tr>`;
}

export function updateMembersTable(container: HTMLElement, withDismiss = false): void {
  const query = searchQuery.trim().toLowerCase();

  ['all', ...ASSIGNABLE_ROLES].forEach((role) => {
    const chipCountEl = queryOne<HTMLElement>(`[data-rn="${role}"]`, container);
    if (chipCountEl) {
      chipCountEl.textContent = String(
        role === 'all' ? store.team.length : store.team.filter((m) => m.role === role).length
      );
    }
  });

  const filtered = store.team.filter(
    (m) =>
      (activeRoleFilter === 'all' || m.role === activeRoleFilter) &&
      (!query || `${m.name} ${m.title} ${m.email} ${m.team}`.toLowerCase().includes(query))
  );

  const rowsHtml = filtered.length
    ? filtered.map((m) => renderMemberRow(m, query)).join('')
    : `<tr><td colspan="5">${query || activeRoleFilter !== 'all' ? renderEmptyState(query ? `No one matches “${searchQuery.trim()}”` : `No ${ROLE_NAMES[activeRoleFilter]?.toLowerCase() ?? activeRoleFilter}s`, query ? 'Search by name, job title or email.' : 'Nobody holds this role yet — change one above or invite someone.', 'users', '<button type="button" class="btn btn--ghost btn--sm" data-k="tm-clear">Show everyone</button>') : renderEmptyState('Just you so far', 'Invite the people who pick, pack and make — they get an email with a link.', 'userPlus', '<button type="button" class="btn btn--primary btn--sm" data-k="tm-invite2">Invite teammate</button>')}</td></tr>`;

  const tbody = queryOne<HTMLElement>('[data-k="tm-rows"]', container);
  if (tbody) {
    if (withDismiss) {
      bindModalDismiss(tbody, () => {
        tbody.innerHTML = rowsHtml;
      });
    } else {
      tbody.innerHTML = rowsHtml;
    }
  }

  const subEl = queryOne<HTMLElement>('[data-k="tm-sub"]', container);
  if (subEl) {
    const sitesCount = new Set(store.team.map((m) => m.locId)).size;
    subEl.textContent = `${pluralize(store.team.length, 'person', 'people')} across ${pluralize(sitesCount, 'site')}`;
  }

  ROLES.forEach((role) => {
    const rcEl = queryOne<HTMLElement>(`[data-rc="${role}"]`, container);
    if (rcEl) {
      rcEl.textContent = String(store.team.filter((m) => m.role === role).length);
    }
  });
}

export function updateSeatsSection(container: HTMLElement, animate = false): void {
  const billing = store.settings.billing;
  const used = getActiveMembersCount();
  const invitedCount = store.team.filter((m) => m.status === 'invited').length;

  const usedEl = queryOne<HTMLElement>('[data-k="tm-used"]', container);
  if (usedEl) {
    animateCounter(usedEl, used, formatInt, {
      from: animate ? 0 : undefined,
      duration: 1,
      delay: animate ? 0.4 : 0,
    });
  }

  const capEl = queryOne<HTMLElement>('[data-k="tm-cap"]', container);
  if (capEl) capEl.textContent = String(billing.seats);

  const planEl = queryOne<HTMLElement>('[data-k="tm-plan"]', container);
  if (planEl) {
    planEl.textContent = `${billing.plan} plan · up to ${billing.seats} seats`;
  }

  const meterEl = queryOne<HTMLElement>('[data-k="tm-meter"]', container);
  if (meterEl) {
    gsap.to(meterEl, {
      scaleX: Math.min(1, used / billing.seats),
      duration: motionDuration(1),
      delay: motionDuration(animate ? 0.45 : 0),
      ease: 'power3.inOut',
    });
  }

  const meterInvEl = queryOne<HTMLElement>('[data-k="tm-meter-inv"]', container);
  if (meterInvEl) {
    gsap.to(meterInvEl, {
      scaleX: Math.min(1, (used + invitedCount) / billing.seats),
      duration: motionDuration(1),
      delay: motionDuration(animate ? 0.55 : 0),
      ease: 'power3.inOut',
    });
  }

  const freeSeats = billing.seats - used;
  const noteEl = queryOne<HTMLElement>('[data-k="tm-note"]', container);
  if (noteEl) {
    noteEl.innerHTML =
      freeSeats <= 0
        ? `${renderIcon('alert')}<span>Every seat is taken — add seats before the next invite.</span>`
        : freeSeats <= 2
          ? `${renderIcon('info')}<span><b>${pluralize(freeSeats, 'seat')}</b> left. Invites don’t use a seat until they join.</span>`
          : `${renderIcon('check')}<span><b>${pluralize(freeSeats, 'seat')}</b> free for new teammates.</span>`;
  }
}

export function updateTeamHeaderStats(container: HTMLElement): void {
  const updateStat = (key: string, val: number) => {
    const el = queryOne<HTMLElement>(`[data-stat="${key}"] b[data-count]`, container);
    if (el) renderFilterBar(el, val);
  };

  updateStat('members', store.team.length);
  updateStat('active', store.team.filter((m) => m.status === 'active').length);
  updateStat('invited', store.team.filter((m) => m.status === 'invited').length);
  updateStat('seats', Math.max(0, store.settings.billing.seats - getActiveMembersCount()));

  const suffixEl = queryOne<HTMLElement>('[data-stat="seats"] .stat__suffix', container);
  if (suffixEl) suffixEl.textContent = `of ${store.settings.billing.seats}`;
}

export function animateMatrixCheckmarks(container: HTMLElement, delay = 0): void {
  const checkmarks = domQueryAll('.st-yes path', container);
  if (prefersReducedMotion.matches) {
    gsap.set(checkmarks, { strokeDashoffset: 0 });
    return;
  }
  gsap.fromTo(
    checkmarks,
    { strokeDasharray: 1, strokeDashoffset: 1 },
    {
      strokeDashoffset: 0,
      duration: motionDuration(0.45),
      ease: 'power2.out',
      stagger: { each: motionDuration(0.025), from: 'start' },
      delay: motionDuration(delay),
    }
  );
}

const formatMemberTenure = (since: number): string => {
  const months = Math.floor((Date.now() - since) / (30.4 * ONE_DAY_MS));
  if (months < 1) return 'This month';
  if (months < 12) return `${pluralize(months, 'month')} on the team`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return `${pluralize(years, 'year')}${rem ? `, ${pluralize(rem, 'month')}` : ''} on the team`;
};

export function openMemberDrawer(memberId: string): void {
  const member = findMemberById(memberId);
  if (!member) {
    history.replaceState(null, '', '/settings/team');
    return;
  }

  const [tone, statusLabel] = STATUS_TONES[member.status] ?? ['slate', member.status];
  const isMe = member.id === 'm-okafor';
  const location = store.locations.find((l) => l.id === member.locId);

  openDrawer(
    `<div class="d-head">${renderAvatar(member.id, 'lg')}<div><h2>${escapeHtml(member.name)}</h2><small>${escapeHtml(member.title)} · ${escapeHtml(member.team)}</small></div></div>
    <div class="d-pills">${renderPill(statusLabel, tone)}${renderPill(ROLE_NAMES[member.role], 'pine', 'shield')}</div>
    <div class="d-facts"><div><small>Works at</small><b>${escapeHtml(location?.name ?? '')}</b><span>${escapeHtml(location?.city ?? '')}</span></div><div><small>${member.status === 'invited' ? 'Invited' : 'Joined'}</small><b>${formatDate(member.since, true)}</b><span>${formatMemberTenure(member.since)}</span></div></div>
    <div class="d-sec"><h3>Contact</h3><div class="rows"><a class="row" href="mailto:${escapeHtml(member.email)}">${renderTag('mail', 'sky', 'sm')}<span class="row__txt"><b>${escapeHtml(member.email)}</b><small>Email</small></span></a>${member.phone ? `<a class="row" href="tel:${escapeHtml(member.phone)}">${renderTag('phone', 'teal', 'sm')}<span class="row__txt"><b>${escapeHtml(member.phone)}</b><small>Phone</small></span></a>` : ''}</div></div>
    <div class="d-sec"><h3>As ${escapeHtml(ROLE_NAMES[member.role].toLowerCase())}, ${isMe ? 'you' : member.name.split(' ')[0]} can</h3><ul class="st-can">${ROLE_PERMISSIONS.map((cat: any) => `<li class="${cat.roles.includes(member.role) ? 'is-yes' : ''}">${renderIcon(cat.roles.includes(member.role) ? 'check' : 'close')}${escapeHtml(cat.label)}</li>`).join('')}</ul></div>
    <div class="d-actions"><a class="btn btn--ghost" href="mailto:${escapeHtml(member.email)}">${renderIcon('mail')}Email</a>${isMe || member.role === 'owner' ? '' : `<button type="button" class="btn btn--ghost" data-d-remove="${member.id}">${renderIcon('trash')}Remove</button>`}</div>`,
    {
      label: member.name,
      onClose: () => {
        if (location?.id && window.location.pathname.startsWith('/settings/team/')) {
          history.replaceState(null, '', '/settings/team');
        }
      },
      onMount: (drawerEl) => {
        drawerEl.querySelector<HTMLElement>('[data-d-remove]')?.addEventListener('click', () => {
          removeTeammate(member.id);
        });
        animateRows(domQueryAll('.st-can li', drawerEl), {
          x: 8,
          y: 0,
          stagger: 0.03,
          delay: 0.2,
        });
      },
    }
  );
}

export function initTeamSubtab(container: HTMLElement): void {
  bindMagnetic(container);

  queryOne<HTMLElement>('[data-k="tm-invite"]', container)?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    playHaptic(target);
    openInviteTeammateModal(target);
  });

  const searchInput = queryOne<HTMLInputElement>('[data-k="tm-q"]', container);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      updateMembersTable(container, true);
    });
  }

  queryOne<HTMLElement>('[data-k="tm-roles"]', container)?.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-role-f]');
    if (chip) {
      playHaptic(chip);
      activeRoleFilter = chip.dataset.roleF ?? 'all';
      domQueryAll('[data-role-f]', container).forEach((c) =>
        c.setAttribute('aria-pressed', String(c === chip))
      );
      updateMembersTable(container, true);
    }
  });

  container.addEventListener('change', (e) => {
    const select = (e.target as HTMLElement).closest<HTMLSelectElement>('[data-role]');
    if (select) {
      updateMemberRole(select.dataset.role as string, select.value);
    }
  });

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const removeBtn = target.closest<HTMLElement>('[data-remove]');
    if (removeBtn) {
      playHaptic(removeBtn);
      removeTeammate(removeBtn.dataset.remove as string);
      return;
    }

    const resendBtn = target.closest<HTMLElement>('[data-resend]');
    if (resendBtn) {
      playHaptic(resendBtn);
      const m = findMemberById(resendBtn.dataset.resend as string);
      showToast(`Invite sent again to ${m?.email ?? ''}`, { ico: 'send' });
      return;
    }

    if (target.closest('[data-k="tm-clear"]')) {
      searchQuery = '';
      activeRoleFilter = 'all';
      if (searchInput) searchInput.value = '';
      domQueryAll('[data-role-f]', container).forEach((c) =>
        c.setAttribute('aria-pressed', String(c.getAttribute('data-role-f') === 'all'))
      );
      updateMembersTable(container, true);
      return;
    }

    const invite2Btn = target.closest<HTMLElement>('[data-k="tm-invite2"]');
    if (invite2Btn) {
      openInviteTeammateModal(invite2Btn);
      return;
    }

    const openRow = target.closest<HTMLElement>('[data-open]');
    if (openRow && !target.closest('select, button, a')) {
      (window as any).navigateTo(`/settings/team/${openRow.dataset.open}`);
    }
  });

  // Matrix column hover highlight
  const matrix = domQuery('.st-matrix', container);
  if (matrix) {
    matrix.addEventListener('pointerover', (e) => {
      const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-col]');
      domQueryAll('[data-col]', matrix).forEach((el) =>
        el.classList.toggle('is-col', !!cell && (el as HTMLElement).dataset.col === cell.dataset.col)
      );
    });
    matrix.addEventListener('pointerleave', () =>
      domQueryAll('[data-col]', matrix).forEach((el) => el.classList.remove('is-col'))
    );
  }
}

export function animateTeamSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.08 }), 0.15)
    .add(animateRows(domQueryAll('.st-mtable tbody tr', container), { y: 10, stagger: 0.035 }), 0.35)
    .add(animateRows(domQueryAll('[data-role-f]', container), { y: -6, stagger: 0.04 }), 0.3);

  animateMatrixCheckmarks(container, 0.6);
  updateSeatsSection(container, true);
}
