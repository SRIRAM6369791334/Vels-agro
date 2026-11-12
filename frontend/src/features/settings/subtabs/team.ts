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
let matrixPermQuery = '';
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

const MODULE_ICONS: Record<string, string> = {
  products: 'box',
  orders: 'file',
  customers: 'users',
  warehouses: 'sidebar',
  purchasing: 'card',
  analytics: 'chart',
  audit: 'shield',
};

export const getActiveMembersCount = (): number =>
  store.team.filter((m) => m.status !== 'invited').length;

export function renderTeamSubtab(): string {
  const activeCount = getActiveMembersCount();
  const seatsLeft = Math.max(0, store.settings.billing.seats - activeCount);

  return `${renderPageHeader({
    eyebrow: 'Who works in Vels and what they can do',
    title: 'Team & roles',
    actions: `<div style="display:flex; align-items:center; gap:8px;">
      <button type="button" class="btn btn--secondary magnetic" data-k="tm-top-new-role">${renderIcon('plus')}New Role</button>
      <button type="button" class="btn btn--primary magnetic" data-k="tm-invite">${renderIcon('userPlus')}Invite teammate</button>
    </div>`,
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

  <!-- 1. Members Roster Table -->
  <section class="card st-members tcard" aria-labelledby="tm-t">
    <header class="card__head">
      <div>
        <h2 class="card__title" id="tm-t">Members</h2>
        <p class="card__sub" data-k="tm-sub"></p>
      </div>
      <div class="card__tools">
        <label class="search">
          ${renderIcon('search')}
          <input type="search" placeholder="Search people by name, role or email…" aria-label="Search people" data-k="tm-q" />
        </label>
      </div>
    </header>
    <div class="toolbar">
      <div class="chips" data-k="tm-roles">
        ${['all', ...ASSIGNABLE_ROLES]
          .map(
            (role) =>
              `<button type="button" class="chip" data-role-f="${role}" aria-pressed="${role === activeRoleFilter}">
                ${role === 'all' ? 'Everyone' : escapeHtml(ROLE_NAMES[role])} <b data-rn="${role}"></b>
              </button>`
          )
          .join('')}
      </div>
    </div>
    <div class="table-wrap">
      <table class="table table--stack st-mtable" style="--areas:'t x' 's p' 'r r'">
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Works at</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col"><span class="sr">Actions</span></th>
          </tr>
        </thead>
        <tbody data-k="tm-rows"></tbody>
      </table>
    </div>
  </section>

  <!-- 2. Compact Capacity & Seats Summary Banner -->
  <section class="card st-seats st-seats--compact" aria-labelledby="tm-s-t">
    <div>
      <h3 class="card__title" id="tm-s-t" style="font-size: var(--fs-base); margin-bottom: 2px;">Team Capacity &amp; License Seats</h3>
      <p class="card__sub" data-k="tm-plan" style="margin: 0;"></p>
    </div>
    <div class="st-seats__fig">
      <b class="num" data-k="tm-used" style="font-size: 1.4rem;">0</b>
      <span style="font-size: var(--fs-sm); color: var(--muted);">of <b data-k="tm-cap"></b> active seats</span>
    </div>
    <span class="meter st-seats__meter" style="max-width: 240px; min-width: 140px;">
      <span class="meter__fill" data-k="tm-meter" style="--c:var(--pine)"></span>
      <span class="meter__fill st-seats__inv" data-k="tm-meter-inv" style="--c:var(--sky)"></span>
    </span>
    <a class="btn btn--ghost btn--sm" href="/settings/billing">${renderIcon('card')}Manage seats</a>
  </section>

  <!-- 3. Full-Width Interactive Roles & Permissions Matrix -->
  <section class="card st-perms tcard" aria-labelledby="tm-p-t">
    <header class="card__head" style="flex-wrap: wrap; gap: 14px;">
      <div>
        <h2 class="card__title" id="tm-p-t">Role Capabilities &amp; Permission Matrix</h2>
        <p class="card__sub">Granular access control matrix synced live with MySQL database</p>
      </div>
      <div class="card__tools" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <label class="search" style="min-width: 220px;">
          ${renderIcon('search')}
          <input type="search" placeholder="Filter capabilities (e.g. order, stock)…" aria-label="Filter capabilities" data-k="tm-perm-q" />
        </label>
        <button type="button" class="btn btn--secondary btn--sm magnetic" data-k="tm-new-role">${renderIcon('plus')}New Role</button>
        <button type="button" class="btn btn--primary btn--sm magnetic" data-k="tm-save-matrix" disabled>${renderIcon('check')}Save permissions</button>
      </div>
    </header>
    <div class="table-wrap" style="max-height: 650px; overflow: auto; border-radius: 12px; border: 1px solid var(--line-2);">
      <table class="table st-matrix" data-k="tm-matrix-table">
        <tbody data-k="tm-matrix-body">
          <tr><td colspan="7" style="text-align:center; padding:36px; color:var(--muted);">Loading live permissions matrix from database...</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- 4. Floating Action Bar for Unsaved Matrix Changes -->
  <div class="st-floating-bar" data-k="tm-float-bar">
    <span class="st-floating-bar__txt"><i class="st-floating-bar__dot"></i>Unsaved permission changes</span>
    <button type="button" class="btn btn--ghost btn--sm" data-k="tm-discard-matrix">Discard</button>
    <button type="button" class="btn btn--primary btn--sm" data-k="tm-float-save">${renderIcon('check')}Save changes</button>
  </div>`;
}

function renderMemberRow(member: TeamMember, query: string): string {
  const [tone, statusLabel] = STATUS_TONES[member.status] ?? ['slate', member.status];
  const isMe = member.id === 'm-okafor';
  const isOwner = member.role === 'owner';
  const location = store.locations.find((l) => l.id === member.locId);

  // Combine static roles with live MySQL roles
  const roleOptions = (isOwner ? ROLES : ASSIGNABLE_ROLES).map((role) => ({
    val: role,
    label: ROLE_NAMES[role] || role,
  }));

  return `<tr class="is-link" data-key="${member.id}" data-open="${member.id}">
    <td class="a-t"><span class="cell-person">${renderAvatar(member.id, 'md')}<span><b>${highlightSearchMatch(member.name, query)}${isMe ? ' <span class="st-this">You</span>' : ''}</b><small>${highlightSearchMatch(member.title, query)} · ${highlightSearchMatch(member.email, query)}</small></span></span></td>
    <td class="a-s" data-label="Works at">${escapeHtml(location?.name ?? '')}</td>
    <td class="a-r"><select class="select st-role" data-role="${member.id}" aria-label="Role for ${escapeHtml(member.name)}" ${isMe || isOwner ? `disabled title="${isMe ? 'You can’t change your own role' : 'The owner’s role is fixed'}"` : ''}>${roleOptions.map((opt) => `<option value="${opt.val}"${opt.val === member.role ? ' selected' : ''}>${escapeHtml(opt.label)}</option>`).join('')}</select></td>
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
    planEl.textContent = `${billing.plan} plan · up to ${billing.seats} team seats`;
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
  let changedRolesCount = 0;

  for (const role of liveRoles) {
    const initSet = initialRolePerms.get(role.id) || new Set();
    const currSet = currentRolePerms.get(role.id) || new Set();
    let roleDiff = initSet.size !== currSet.size;
    if (!roleDiff) {
      for (const pid of currSet) {
        if (!initSet.has(pid)) {
          roleDiff = true;
          break;
        }
      }
    }
    if (roleDiff) {
      isDirty = true;
      changedRolesCount++;
    }
  }

  const saveBtn = queryOne<HTMLButtonElement>('[data-k="tm-save-matrix"]', container);
  const floatBar = queryOne<HTMLElement>('[data-k="tm-float-bar"]', container);
  const floatTxt = floatBar?.querySelector<HTMLElement>('.st-floating-bar__txt');

  if (saveBtn) saveBtn.disabled = !isDirty;

  if (floatBar) {
    if (isDirty) {
      floatBar.classList.add('is-visible');
      if (floatTxt) {
        floatTxt.innerHTML = `<i class="st-floating-bar__dot"></i>Unsaved changes across ${pluralize(changedRolesCount, 'role')}`;
      }
    } else {
      floatBar.classList.remove('is-visible');
    }
  }
}

function renderMatrixTable(container: HTMLElement): void {
  const table = queryOne<HTMLElement>('[data-k="tm-matrix-table"]', container);
  if (!table) return;

  if (liveRoles.length === 0 || livePermissions.length === 0) {
    table.innerHTML = `<tbody><tr><td colspan="7" style="text-align:center; padding:32px; color:var(--muted);">No roles found in database.</td></tr></tbody>`;
    return;
  }

  // 1. Build Header
  const headerColsHtml = liveRoles
    .map(
      (role) => `
      <th scope="col" class="st-matrix__role" data-col="r-${role.id}">
        <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
          <b style="font-size:var(--fs-sm);">${escapeHtml(role.name)}</b>
          ${
            !role.is_system
              ? `<button type="button" class="ibtn ibtn--xs st-role-del-btn" data-del-role="${role.id}" data-role-name="${escapeHtml(role.name)}" title="Delete custom role ${escapeHtml(role.name)}">${renderIcon('trash')}</button>`
              : ''
          }
        </div>
        <small>${role.is_system ? renderPill('System', 'slate') : renderPill('Custom', 'pine')}</small>
      </th>
    `
    )
    .join('');

  const theadHtml = `
    <thead>
      <tr>
        <th scope="col" style="min-width: 260px; text-align: left;">
          <span>Permission Capability</span>
        </th>
        ${headerColsHtml}
      </tr>
    </thead>
  `;

  // 2. Filter permissions if query exists
  const q = matrixPermQuery.trim().toLowerCase();
  const filteredPerms = livePermissions.filter(
    (p) => !q || (p.description || '').toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.module.toLowerCase().includes(q)
  );

  if (filteredPerms.length === 0) {
    table.innerHTML = `
      ${theadHtml}
      <tbody data-k="tm-matrix-body">
        <tr><td colspan="${liveRoles.length + 1}" style="text-align:center; padding:36px; color:var(--muted);">No permissions match “${escapeHtml(matrixPermQuery)}”.</td></tr>
      </tbody>
    `;
    return;
  }

  // Group permissions by module
  const moduleMap: Record<string, SystemPermission[]> = {};
  filteredPerms.forEach((p) => {
    if (!moduleMap[p.module]) moduleMap[p.module] = [];
    moduleMap[p.module].push(p);
  });

  // 3. Build Body Rows
  const tbodyRows: string[] = [];

  Object.entries(moduleMap).forEach(([mod, perms]) => {
    const modTitle = MODULE_TITLES[mod] || mod.toUpperCase();
    tbodyRows.push(`
      <tr class="st-matrix__mod-head">
        <th colspan="${liveRoles.length + 1}">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            ${renderIcon(MODULE_ICONS[mod] || 'shield')}
            ${escapeHtml(modTitle)}
          </span>
        </th>
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
            <b>${q ? highlightSearchMatch(perm.description || perm.code, q) : escapeHtml(perm.description || perm.code)}</b>
            <small style="display:block; font-size:var(--fs-2xs); color:var(--muted);">${q ? highlightSearchMatch(perm.code, q) : escapeHtml(perm.code)}</small>
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
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--bad);">Failed to load roles from backend. Please verify your connection.</td></tr>`;
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
      <div style="margin-bottom: 14px;" data-module-block="${mod}">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px;">
          <b style="font-size: var(--fs-xs); text-transform: uppercase; color: var(--muted); display:inline-flex; align-items:center; gap:6px;">
            ${renderIcon(MODULE_ICONS[mod] || 'shield')}
            ${escapeHtml(MODULE_TITLES[mod] || mod)}
          </b>
          <button type="button" class="btn btn--ghost btn--xs" data-mod-toggle="${mod}">Select all</button>
        </div>
        <div class="st-perm-modal-grid">
          ${perms
            .map(
              (p) => `
            <label class="st-perm-modal-item">
              <input type="checkbox" name="role_perms" value="${p.id}" data-mod="${p.module}" />
              <span>
                <b>${escapeHtml(p.description || p.code)}</b>
                <small style="display:block; color:var(--muted); font-size:var(--fs-2xs);">${escapeHtml(p.code)}</small>
              </span>
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
    <form id="create-role-form" style="display: grid; gap: 14px; max-width: 680px;">
      <div class="st-preset-bar">
        <span style="font-size: var(--fs-xs); font-weight:700; color:var(--muted); margin-right: 4px;">Quick Presets:</span>
        <button type="button" class="st-preset-btn" data-preset="all">⭐ Full Access (16)</button>
        <button type="button" class="st-preset-btn" data-preset="operations">📦 Operations &amp; Stock</button>
        <button type="button" class="st-preset-btn" data-preset="sales">🛒 Sales &amp; Orders</button>
        <button type="button" class="st-preset-btn" data-preset="auditor">🔍 Auditor (Read-Only)</button>
        <button type="button" class="st-preset-btn" data-preset="clear" style="color:var(--bad);">✖ Clear</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <label class="st-field">
          <span class="field__label">Role Name *</span>
          <input class="st-in" name="name" type="text" placeholder="e.g. Quality Auditor" required autofocus />
        </label>
        <label class="st-field">
          <span class="field__label">Description</span>
          <input class="st-in" name="description" type="text" placeholder="Summary of role duties" />
        </label>
      </div>

      <div class="st-field">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 4px;">
          <span class="field__label">Configure Module Permissions</span>
          <small data-k="perm-count" style="font-weight:700; color:var(--primary);">0 of ${livePermissions.length} selected</small>
        </div>
        <div style="border: 1px solid var(--line-2); border-radius: 12px; padding: 14px; background: var(--surface); max-height: 380px; overflow-y: auto;">
          ${permsChecklistHtml}
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
        <button type="button" class="btn btn--ghost btn--sm" data-action="cancel">Cancel</button>
        <button type="submit" class="btn btn--primary btn--sm" data-action="submit">${renderIcon('check')}Create Role</button>
      </div>
    </form>
  `;

  openModal(modalHtml, {
    title: 'Create New Custom Role',
    sub: 'Define a tailored team role with granular permissions stored in MySQL',
    onMount: (dialog) => {
      const form = dialog.querySelector<HTMLFormElement>('#create-role-form');
      if (!form) return;

      const updateCount = () => {
        const checked = form.querySelectorAll<HTMLInputElement>('input[name="role_perms"]:checked').length;
        const countEl = dialog.querySelector<HTMLElement>('[data-k="perm-count"]');
        if (countEl) countEl.textContent = `${checked} of ${livePermissions.length} selected`;
      };

      form.addEventListener('change', updateCount);

      // Presets
      dialog.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const preset = btn.dataset.preset;
          const checkboxes = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="role_perms"]'));

          checkboxes.forEach((cb) => {
            const mod = cb.dataset.mod || '';
            const val = cb.closest('label')?.querySelector('small')?.textContent || '';

            if (preset === 'all') cb.checked = true;
            else if (preset === 'clear') cb.checked = false;
            else if (preset === 'operations') {
              cb.checked = ['products', 'warehouses', 'purchasing'].includes(mod);
            } else if (preset === 'sales') {
              cb.checked = ['orders', 'customers'].includes(mod);
            } else if (preset === 'auditor') {
              cb.checked = val.endsWith('.view') || mod === 'analytics' || mod === 'audit';
            }
          });

          updateCount();
        });
      });

      // Module Select All toggles
      dialog.querySelectorAll<HTMLButtonElement>('[data-mod-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mod = btn.dataset.modToggle;
          const block = dialog.querySelector(`[data-module-block="${mod}"]`);
          if (block) {
            const cbs = Array.from(block.querySelectorAll<HTMLInputElement>('input[name="role_perms"]'));
            const allChecked = cbs.every((cb) => cb.checked);
            cbs.forEach((cb) => (cb.checked = !allChecked));
            btn.textContent = allChecked ? 'Select all' : 'Deselect all';
            updateCount();
          }
        });
      });

      dialog.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
        closeModal();
      });

      form.addEventListener('submit', async (e) => {
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

  // Top New Role Button
  queryOne<HTMLElement>('[data-k="tm-top-new-role"]', container)?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    playHaptic(target);
    openCreateRoleModal(container);
  });

  // Search input for team members
  const searchInput = queryOne<HTMLInputElement>('[data-k="tm-q"]', container);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      updateMembersTable(container, true);
    });
  }

  // Filter input for matrix permissions
  const matrixSearchInput = queryOne<HTMLInputElement>('[data-k="tm-perm-q"]', container);
  if (matrixSearchInput) {
    matrixSearchInput.addEventListener('input', (e) => {
      matrixPermQuery = (e.target as HTMLInputElement).value;
      renderMatrixTable(container);
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

  // Member role select dropdown & matrix checkbox toggle
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

  // Save Permissions Matrix Button (Top Header & Floating Bar)
  const saveMatrixHandler = async () => {
    const saveBtn = queryOne<HTMLButtonElement>('[data-k="tm-save-matrix"]', container);
    const floatSaveBtn = queryOne<HTMLButtonElement>('[data-k="tm-float-save"]', container);

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span>Saving...</span>`;
    }
    if (floatSaveBtn) {
      floatSaveBtn.disabled = true;
      floatSaveBtn.innerHTML = `<span>Saving...</span>`;
    }

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
  };

  queryOne<HTMLButtonElement>('[data-k="tm-save-matrix"]', container)?.addEventListener('click', saveMatrixHandler);
  queryOne<HTMLButtonElement>('[data-k="tm-float-save"]', container)?.addEventListener('click', saveMatrixHandler);

  // Discard changes
  queryOne<HTMLButtonElement>('[data-k="tm-discard-matrix"]', container)?.addEventListener('click', () => {
    liveRoles.forEach((role) => {
      const initSet = initialRolePerms.get(role.id) || new Set();
      currentRolePerms.set(role.id, new Set(initSet));
    });
    renderMatrixTable(container);
    showToast('Unsaved changes discarded', { ico: 'close' });
  });

  // Create Role Button in matrix header
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
