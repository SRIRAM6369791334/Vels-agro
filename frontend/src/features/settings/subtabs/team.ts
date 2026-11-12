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
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  SystemRole,
  SystemPermission,
} from '../../../core/api/roleService';
import { openModal, closeModal, confirmDialog as confirmModal } from '../../../ui/modal';

const ROLES: MemberRole[] = ['owner', 'admin', 'manager', 'staff', 'viewer'];
const ASSIGNABLE_ROLES: MemberRole[] = ['admin', 'manager', 'staff', 'viewer'];

const STATUS_TONES: Record<string, [string, string]> = {
  active: ['sage', 'Active'],
  away: ['ochre', 'Away'],
  invited: ['sky', 'Invited'],
};

let searchQuery = '';
let activeRoleFilter = 'all';

// Live Matrix State (MySQL backed)
let liveRoles: SystemRole[] = [];
let livePermissions: SystemPermission[] = [];
let initialRolePerms: Map<number, Set<number>> = new Map();
let currentRolePerms: Map<number, Set<number>> = new Map();

const MODULE_TITLES: Record<string, string> = {
  products: 'Products & Inventory',
  orders: 'Sales Orders & Fulfillment',
  customers: 'Customer Directory & Accounts',
  warehouses: 'Warehouses & Facility Transfers',
  purchasing: 'Purchasing & Raw Materials',
  analytics: 'Executive Analytics & KPI Metrics',
  audit: 'Security & System Audit Logs',
};

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
      <header class="card__head">
        <div>
          <h2 class="card__title" id="tm-p-t">What each role can do</h2>
          <p class="card__sub">Dynamic role capabilities and permission matrix backed by MySQL</p>
        </div>
        <div class="card__tools" style="display:flex; align-items:center; gap:8px;">
          <span class="st-dirty" data-k="tm-matrix-dirty" hidden style="margin-right:4px;">${renderIcon('edit')}Unsaved matrix changes</span>
          <button type="button" class="btn btn--ghost btn--sm magnetic" data-k="tm-new-role">${renderIcon('userPlus')}New Role</button>
          <button type="button" class="btn btn--primary btn--sm magnetic" data-k="tm-save-matrix" disabled>${renderIcon('check')}Save permissions</button>
        </div>
      </header>
      <div class="table-wrap">
        <table class="table st-matrix" data-k="tm-matrix-table">
          <tbody data-k="tm-matrix-body">
            <tr><td colspan="6" style="text-align:center; padding:28px; color:var(--muted);">Loading live permissions matrix from database...</td></tr>
          </tbody>
        </table>
      </div>
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
    <div class="d-pills">${renderPill(statusLabel, tone)}${renderPill(ROLE_NAMES[member.role] || member.role, 'pine', 'shield')}</div>
    <div class="d-facts"><div><small>Works at</small><b>${escapeHtml(location?.name ?? '')}</b><span>${escapeHtml(location?.city ?? '')}</span></div><div><small>${member.status === 'invited' ? 'Invited' : 'Joined'}</small><b>${formatDate(member.since, true)}</b><span>${formatMemberTenure(member.since)}</span></div></div>
    <div class="d-sec"><h3>Contact</h3><div class="rows"><a class="row" href="mailto:${escapeHtml(member.email)}">${renderTag('mail', 'sky', 'sm')}<span class="row__txt"><b>${escapeHtml(member.email)}</b><small>Email</small></span></a>${member.phone ? `<a class="row" href="tel:${escapeHtml(member.phone)}">${renderTag('phone', 'teal', 'sm')}<span class="row__txt"><b>${escapeHtml(member.phone)}</b><small>Phone</small></span></a>` : ''}</div></div>
    <div class="d-sec"><h3>Role Permissions</h3><ul class="st-can">${ROLE_PERMISSIONS.map((cat: any) => `<li class="${cat.roles.includes(member.role) ? 'is-yes' : ''}">${renderIcon(cat.roles.includes(member.role) ? 'check' : 'close')}${escapeHtml(cat.label)}</li>`).join('')}</ul></div>
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

// -------------------------------------------------------------
// Live Matrix Functions (Backed by MySQL /api/v1/admin/roles)
// -------------------------------------------------------------

function checkMatrixDirty(container: HTMLElement): void {
  let isDirty = false;
  for (const role of liveRoles) {
    const initSet = initialRolePerms.get(role.id) || new Set();
    const currSet = currentRolePerms.get(role.id) || new Set();
    if (initSet.size !== currSet.size) {
      isDirty = true;
      break;
    }
    for (const pid of currSet) {
      if (!initSet.has(pid)) {
        isDirty = true;
        break;
      }
    }
    if (isDirty) break;
  }

  const saveBtn = queryOne<HTMLButtonElement>('[data-k="tm-save-matrix"]', container);
  const dirtyBadge = queryOne<HTMLElement>('[data-k="tm-matrix-dirty"]', container);
  if (saveBtn) saveBtn.disabled = !isDirty;
  if (dirtyBadge) dirtyBadge.hidden = !isDirty;
}

function renderMatrixTable(container: HTMLElement): void {
  const table = queryOne<HTMLElement>('[data-k="tm-matrix-table"]', container);
  if (!table) return;

  if (liveRoles.length === 0 || livePermissions.length === 0) {
    table.innerHTML = `<tbody><tr><td style="text-align:center; padding:24px; color:var(--muted);">No roles found in database.</td></tr></tbody>`;
    return;
  }

  // 1. Build Header
  const headerColsHtml = liveRoles
    .map(
      (role) => `
      <th scope="col" class="st-matrix__role" data-col="r-${role.id}">
        <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
          <span>${escapeHtml(role.name)}</span>
          ${
            !role.is_system
              ? `<button type="button" class="ibtn ibtn--xs st-role-del-btn" data-del-role="${role.id}" data-role-name="${escapeHtml(role.name)}" title="Delete custom role ${escapeHtml(role.name)}">${renderIcon('trash')}</button>`
              : ''
          }
        </div>
        <small>${role.is_system ? 'System Role' : 'Custom Role'}</small>
      </th>
    `
    )
    .join('');

  const theadHtml = `
    <thead>
      <tr>
        <th scope="col" style="min-width: 220px; text-align: left;">Permission / Capability</th>
        ${headerColsHtml}
      </tr>
    </thead>
  `;

  // 2. Group permissions by module
  const moduleMap: Record<string, SystemPermission[]> = {};
  livePermissions.forEach((p) => {
    if (!moduleMap[p.module]) moduleMap[p.module] = [];
    moduleMap[p.module].push(p);
  });

  // 3. Build Body Rows
  const tbodyRows: string[] = [];

  Object.entries(moduleMap).forEach(([mod, perms]) => {
    const modTitle = MODULE_TITLES[mod] || mod.toUpperCase();
    tbodyRows.push(`
      <tr class="st-matrix__mod-head">
        <th colspan="${liveRoles.length + 1}">${escapeHtml(modTitle)}</th>
      </tr>
    `);

    perms.forEach((perm) => {
      const roleCellsHtml = liveRoles
        .map((role) => {
          const isChecked = currentRolePerms.get(role.id)?.has(perm.id) ?? false;
          return `
          <td data-col="r-${role.id}">
            <label class="st-matrix-check" title="${escapeHtml(role.name)}: ${escapeHtml(perm.description)}">
              <input type="checkbox" class="st-perm-toggle" data-role-id="${role.id}" data-perm-id="${perm.id}" ${isChecked ? 'checked' : ''} />
            </label>
          </td>
        `;
        })
        .join('');

      tbodyRows.push(`
        <tr>
          <th scope="row">
            <b>${escapeHtml(perm.description || perm.code)}</b>
            <small style="display:block; font-size:var(--fs-2xs); color:var(--muted);">${escapeHtml(perm.code)}</small>
          </th>
          ${roleCellsHtml}
        </tr>
      `);
    });
  });

  table.innerHTML = `
    ${theadHtml}
    <tbody data-k="tm-matrix-body">
      ${tbodyRows.join('')}
    </tbody>
  `;

  checkMatrixDirty(container);
}

export async function loadLiveMatrix(container: HTMLElement): Promise<void> {
  try {
    const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
    liveRoles = rolesData;
    livePermissions = permsData.list || [];

    initialRolePerms = new Map();
    currentRolePerms = new Map();

    liveRoles.forEach((role) => {
      const permIds = new Set<number>((role.permissions || []).map((p) => p.id));
      initialRolePerms.set(role.id, new Set(permIds));
      currentRolePerms.set(role.id, new Set(permIds));
    });

    renderMatrixTable(container);
  } catch (err) {
    console.warn('Failed to load live roles matrix from backend:', err);
    const tbody = queryOne<HTMLElement>('[data-k="tm-matrix-body"]', container);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--bad);">Failed to load roles from backend. Please verify your connection.</td></tr>`;
    }
  }
}

function openCreateRoleModal(container: HTMLElement): void {
  // Render permissions checklist grouped by module for modal
  const moduleMap: Record<string, SystemPermission[]> = {};
  livePermissions.forEach((p) => {
    if (!moduleMap[p.module]) moduleMap[p.module] = [];
    moduleMap[p.module].push(p);
  });

  const permsChecklistHtml = Object.entries(moduleMap)
    .map(
      ([mod, perms]) => `
      <div style="margin-bottom: 12px;">
        <b style="font-size: var(--fs-xs); text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 6px;">${escapeHtml(MODULE_TITLES[mod] || mod)}</b>
        <div class="st-perm-modal-grid">
          ${perms
            .map(
              (p) => `
            <label class="st-perm-modal-item">
              <input type="checkbox" name="role_perms" value="${p.id}" />
              <span><b>${escapeHtml(p.description || p.code)}</b><small style="display:block; color:var(--muted); font-size:var(--fs-2xs);">${escapeHtml(p.code)}</small></span>
            </label>
          `
            )
            .join('')}
        </div>
      </div>
    `
    )
    .join('');

  const modalHtml = `
    <form id="create-role-form" style="display: grid; gap: 14px;">
      <label class="st-field">
        <span class="field__label">Role Name *</span>
        <input class="st-in" name="name" type="text" placeholder="e.g. Quality Auditor" required autofocus />
      </label>
      <label class="st-field">
        <span class="field__label">Description</span>
        <input class="st-in" name="description" type="text" placeholder="Short description of responsibilities" />
      </label>
      <div class="st-field">
        <span class="field__label">Assign Initial Permissions</span>
        <div style="border: 1px solid var(--line-2); border-radius: 12px; padding: 12px; background: var(--surface);">
          ${permsChecklistHtml}
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
        <button type="button" class="btn btn--ghost btn--sm" data-action="cancel">Cancel</button>
        <button type="submit" class="btn btn--primary btn--sm" data-action="submit">${renderIcon('check')}Create Role</button>
      </div>
    </form>
  `;

  openModal(modalHtml, {
    title: 'Create New Custom Role',
    sub: 'Define a new role and configure its system privileges in MySQL',
    onMount: (dialog) => {
      dialog.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
        closeModal();
      });

      const form = dialog.querySelector<HTMLFormElement>('#create-role-form');
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        const descInput = form.elements.namedItem('description') as HTMLInputElement;
        const nameVal = nameInput.value.trim();
        const descVal = descInput.value.trim();

        if (nameVal.length < 2) {
          alert('Role name must be at least 2 characters long.');
          nameInput.focus();
          return;
        }

        const checkedPerms = Array.from(
          form.querySelectorAll<HTMLInputElement>('input[name="role_perms"]:checked')
        ).map((cb) => Number(cb.value));

        const submitBtn = dialog.querySelector<HTMLButtonElement>('[data-action="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Creating...</span>`;
        }

        try {
          await createRole({
            name: nameVal,
            description: descVal || undefined,
            permission_ids: checkedPerms,
          });
          closeModal();
          showToast(`Role "${nameVal}" created successfully in MySQL`, { ico: 'check' });
          await loadLiveMatrix(container);
        } catch (err: any) {
          alert(err?.message || 'Failed to create role');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `${renderIcon('check')}Create Role`;
          }
        }
      });
    },
  });
}

export function initTeamSubtab(container: HTMLElement): void {
  bindMagnetic(container);

  // Load live matrix from MySQL
  loadLiveMatrix(container);

  // Invite button
  queryOne<HTMLElement>('[data-k="tm-invite"]', container)?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    playHaptic(target);
    openInviteTeammateModal(target);
  });

  // Search input
  const searchInput = queryOne<HTMLInputElement>('[data-k="tm-q"]', container);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      updateMembersTable(container, true);
    });
  }

  // Filter chips
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

  // Member role select dropdown
  container.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;

    // 1. Matrix Checkbox Toggle
    const permToggle = target.closest<HTMLInputElement>('.st-perm-toggle');
    if (permToggle) {
      const roleId = Number(permToggle.dataset.roleId);
      const permId = Number(permToggle.dataset.permId);
      const set = currentRolePerms.get(roleId);
      if (set) {
        if (permToggle.checked) {
          set.add(permId);
        } else {
          set.delete(permId);
        }
      }
      checkMatrixDirty(container);
      return;
    }

    // 2. Member Roster Role Selector
    const select = target.closest<HTMLSelectElement>('[data-role]');
    if (select) {
      updateMemberRole(select.dataset.role as string, select.value);
    }
  });

  // Save Permissions Matrix Button
  queryOne<HTMLButtonElement>('[data-k="tm-save-matrix"]', container)?.addEventListener(
    'click',
    async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      playHaptic(btn);
      btn.disabled = true;
      btn.innerHTML = `<span>Saving...</span>`;

      try {
        for (const role of liveRoles) {
          const initSet = initialRolePerms.get(role.id) || new Set();
          const currSet = currentRolePerms.get(role.id) || new Set();

          let changed = initSet.size !== currSet.size;
          if (!changed) {
            for (const pid of currSet) {
              if (!initSet.has(pid)) {
                changed = true;
                break;
              }
            }
          }

          if (changed) {
            await updateRole(role.id, {
              permission_ids: Array.from(currSet),
            });
          }
        }

        showToast('Permissions updated and persisted to database', { ico: 'check' });
        await loadLiveMatrix(container);
      } catch (err: any) {
        showToast(err?.message || 'Failed to update permissions', { ico: 'close' });
        checkMatrixDirty(container);
      }
    }
  );

  // Create Role Button
  queryOne<HTMLElement>('[data-k="tm-new-role"]', container)?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    playHaptic(target);
    openCreateRoleModal(container);
  });

  // Table row actions & modal dismissals
  container.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    // Delete custom role button
    const delRoleBtn = target.closest<HTMLElement>('[data-del-role]');
    if (delRoleBtn) {
      playHaptic(delRoleBtn);
      const roleId = Number(delRoleBtn.dataset.delRole);
      const roleName = delRoleBtn.dataset.roleName || 'Custom Role';

      const confirmed = await confirmModal(
        `Are you sure you want to delete role "${roleName}"? This action cannot be undone.`,
        'Delete Role',
        'Delete Role',
        true
      );
      if (!confirmed) return;

      try {
        await deleteRole(roleId);
        showToast(`Role "${roleName}" deleted successfully`, { ico: 'trash' });
        await loadLiveMatrix(container);
      } catch (err: any) {
        showToast(err?.message || 'Failed to delete role', { ico: 'close' });
      }
      return;
    }

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
    if (openRow && !target.closest('select, button, a, label, input')) {
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

  updateSeatsSection(container, true);
}
