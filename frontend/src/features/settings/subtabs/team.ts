import { store, findMemberById } from '../../../core/store';
import {
  animateCounter,
  animateCards,
  animateRows,
  animatePop,
  motionDuration,
  playHaptic,
  bindMagnetic,
  prefersReducedMotion,
  gsap,
} from '../../../core/motion';
import { ROLE_NAMES, ONE_DAY_MS } from '../../../core/constants';
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
  openQuickCreateModal,
  openDrawer,
  bindModalDismiss,
  animatePageTransition,
} from '../../../main';
import {
  getRoles,
  getAllPermissions,
  createRole,
  updateRole,
  getDashboardUsers,
  createDashboardUser,
  updateDashboardUser,
  toggleDashboardUserStatus,
  RoleDetail,
  PermissionItem,
  DashboardUserItem,
} from '../../../core/api/teamService';

// Module grouping for CRUD permissions
export interface CrudGroup {
  module: string;
  label: string;
  perms: Array<{
    action: 'C' | 'R' | 'U' | 'D';
    actionLabel: string;
    code: string;
    name: string;
  }>;
}

const CRUD_SCHEMA: CrudGroup[] = [
  {
    module: 'products',
    label: 'Products & Formulas',
    perms: [
      { action: 'C', actionLabel: 'Create', code: 'products.create', name: 'Create products, raw materials & formulas' },
      { action: 'R', actionLabel: 'Read', code: 'products.read', name: 'View product catalog, formulas & inventory stock' },
      { action: 'U', actionLabel: 'Update', code: 'products.update', name: 'Edit product specifications, pricing & adjustments' },
      { action: 'D', actionLabel: 'Delete', code: 'products.delete', name: 'Delete or archive discontinued products & batches' },
    ],
  },
  {
    module: 'orders',
    label: 'Sales Orders & Fulfillment',
    perms: [
      { action: 'C', actionLabel: 'Create', code: 'orders.create', name: 'Create new sales orders, quotes & invoices' },
      { action: 'R', actionLabel: 'Read', code: 'orders.read', name: 'View sales orders, stages, dispatch & status' },
      { action: 'U', actionLabel: 'Update', code: 'orders.update', name: 'Advance fulfillment stages & update order notes' },
      { action: 'D', actionLabel: 'Delete', code: 'orders.delete', name: 'Cancel, refund or delete sales orders' },
    ],
  },
  {
    module: 'customers',
    label: 'Customers & Stockists',
    perms: [
      { action: 'C', actionLabel: 'Create', code: 'customers.create', name: 'Register new stockists, distributors & shoppers' },
      { action: 'R', actionLabel: 'Read', code: 'customers.read', name: 'View customer directory, order history & credit' },
      { action: 'U', actionLabel: 'Update', code: 'customers.update', name: 'Update customer credit terms, contacts & addresses' },
      { action: 'D', actionLabel: 'Delete', code: 'customers.delete', name: 'Delete or blacklist customer accounts' },
    ],
  },
  {
    module: 'purchasing',
    label: 'Purchasing & Raw Materials',
    perms: [
      { action: 'C', actionLabel: 'Create', code: 'purchasing.create', name: 'Create purchase orders & vendor delivery requests' },
      { action: 'R', actionLabel: 'Read', code: 'purchasing.read', name: 'View purchase orders, supplier logs & raw stock' },
      { action: 'U', actionLabel: 'Update', code: 'purchasing.update', name: 'Update purchase orders & receive vendor deliveries' },
      { action: 'D', actionLabel: 'Delete', code: 'purchasing.delete', name: 'Cancel, void or delete supplier purchase orders' },
    ],
  },
  {
    module: 'team',
    label: 'Team & RBAC Permissions',
    perms: [
      { action: 'C', actionLabel: 'Create', code: 'team.create', name: 'Invite teammates & create custom roles' },
      { action: 'R', actionLabel: 'Read', code: 'team.read', name: 'View staff directory, assigned roles & permissions' },
      { action: 'U', actionLabel: 'Update', code: 'team.update', name: 'Modify teammate details, roles & permission matrix' },
      { action: 'D', actionLabel: 'Delete', code: 'team.delete', name: 'Deactivate/remove teammates & delete custom roles' },
    ],
  },
];

let liveRoles: RoleDetail[] = [];
let livePermissionsCatalog: PermissionItem[] = [];
let liveDashboardUsers: DashboardUserItem[] = [];

// Role ID -> Set of Permission IDs
let rolePermMap: Record<number, Set<number>> = {};
let savedRolePermMap: Record<number, Set<number>> = {};

let searchQuery = '';
let activeRoleFilter = 'all';

function getPermissionIdByCode(code: string): number | null {
  const found = livePermissionsCatalog.find((p) => p.code === code);
  return found ? found.id : null;
}

export const getActiveMembersCount = (): number =>
  liveDashboardUsers.length > 0
    ? liveDashboardUsers.filter((u) => Boolean(u.is_active)).length
    : store.team.filter((m) => m.status !== 'invited').length;

export function isMatrixDirty(): boolean {
  for (const role of liveRoles) {
    const currentSet = rolePermMap[role.id] || new Set();
    const savedSet = savedRolePermMap[role.id] || new Set();
    if (currentSet.size !== savedSet.size) return true;
    for (const id of currentSet) {
      if (!savedSet.has(id)) return true;
    }
  }
  return false;
}

export function updateMatrixDirtyState(container: HTMLElement): void {
  const dirty = isMatrixDirty();
  const dirtyBadge = queryOne<HTMLElement>('[data-k="tm-matrix-dirty"]', container);
  const saveBtn = queryOne<HTMLElement>('[data-k="tm-matrix-save"]', container);
  const resetBtn = queryOne<HTMLElement>('[data-k="tm-matrix-reset"]', container);

  if (dirtyBadge) dirtyBadge.hidden = !dirty;
  if (saveBtn) saveBtn.hidden = !dirty;
  if (resetBtn) resetBtn.hidden = !dirty;

  if (dirty && dirtyBadge) {
    animatePop(dirtyBadge, { from: 0.8 });
  }
}

export function renderMatrixTableHtml(): string {
  if (liveRoles.length === 0) {
    return `<div style="padding: 24px; text-align: center;"><small class="muted">Loading live RBAC roles and permissions from MySQL...</small></div>`;
  }

  return `<table class="table st-matrix" data-k="tm-matrix-table">
    <thead>
      <tr>
        <th scope="col" style="min-width: 280px;">Permission (CRUD Action)</th>
        <th scope="col" class="st-matrix__role" data-col="owner">
          <span>Owner</span>
          <span class="st-matrix__role-badge">Tier 1</span>
          <small>Superadmin</small>
        </th>
        ${liveRoles
          .map(
            (r) => `<th scope="col" class="st-matrix__role" data-col="role-${r.id}">
              <span>${escapeHtml(r.name)}</span>
              ${!r.is_system ? '<span class="st-matrix__role-badge">Custom</span>' : ''}
              <small data-rc="${r.id}">${liveDashboardUsers.filter((u) => u.role_id === r.id).length} staff</small>
            </th>`
          )
          .join('')}
      </tr>
    </thead>
    <tbody>
      ${CRUD_SCHEMA.map((group) => {
        const headerRow = `<tr>
          <th colspan="${liveRoles.length + 2}" class="st-matrix__section-header">
            ${escapeHtml(group.label)}
          </th>
        </tr>`;

        const permRows = group.perms.map((p) => {
          const permId = getPermissionIdByCode(p.code);
          const badgeClass = `crud-badge--${p.action.toLowerCase()}`;

          return `<tr>
            <th scope="row">
              <div class="crud-cell-title">
                <span class="crud-badge ${badgeClass}">${p.action}</span>
                <span>${escapeHtml(p.name)}</span>
              </div>
            </th>
            <!-- Owner Column (Always Full Access) -->
            <td data-col="owner">
              <label class="st-perm-toggle" title="Owner has permanent ${p.actionLabel} access">
                <input type="checkbox" class="st-perm-cb" checked disabled />
                <span class="st-perm-indicator st-perm-indicator--locked">
                  <svg class="st-perm-ico" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
                </span>
              </label>
            </td>
            <!-- Dynamic MySQL Role Columns -->
            ${liveRoles
              .map((role) => {
                const isChecked = permId !== null && (rolePermMap[role.id]?.has(permId) ?? false);
                return `<td data-col="role-${role.id}">
                  <label class="st-perm-toggle" title="${escapeHtml(role.name)}: ${p.actionLabel} (${escapeHtml(p.name)})">
                    <input
                      type="checkbox"
                      class="st-perm-cb"
                      data-role-id="${role.id}"
                      data-perm-id="${permId ?? ''}"
                      ${isChecked ? 'checked' : ''}
                      ${permId === null ? 'disabled' : ''}
                    />
                    <span class="st-perm-indicator">
                      <svg class="st-perm-ico" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
                    </span>
                  </label>
                </td>`;
              })
              .join('')}
          </tr>`;
        }).join('');

        return headerRow + permRows;
      }).join('')}
    </tbody>
  </table>`;
}

export function renderTeamSubtab(): string {
  const totalCount = liveDashboardUsers.length || store.team.length;
  const activeCount = liveDashboardUsers.filter((u) => Boolean(u.is_active)).length || totalCount;
  const seatsCap = store.settings.billing.seats || 20;
  const seatsLeft = Math.max(0, seatsCap - activeCount);

  return `${renderPageHeader({
    eyebrow: 'Who works in Vels and what they can do',
    title: 'Team & roles',
    actions: `<button type="button" class="btn btn--primary magnetic" data-k="tm-invite">${renderIcon('userPlus')}Invite teammate</button>`,
    stats: [
      {
        key: 'members',
        icon: 'users',
        label: 'Members',
        value: totalCount,
        ico: 'pine',
      },
      {
        key: 'active',
        icon: 'check',
        label: 'Active today',
        value: activeCount,
        ico: 'sage',
      },
      {
        key: 'invited',
        icon: 'send',
        label: 'Pending invites',
        value: liveDashboardUsers.filter((u) => !u.last_login_at).length,
        ico: 'sky',
      },
      {
        key: 'seats',
        icon: 'key',
        label: 'Seats left',
        value: seatsLeft,
        suffix: `of ${seatsCap}`,
        ico: 'ochre',
      },
    ],
  })}
  <section class="card st-members tcard" aria-labelledby="tm-t">
    <header class="card__head">
      <div>
        <h2 class="card__title" id="tm-t">Members</h2>
        <p class="card__sub" data-k="tm-sub">MySQL Dashboard Users Roster</p>
      </div>
      <div class="card__tools">
        <label class="search">${renderIcon('search')}<input type="search" placeholder="Search staff members…" aria-label="Search people" data-k="tm-q" /></label>
      </div>
    </header>
    <div class="toolbar">
      <div class="chips" data-k="tm-roles">
        <button type="button" class="chip" data-role-f="all" aria-pressed="true">Everyone <b data-rn="all">${totalCount}</b></button>
      </div>
    </div>
    <div class="table-wrap"><table class="table table--stack st-mtable" style="--areas:'t x' 's p' 'r r'">
      <thead><tr><th scope="col">Person</th><th scope="col">Phone</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col"><span class="sr">Actions</span></th></tr></thead>
      <tbody data-k="tm-rows">
        <tr><td colspan="5" style="text-align:center; padding: 24px;"><small>Loading staff members from MySQL...</small></td></tr>
      </tbody>
    </table></div>
  </section>

  <div class="st-grid st-grid--team">
    <section class="card st-perms tcard" aria-labelledby="tm-p-t">
      <header class="card__head">
        <div>
          <h2 class="card__title" id="tm-p-t">What each role can do</h2>
          <p class="card__sub">Granular CRUD Matrix: Create (C), Read (R), Update (U), Delete (D)</p>
        </div>
        <div class="st-perms__tools">
          <span class="st-dirty" data-k="tm-matrix-dirty" hidden>${renderIcon('edit')}Unsaved changes</span>
          <button type="button" class="btn btn--ghost btn--sm" data-k="tm-matrix-reset" hidden>Discard</button>
          <button type="button" class="btn btn--primary btn--sm" data-k="tm-matrix-save" hidden>${renderIcon('check')}Save changes</button>
          <button type="button" class="btn btn--secondary btn--sm magnetic" data-k="tm-add-role">${renderIcon('userPlus')}Create role</button>
        </div>
      </header>
      <div class="table-wrap" data-k="tm-matrix-wrap">
        ${renderMatrixTableHtml()}
      </div>
    </section>

    <section class="card st-seats" aria-labelledby="tm-s-t">
      <header class="card__head"><div><h2 class="card__title" id="tm-s-t">Seats</h2><p class="card__sub" data-k="tm-plan"></p></div></header>
      <div class="st-seats__fig"><b class="num" data-k="tm-used">${activeCount}</b><span>of <b data-k="tm-cap">${seatsCap}</b> seats in use</span></div>
      <span class="meter st-seats__meter"><span class="meter__fill" data-k="tm-meter" style="--c:var(--pine)"></span><span class="meter__fill st-seats__inv" data-k="tm-meter-inv" style="--c:var(--sky)"></span></span>
      <ul class="st-seats__key"><li><i class="dot" style="--c:var(--pine)"></i>Active and online</li><li><i class="dot" style="--c:var(--sky)"></i>Invited / pending</li></ul>
      <p class="st-seats__note" data-k="tm-note"></p>
      <a class="btn btn--ghost btn--sm" href="/settings/billing">${renderIcon('card')}Change seats</a>
    </section>
  </div>`;
}

function renderMemberRow(user: DashboardUserItem, query: string): string {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
  const isActive = Boolean(user.is_active);
  const statusLabel = isActive ? 'Active' : 'Inactive';
  const tone = isActive ? 'sage' : 'slate';

  return `<tr class="is-link" data-key="${user.id}" data-open="${user.id}">
    <td class="a-t">
      <span class="cell-person">
        <span class="av av--md av--pine">${escapeHtml(fullName.slice(0, 2).toUpperCase())}</span>
        <span>
          <b>${highlightSearchMatch(fullName, query)}</b>
          <small>${highlightSearchMatch(user.job_title || 'Operations Staff', query)} · ${highlightSearchMatch(user.email, query)}</small>
        </span>
      </span>
    </td>
    <td class="a-s" data-label="Phone">${escapeHtml(user.phone || '—')}</td>
    <td class="a-r">
      <select class="select st-role" data-user-id="${user.id}" aria-label="Role for ${escapeHtml(fullName)}">
        ${liveRoles
          .map((r) => `<option value="${r.id}"${r.id === user.role_id ? ' selected' : ''}>${escapeHtml(r.name)}</option>`)
          .join('')}
      </select>
    </td>
    <td class="a-p">${renderPill(statusLabel, tone)}</td>
    <td class="a-x r">
      <button type="button" class="btn btn--ghost btn--sm" data-toggle-status="${user.id}" title="${isActive ? 'Deactivate user' : 'Activate user'}">
        ${renderIcon(isActive ? 'close' : 'check')}<span>${isActive ? 'Deactivate' : 'Activate'}</span>
      </button>
    </td>
  </tr>`;
}

export function updateFilterChips(container: HTMLElement): void {
  const chipsContainer = queryOne<HTMLElement>('[data-k="tm-roles"]', container);
  if (!chipsContainer) return;

  const totalCount = liveDashboardUsers.length;
  const chipsHtml = [
    `<button type="button" class="chip" data-role-f="all" aria-pressed="${activeRoleFilter === 'all'}">Everyone <b data-rn="all">${totalCount}</b></button>`,
    ...liveRoles.map(
      (r) =>
        `<button type="button" class="chip" data-role-f="${r.id}" aria-pressed="${String(r.id) === activeRoleFilter}">${escapeHtml(r.name)} <b data-rn="${r.id}">${liveDashboardUsers.filter((u) => u.role_id === r.id).length}</b></button>`
    ),
  ].join('');

  chipsContainer.innerHTML = chipsHtml;
}

export function updateMembersTable(container: HTMLElement, withDismiss = false): void {
  const query = searchQuery.trim().toLowerCase();

  const filtered = liveDashboardUsers.filter((u) => {
    const matchesRole = activeRoleFilter === 'all' || String(u.role_id) === activeRoleFilter;
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const matchesQuery =
      !query ||
      fullName.includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.job_title || '').toLowerCase().includes(query);
    return matchesRole && matchesQuery;
  });

  const rowsHtml = filtered.length
    ? filtered.map((u) => renderMemberRow(u, query)).join('')
    : `<tr><td colspan="5">${renderEmptyState(query ? `No staff match “${searchQuery.trim()}”` : 'No staff members in this role', 'Search by name, job title or email.', 'users', '<button type="button" class="btn btn--ghost btn--sm" data-k="tm-clear">Show everyone</button>')}</td></tr>`;

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
    subEl.textContent = `${pluralize(liveDashboardUsers.length, 'staff member')} in MySQL database`;
  }
}

export function bindMatrixHover(container: HTMLElement): void {
  const matrix = domQuery('.st-matrix', container);
  if (!matrix) return;

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

function handleCreateRoleModal(fromBtn: HTMLElement, container: HTMLElement): void {
  openQuickCreateModal({
    title: 'Create new role',
    sub: 'Define a custom role and choose its starting CRUD access',
    from: fromBtn,
    submit: 'Create role',
    fields: [
      {
        name: 'name',
        label: 'Role name',
        required: true,
        placeholder: 'e.g. Quality Auditor, Dispatch Supervisor',
      },
      {
        name: 'description',
        label: 'Role description',
        placeholder: 'Short summary of responsibilities',
        wide: true,
      },
      {
        name: 'crudPreset',
        label: 'Starting CRUD permission preset',
        type: 'select',
        value: 'cru',
        options: [
          ['crud', 'Full CRUD (Create, Read, Update, Delete)'],
          ['cru', 'CRU (Create, Read, Update — No Delete)'],
          ['crd', 'CRD (Create, Read, Delete — No Edit)'],
          ['read', 'Read-Only (R — View Only)'],
          ['empty', 'Clean slate (No permissions initially)'],
        ],
      },
    ],
    onSubmit: (values) => {
      const name = (values.name || '').trim();
      if (!name) return 'Role name is required.';
      if (liveRoles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
        return 'A role with this name already exists in the system.';
      }

      // Determine initial permission IDs based on preset
      const preset = values.crudPreset || 'cru';
      const initialPermIds: number[] = [];

      CRUD_SCHEMA.forEach((group) => {
        group.perms.forEach((p) => {
          const permId = getPermissionIdByCode(p.code);
          if (permId !== null) {
            if (preset === 'crud') initialPermIds.push(permId);
            else if (preset === 'cru' && ['C', 'R', 'U'].includes(p.action)) initialPermIds.push(permId);
            else if (preset === 'crd' && ['C', 'R', 'D'].includes(p.action)) initialPermIds.push(permId);
            else if (preset === 'read' && p.action === 'R') initialPermIds.push(permId);
          }
        });
      });

      // Submit to MySQL backend
      createRole({
        name,
        description: values.description || '',
        permission_ids: initialPermIds,
      })
        .then(async () => {
          showToast(`Role "${name}" created successfully in MySQL!`, { ico: 'check' });

          // Refresh roles and matrix
          const freshRoles = await getRoles();
          liveRoles = freshRoles;
          syncRolePermMaps();

          const matrixWrap = queryOne<HTMLElement>('[data-k="tm-matrix-wrap"]', container);
          if (matrixWrap) {
            matrixWrap.innerHTML = renderMatrixTableHtml();
            bindMatrixHover(container);
          }
          updateFilterChips(container);
          updateMembersTable(container);
        })
        .catch((err: any) => {
          showToast(err?.message || 'Failed to create role in database.', { ico: 'close' });
        });
    },
  });
}

function handleInviteTeammateModal(fromBtn: HTMLElement, container: HTMLElement): void {
  openQuickCreateModal({
    title: 'Invite new teammate',
    sub: 'Creates a real dashboard user account with immediate access',
    from: fromBtn,
    submit: 'Send invite',
    fields: [
      { name: 'name', label: 'Full name', required: true, placeholder: 'Karthik Raja' },
      { name: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'user@velsagro.com' },
      { name: 'title', label: 'Job title', placeholder: 'Warehouse Logistics' },
      { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '+91 98400 12345' },
      {
        name: 'roleId',
        label: 'Assigned Role',
        type: 'select',
        value: String(liveRoles[0]?.id || 1),
        options: liveRoles.map((r) => [String(r.id), r.name]),
      },
    ],
    onSubmit: (values) => {
      const email = (values.email || '').trim().toLowerCase();
      const name = (values.name || '').trim();
      if (!name) return 'Full name is required.';
      if (!email || !email.includes('@')) return 'A valid work email is required.';

      const parts = name.split(/\s+/);
      const firstName = parts[0] || name;
      const lastName = parts.slice(1).join(' ') || '';
      const roleId = parseInt(values.roleId) || liveRoles[0]?.id || 1;

      createDashboardUser({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: values.phone?.trim() || undefined,
        job_title: values.title?.trim() || 'Operations Staff',
        role_id: roleId,
      })
        .then(async () => {
          showToast(`Teammate "${name}" added to database!`, { ico: 'check' });
          liveDashboardUsers = await getDashboardUsers();
          updateFilterChips(container);
          updateMembersTable(container);
        })
        .catch((err: any) => {
          showToast(err?.message || 'Failed to create dashboard user.', { ico: 'close' });
        });
    },
  });
}

function syncRolePermMaps(): void {
  rolePermMap = {};
  savedRolePermMap = {};

  liveRoles.forEach((role) => {
    const permIds = new Set((role.permissions || []).map((p) => p.id));
    rolePermMap[role.id] = new Set(permIds);
    savedRolePermMap[role.id] = new Set(permIds);
  });
}

export function initTeamSubtab(container: HTMLElement): void {
  bindMagnetic(container);

  // 1. Fetch live data from MySQL Backend
  Promise.all([getRoles(), getAllPermissions(), getDashboardUsers()])
    .then(([roles, permsData, users]) => {
      liveRoles = roles;
      livePermissionsCatalog = permsData.list || [];
      liveDashboardUsers = users;

      syncRolePermMaps();

      // Render Matrix
      const matrixWrap = queryOne<HTMLElement>('[data-k="tm-matrix-wrap"]', container);
      if (matrixWrap) {
        matrixWrap.innerHTML = renderMatrixTableHtml();
        bindMatrixHover(container);
      }

      // Render Filter Chips and Users Table
      updateFilterChips(container);
      updateMembersTable(container);
      updateMatrixDirtyState(container);
    })
    .catch((err) => {
      console.error('Error fetching team RBAC data:', err);
      showToast('Could not load roles and permissions from server.', { ico: 'close' });
    });

  // 2. Invite Teammate Modal
  queryOne<HTMLElement>('[data-k="tm-invite"]', container)?.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    playHaptic(target);
    handleInviteTeammateModal(target, container);
  });

  // 3. Search input
  const searchInput = queryOne<HTMLInputElement>('[data-k="tm-q"]', container);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      updateMembersTable(container, true);
    });
  }

  // 4. Role Filter Chips
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

  // 5. Interactive Checkbox Toggle & Staff Role Select
  container.addEventListener('change', async (e) => {
    const cb = e.target as HTMLInputElement;

    // A. Matrix Checkbox Toggle
    if (cb && cb.classList.contains('st-perm-cb')) {
      playHaptic(cb);
      const roleIdStr = cb.dataset.roleId;
      const permIdStr = cb.dataset.permId;
      if (!roleIdStr || !permIdStr) return;

      const roleId = parseInt(roleIdStr);
      const permId = parseInt(permIdStr);
      if (isNaN(roleId) || isNaN(permId)) return;

      if (!rolePermMap[roleId]) rolePermMap[roleId] = new Set();
      if (cb.checked) {
        rolePermMap[roleId].add(permId);
      } else {
        rolePermMap[roleId].delete(permId);
      }

      updateMatrixDirtyState(container);
      return;
    }

    // B. Staff Role Dropdown
    const select = (e.target as HTMLElement).closest<HTMLSelectElement>('[data-user-id]');
    if (select) {
      const userId = parseInt(select.dataset.userId || '0');
      const newRoleId = parseInt(select.value);
      if (!userId || !newRoleId) return;

      try {
        await updateDashboardUser(userId, { role_id: newRoleId });
        showToast('Staff role updated in database!', { ico: 'check' });
        // Update local array
        const user = liveDashboardUsers.find((u) => u.id === userId);
        if (user) user.role_id = newRoleId;
        updateFilterChips(container);
      } catch (err: any) {
        showToast(err?.message || 'Failed to update staff role.', { ico: 'close' });
      }
    }
  });

  // 6. Save Matrix Changes to MySQL Database
  queryOne<HTMLElement>('[data-k="tm-matrix-save"]', container)?.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    playHaptic(btn);
    btn.disabled = true;
    btn.innerHTML = `<span>Saving...</span>`;

    try {
      // Find modified roles
      const promises: Promise<any>[] = [];
      for (const role of liveRoles) {
        const currentSet = rolePermMap[role.id] || new Set();
        const savedSet = savedRolePermMap[role.id] || new Set();

        let isRoleDirty = currentSet.size !== savedSet.size;
        if (!isRoleDirty) {
          for (const id of currentSet) {
            if (!savedSet.has(id)) {
              isRoleDirty = true;
              break;
            }
          }
        }

        if (isRoleDirty) {
          promises.push(
            updateRole(role.id, {
              permission_ids: Array.from(currentSet),
            })
          );
        }
      }

      await Promise.all(promises);

      // Refresh from server
      const freshRoles = await getRoles();
      liveRoles = freshRoles;
      syncRolePermMaps();

      updateMatrixDirtyState(container);
      btn.disabled = false;
      btn.innerHTML = `${renderIcon('check')}Save changes`;
      showToast(`${pluralize(promises.length, 'role')} permissions updated in MySQL!`, { ico: 'check' });
    } catch (err: any) {
      btn.disabled = false;
      btn.innerHTML = `${renderIcon('check')}Save changes`;
      showToast(err?.message || 'Failed to save permissions to database.', { ico: 'close' });
    }
  });

  // 7. Discard Matrix Changes
  queryOne<HTMLElement>('[data-k="tm-matrix-reset"]', container)?.addEventListener('click', (e) => {
    playHaptic(e.currentTarget as HTMLElement);
    syncRolePermMaps();
    const matrixWrap = queryOne<HTMLElement>('[data-k="tm-matrix-wrap"]', container);
    if (matrixWrap) {
      matrixWrap.innerHTML = renderMatrixTableHtml();
      bindMatrixHover(container);
    }
    updateMatrixDirtyState(container);
    showToast('Permission changes discarded', { ico: 'close' });
  });

  // 8. Create Role Button
  queryOne<HTMLElement>('[data-k="tm-add-role"]', container)?.addEventListener('click', (e) => {
    const fromBtn = e.currentTarget as HTMLElement;
    playHaptic(fromBtn);
    handleCreateRoleModal(fromBtn, container);
  });

  // 9. Table Row Clicks & Toggle Status
  container.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    // Toggle User Status
    const toggleBtn = target.closest<HTMLElement>('[data-toggle-status]');
    if (toggleBtn) {
      playHaptic(toggleBtn);
      const userId = parseInt(toggleBtn.dataset.toggleStatus || '0');
      const user = liveDashboardUsers.find((u) => u.id === userId);
      if (!user) return;

      const newStatus = !user.is_active;
      try {
        await toggleDashboardUserStatus(userId, newStatus);
        user.is_active = newStatus ? 1 : 0;
        updateMembersTable(container);
        showToast(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`, { ico: 'check' });
      } catch (err: any) {
        showToast(err?.message || 'Failed to update user status.', { ico: 'close' });
      }
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
  });

  bindMatrixHover(container);
}

export function updateTeamHeaderStats(container: HTMLElement): void {
  const updateStat = (key: string, val: number) => {
    const el = queryOne<HTMLElement>(`[data-stat="${key}"] b[data-count]`, container);
    if (el) renderFilterBar(el, val);
  };

  const totalCount = liveDashboardUsers.length || store.team.length;
  const activeCount = liveDashboardUsers.filter((u) => Boolean(u.is_active)).length || totalCount;
  const seatsCap = store.settings.billing.seats || 20;

  updateStat('members', totalCount);
  updateStat('active', activeCount);
  updateStat('invited', liveDashboardUsers.filter((u) => !u.last_login_at).length);
  updateStat('seats', Math.max(0, seatsCap - activeCount));

  const suffixEl = queryOne<HTMLElement>('[data-stat="seats"] .stat__suffix', container);
  if (suffixEl) suffixEl.textContent = `of ${seatsCap}`;
}

export function updateSeatsSection(container: HTMLElement, animate = false): void {
  const billing = store.settings.billing;
  const activeCount = liveDashboardUsers.filter((u) => Boolean(u.is_active)).length || liveDashboardUsers.length || store.team.length;
  const seatsCap = billing.seats || 20;

  const usedEl = queryOne<HTMLElement>('[data-k="tm-used"]', container);
  if (usedEl) {
    animateCounter(usedEl, activeCount, formatInt, {
      from: animate ? 0 : undefined,
      duration: 1,
      delay: animate ? 0.4 : 0,
    });
  }

  const capEl = queryOne<HTMLElement>('[data-k="tm-cap"]', container);
  if (capEl) capEl.textContent = String(seatsCap);

  const planEl = queryOne<HTMLElement>('[data-k="tm-plan"]', container);
  if (planEl) {
    planEl.textContent = `${billing.plan || 'Growth'} plan · up to ${seatsCap} seats`;
  }

  const meterEl = queryOne<HTMLElement>('[data-k="tm-meter"]', container);
  if (meterEl) {
    gsap.to(meterEl, {
      scaleX: Math.min(1, activeCount / seatsCap),
      duration: motionDuration(1),
      delay: motionDuration(animate ? 0.45 : 0),
      ease: 'power3.inOut',
    });
  }
}

export function openMemberDrawer(memberId: string): void {
  const user = liveDashboardUsers.find((u) => String(u.id) === memberId);
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Staff Member';
  const roleName = user?.role_name || 'Staff';

  openDrawer(
    `<div class="d-head">${renderAvatar(memberId, 'lg')}<div><h2>${escapeHtml(fullName)}</h2><small>${escapeHtml(user?.job_title || 'Operations Staff')}</small></div></div>
    <div class="d-pills">${renderPill(user?.is_active ? 'Active' : 'Inactive', user?.is_active ? 'sage' : 'slate')}${renderPill(roleName, 'pine', 'shield')}</div>
    <div class="d-sec"><h3>Contact Information</h3><div class="rows"><a class="row" href="mailto:${escapeHtml(user?.email || '')}">${renderTag('mail', 'sky', 'sm')}<span class="row__txt"><b>${escapeHtml(user?.email || '')}</b><small>Work Email</small></span></a>${user?.phone ? `<a class="row" href="tel:${escapeHtml(user.phone)}">${renderTag('phone', 'teal', 'sm')}<span class="row__txt"><b>${escapeHtml(user.phone)}</b><small>Phone</small></span></a>` : ''}</div></div>
    <div class="d-actions"><a class="btn btn--ghost" href="mailto:${escapeHtml(user?.email || '')}">${renderIcon('mail')}Email Staff</a></div>`,
    {
      label: fullName,
      onClose: () => {
        if (window.location.pathname.startsWith('/settings/team/')) {
          history.replaceState(null, '', '/settings/team');
        }
      },
    }
  );
}

export function animateTeamSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.08 }), 0.15)
    .add(animateRows(domQueryAll('.st-mtable tbody tr', container), { y: 10, stagger: 0.035 }), 0.35);
}
