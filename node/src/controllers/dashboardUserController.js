import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../services/auditService.js';

/**
 * List All Dashboard Users (Pagination, Search, Filter)
 */
export const listDashboardUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.q ? `%${req.query.q.trim()}%` : null;
    const roleId = req.query.role_id ? parseInt(req.query.role_id) : null;
    const isActive = req.query.is_active !== undefined ? req.query.is_active === 'true' : null;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ` AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)`;
      params.push(search, search, search, search);
    }

    if (roleId) {
      whereClause += ` AND u.role_id = ?`;
      params.push(roleId);
    }

    if (isActive !== null) {
      whereClause += ` AND u.is_active = ?`;
      params.push(isActive);
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM dashboard_users u ${whereClause};`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Get users with role info and creator info
    const query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, 
        u.role_id, r.name as role_name,
        u.is_active, u.created_by_admin_id, 
        CONCAT(a.first_name, ' ', COALESCE(a.last_name, '')) as created_by_name,
        u.last_login_at, u.created_at, u.updated_at
      FROM dashboard_users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN admin_users a ON u.created_by_admin_id = a.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?;
    `;

    const [users] = await pool.query(query, [...params, limit, offset]);

    return sendSuccess(res, 200, 'Dashboard users retrieved successfully.', users, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('List Dashboard Users Error:', err);
    return sendError(res, 500, 'Failed to retrieve dashboard users.');
  }
};

/**
 * Get Single Dashboard User Details
 */
export const getDashboardUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, 
        u.role_id, r.name as role_name,
        u.is_active, u.created_by_admin_id,
        u.last_login_at, u.created_at, u.updated_at
      FROM dashboard_users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? LIMIT 1;
    `;

    const [users] = await pool.query(query, [id]);

    if (users.length === 0) {
      return sendError(res, 404, `Dashboard user with ID ${id} not found.`);
    }

    // Fetch user's permissions
    const [perms] = await pool.query(
      `SELECT p.id, p.code, p.module, p.description 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?;`,
      [users[0].role_id]
    );

    return sendSuccess(res, 200, 'User details retrieved.', {
      ...users[0],
      permissions: perms
    });
  } catch (err) {
    console.error('Get Dashboard User Error:', err);
    return sendError(res, 500, 'Failed to retrieve dashboard user.');
  }
};

/**
 * Create New Dashboard User (Superadmin Only)
 */
export const createDashboardUser = async (req, res) => {
  const { email, password, first_name, last_name, phone, role_id } = req.body;

  if (!email || !password || !first_name || !role_id) {
    return sendError(res, 400, 'Email, password, first_name, and role_id are required fields.');
  }

  if (password.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters long.');
  }

  try {
    // 1. Check if email already exists in dashboard_users or admin_users
    const [existing] = await pool.query(`SELECT id FROM dashboard_users WHERE email = ? LIMIT 1;`, [
      email.toLowerCase().trim()
    ]);
    if (existing.length > 0) {
      return sendError(res, 409, 'A dashboard user with this email address already exists.');
    }

    // 2. Validate role exists
    const [role] = await pool.query(`SELECT id, name FROM roles WHERE id = ? LIMIT 1;`, [role_id]);
    if (role.length === 0) {
      return sendError(res, 400, `Specified role_id (${role_id}) does not exist.`);
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insert User
    const [result] = await pool.query(
      `INSERT INTO dashboard_users (email, password_hash, first_name, last_name, phone, role_id, created_by_admin_id)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        email.toLowerCase().trim(),
        passwordHash,
        first_name.trim(),
        last_name ? last_name.trim() : null,
        phone ? phone.trim() : null,
        role_id,
        req.user.id
      ]
    );

    const newUserId = result.insertId;

    // 5. Audit Log
    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: req.user.id,
      action: 'CREATE_DASHBOARD_USER',
      resource: 'dashboard_users',
      resourceId: newUserId,
      payloadAfter: { id: newUserId, email, first_name, role_id },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 201, 'Dashboard user created successfully.', {
      id: newUserId,
      email: email.toLowerCase().trim(),
      firstName: first_name,
      lastName: last_name || null,
      phone: phone || null,
      roleId: role_id,
      roleName: role[0].name,
      isActive: true
    });
  } catch (err) {
    console.error('Create Dashboard User Error:', err);
    return sendError(res, 500, 'Failed to create dashboard user.');
  }
};

/**
 * Update Dashboard User Details
 */
export const updateDashboardUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone, role_id } = req.body;

  try {
    const [existing] = await pool.query(`SELECT * FROM dashboard_users WHERE id = ? LIMIT 1;`, [id]);
    if (existing.length === 0) {
      return sendError(res, 404, `Dashboard user with ID ${id} not found.`);
    }

    const currentUser = existing[0];

    // If role changed, validate role
    if (role_id && role_id !== currentUser.role_id) {
      const [role] = await pool.query(`SELECT id FROM roles WHERE id = ? LIMIT 1;`, [role_id]);
      if (role.length === 0) {
        return sendError(res, 400, `Role with ID ${role_id} does not exist.`);
      }
    }

    const updatedFirstName = first_name !== undefined ? first_name.trim() : currentUser.first_name;
    const updatedLastName = last_name !== undefined ? (last_name ? last_name.trim() : null) : currentUser.last_name;
    const updatedPhone = phone !== undefined ? (phone ? phone.trim() : null) : currentUser.phone;
    const updatedRoleId = role_id !== undefined ? role_id : currentUser.role_id;

    await pool.query(
      `UPDATE dashboard_users 
       SET first_name = ?, last_name = ?, phone = ?, role_id = ? 
       WHERE id = ?;`,
      [updatedFirstName, updatedLastName, updatedPhone, updatedRoleId, id]
    );

    // If role changed, revoke current sessions so new permissions take effect
    if (role_id && role_id !== currentUser.role_id) {
      await pool.query(
        `UPDATE sessions SET is_revoked = TRUE WHERE user_type = 'DASHBOARD_USER' AND user_id = ?;`,
        [id]
      );
    }

    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: req.user.id,
      action: 'UPDATE_DASHBOARD_USER',
      resource: 'dashboard_users',
      resourceId: id,
      payloadBefore: { first_name: currentUser.first_name, role_id: currentUser.role_id },
      payloadAfter: { first_name: updatedFirstName, role_id: updatedRoleId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 200, 'Dashboard user updated successfully.', {
      id: Number(id),
      firstName: updatedFirstName,
      lastName: updatedLastName,
      phone: updatedPhone,
      roleId: updatedRoleId
    });
  } catch (err) {
    console.error('Update Dashboard User Error:', err);
    return sendError(res, 500, 'Failed to update dashboard user.');
  }
};

/**
 * Superadmin Manual Password Reset for Dashboard User
 */
export const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    return sendError(res, 400, 'New password is required and must be at least 6 characters long.');
  }

  try {
    const [existing] = await pool.query(`SELECT id, email FROM dashboard_users WHERE id = ? LIMIT 1;`, [id]);
    if (existing.length === 0) {
      return sendError(res, 404, `Dashboard user with ID ${id} not found.`);
    }

    // 1. Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    // 2. Update password
    await pool.query(`UPDATE dashboard_users SET password_hash = ? WHERE id = ?;`, [passwordHash, id]);

    // 3. Revoke all active sessions for this user to force login with new password
    await pool.query(
      `UPDATE sessions SET is_revoked = TRUE WHERE user_type = 'DASHBOARD_USER' AND user_id = ?;`,
      [id]
    );

    // 4. Audit Log
    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: req.user.id,
      action: 'MANUAL_PASSWORD_RESET',
      resource: 'dashboard_users',
      resourceId: id,
      payloadAfter: { target_user_email: existing[0].email, sessions_revoked: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 200, `Password for user ${existing[0].email} has been reset successfully. Active sessions revoked.`);
  } catch (err) {
    console.error('Password Reset Error:', err);
    return sendError(res, 500, 'Failed to reset password.');
  }
};

/**
 * Toggle Dashboard User Status (Active / Inactive)
 */
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return sendError(res, 400, 'is_active boolean field is required.');
  }

  try {
    const [existing] = await pool.query(`SELECT id, email, is_active FROM dashboard_users WHERE id = ? LIMIT 1;`, [id]);
    if (existing.length === 0) {
      return sendError(res, 404, `Dashboard user with ID ${id} not found.`);
    }

    await pool.query(`UPDATE dashboard_users SET is_active = ? WHERE id = ?;`, [is_active, id]);

    // If deactivated, immediately revoke all active sessions
    if (!is_active) {
      await pool.query(
        `UPDATE sessions SET is_revoked = TRUE WHERE user_type = 'DASHBOARD_USER' AND user_id = ?;`,
        [id]
      );
    }

    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: req.user.id,
      action: is_active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      resource: 'dashboard_users',
      resourceId: id,
      payloadBefore: { is_active: existing[0].is_active },
      payloadAfter: { is_active },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 200, `Dashboard user account ${is_active ? 'activated' : 'deactivated'} successfully.`, {
      id: Number(id),
      email: existing[0].email,
      isActive: is_active
    });
  } catch (err) {
    console.error('Toggle User Status Error:', err);
    return sendError(res, 500, 'Failed to update user status.');
  }
};
