import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../services/auditService.js';

/**
 * List All Roles with Attached Permissions
 */
export const listRoles = async (req, res) => {
  try {
    const [roles] = await pool.query(`SELECT id, name, description, is_system, created_at FROM roles ORDER BY id ASC;`);

    // Fetch permissions for each role
    const [allRolePerms] = await pool.query(`
      SELECT rp.role_id, p.id as permission_id, p.code, p.module, p.description
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id;
    `);

    // Group permissions by role_id
    const permsByRole = {};
    allRolePerms.forEach((rp) => {
      if (!permsByRole[rp.role_id]) permsByRole[rp.role_id] = [];
      permsByRole[rp.role_id].push({
        id: rp.permission_id,
        code: rp.code,
        module: rp.module,
        description: rp.description
      });
    });

    const result = roles.map((role) => ({
      ...role,
      permissionsCount: permsByRole[role.id]?.length || 0,
      permissions: permsByRole[role.id] || []
    }));

    return sendSuccess(res, 200, 'Roles retrieved successfully.', result);
  } catch (err) {
    console.error('List Roles Error:', err);
    return sendError(res, 500, 'Failed to retrieve roles.');
  }
};

/**
 * Get Role Details
 */
export const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const [roles] = await pool.query(`SELECT id, name, description, is_system, created_at FROM roles WHERE id = ? LIMIT 1;`, [id]);
    if (roles.length === 0) {
      return sendError(res, 404, `Role with ID ${id} not found.`);
    }

    const [perms] = await pool.query(
      `SELECT p.id, p.code, p.module, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?;`,
      [id]
    );

    return sendSuccess(res, 200, 'Role retrieved successfully.', {
      ...roles[0],
      permissions: perms
    });
  } catch (err) {
    console.error('Get Role Error:', err);
    return sendError(res, 500, 'Failed to retrieve role details.');
  }
};

/**
 * Create Custom Role
 */
export const createRole = async (req, res) => {
  const { name, description, permission_ids } = req.body;

  if (!name || name.trim().length === 0) {
    return sendError(res, 400, 'Role name is required.');
  }

  try {
    const [existing] = await pool.query(`SELECT id FROM roles WHERE name = ? LIMIT 1;`, [name.trim()]);
    if (existing.length > 0) {
      return sendError(res, 409, `A role named "${name.trim()}" already exists.`);
    }

    // Insert Role
    const [result] = await pool.query(
      `INSERT INTO roles (name, description, is_system) VALUES (?, ?, FALSE);`,
      [name.trim(), description ? description.trim() : null]
    );
    const newRoleId = result.insertId;

    // Attach Permissions if provided
    if (Array.isArray(permission_ids) && permission_ids.length > 0) {
      const values = permission_ids.map((permId) => [newRoleId, permId]);
      await pool.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES ?;`, [values]);
    }

    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: req.user.id,
      action: 'CREATE_ROLE',
      resource: 'roles',
      resourceId: newRoleId,
      payloadAfter: { id: newRoleId, name, permission_ids },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 201, 'Role created successfully.', {
      id: newRoleId,
      name: name.trim(),
      description: description || null,
      isSystem: false,
      permissionCount: Array.isArray(permission_ids) ? permission_ids.length : 0
    });
  } catch (err) {
    console.error('Create Role Error:', err);
    return sendError(res, 500, 'Failed to create role.');
  }
};

/**
 * Update Role
 */
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, permission_ids } = req.body;

  try {
    const [existing] = await pool.query(`SELECT * FROM roles WHERE id = ? LIMIT 1;`, [id]);
    if (existing.length === 0) {
      return sendError(res, 404, `Role with ID ${id} not found.`);
    }

    const currentRole = existing[0];

    // Cannot rename system roles
    let updatedName = currentRole.name;
    if (name && name.trim() !== currentRole.name) {
      if (currentRole.is_system) {
        return sendError(res, 400, 'Cannot rename predefined system roles.');
      }
      updatedName = name.trim();
    }

    const updatedDesc = description !== undefined ? description : currentRole.description;

    await pool.query(`UPDATE roles SET name = ?, description = ? WHERE id = ?;`, [
      updatedName,
      updatedDesc,
      id
    ]);

    // Update permissions if provided
    if (Array.isArray(permission_ids)) {
      // Clear current permissions and insert new ones
      await pool.query(`DELETE FROM role_permissions WHERE role_id = ?;`, [id]);
      if (permission_ids.length > 0) {
        const values = permission_ids.map((permId) => [id, permId]);
        await pool.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES ?;`, [values]);
      }

      // Invalidate active sessions for users with this role so their token refreshes permissions
      await pool.query(
        `UPDATE sessions SET is_revoked = TRUE 
         WHERE user_type = 'DASHBOARD_USER' 
           AND user_id IN (SELECT id FROM dashboard_users WHERE role_id = ?);`,
        [id]
      );
    }

    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: req.user.id,
      action: 'UPDATE_ROLE',
      resource: 'roles',
      resourceId: id,
      payloadAfter: { id, name: updatedName, permissionsCount: permission_ids?.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 200, 'Role updated successfully.', {
      id: Number(id),
      name: updatedName,
      description: updatedDesc
    });
  } catch (err) {
    console.error('Update Role Error:', err);
    return sendError(res, 500, 'Failed to update role.');
  }
};

/**
 * Delete Custom Role
 */
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query(`SELECT * FROM roles WHERE id = ? LIMIT 1;`, [id]);
    if (existing.length === 0) {
      return sendError(res, 404, `Role with ID ${id} not found.`);
    }

    if (existing[0].is_system) {
      return sendError(res, 403, 'System roles cannot be deleted.');
    }

    // Check if any dashboard users have this role
    const [assignedUsers] = await pool.query(`SELECT COUNT(*) as count FROM dashboard_users WHERE role_id = ?;`, [id]);
    if (assignedUsers[0]?.count > 0) {
      return sendError(
        res,
        400,
        `Cannot delete role. It is currently assigned to ${assignedUsers[0].count} active dashboard user(s). Reassign them first.`
      );
    }

    await pool.query(`DELETE FROM roles WHERE id = ?;`, [id]);

    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: req.user.id,
      action: 'DELETE_ROLE',
      resource: 'roles',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 200, `Role "${existing[0].name}" deleted successfully.`);
  } catch (err) {
    console.error('Delete Role Error:', err);
    return sendError(res, 500, 'Failed to delete role.');
  }
};

/**
 * List All Available Permissions Grouped by Module
 */
export const listPermissions = async (req, res) => {
  try {
    const [permissions] = await pool.query(`SELECT id, code, module, description FROM permissions ORDER BY module ASC, id ASC;`);

    // Group by module
    const grouped = {};
    permissions.forEach((perm) => {
      if (!grouped[perm.module]) grouped[perm.module] = [];
      grouped[perm.module].push(perm);
    });

    return sendSuccess(res, 200, 'Permissions retrieved successfully.', {
      total: permissions.length,
      modules: grouped,
      list: permissions
    });
  } catch (err) {
    console.error('List Permissions Error:', err);
    return sendError(res, 500, 'Failed to retrieve permissions.');
  }
};
