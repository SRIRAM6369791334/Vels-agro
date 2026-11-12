import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import env from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { checkLockout, recordLoginAttempt } from '../services/securityService.js';
import { logAudit } from '../services/auditService.js';
import { hashToken } from '../middlewares/auth.js';

const JWT_SECRET = env.JWT.SECRET;
const JWT_EXPIRES_IN = env.JWT.EXPIRES_IN;

/**
 * Unified Login Gateway
 * Automatically authenticates Superadmin or Dashboard Staff in a single round-trip
 * Prevents false lockout attempts and duplicate network requests
 */
export const unifiedLogin = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required.');
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 0. Pre-emptive Lockout Check (protects against brute-force across all roles)
    const lockout = await checkLockout(cleanEmail, ipAddress);
    if (lockout.isLocked) {
      return sendError(res, 429, lockout.message, null, {
        remainingSeconds: lockout.remainingSeconds,
        remainingMinutes: lockout.remainingMinutes,
        unlockAt: lockout.unlockAt
      });
    }

    // 1. Check if email exists in admin_users
    const [admins] = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, phone, is_active FROM admin_users WHERE email = ? LIMIT 1;`,
      [cleanEmail]
    );

    if (admins.length > 0) {
      const admin = admins[0];

      if (!admin.is_active) {
        return sendError(res, 403, 'Your Superadmin account has been deactivated.');
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      if (!isPasswordValid) {
        await recordLoginAttempt(cleanEmail, ipAddress, 'SUPER_ADMIN', false);
        return sendError(res, 401, 'Invalid email or password.');
      }

      await recordLoginAttempt(cleanEmail, ipAddress, 'SUPER_ADMIN', true);

      const token = jwt.sign(
        { id: admin.id, email: admin.email, user_type: 'SUPER_ADMIN', jti: crypto.randomUUID() },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const sessionId = crypto.randomUUID();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO sessions (id, user_type, user_id, token_hash, ip_address, user_agent, expires_at)
         VALUES (?, 'SUPER_ADMIN', ?, ?, ?, ?, ?);`,
        [sessionId, admin.id, tokenHash, ipAddress, userAgent, expiresAt]
      );

      await pool.query(`UPDATE admin_users SET last_login_at = NOW() WHERE id = ?;`, [admin.id]);

      await logAudit({
        actorType: 'SUPER_ADMIN',
        actorId: admin.id,
        action: 'LOGIN',
        resource: 'admin_users',
        resourceId: admin.id,
        ipAddress,
        userAgent
      });

      const userObj = {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        phone: admin.phone,
        userType: 'SUPER_ADMIN',
        role: 'Super Administrator',
        permissions: ['*']
      };

      return sendSuccess(res, 200, 'Superadmin login successful.', {
        token,
        user: userObj,
        admin: userObj
      });
    }

    // 2. Check if email exists in dashboard_users
    const [staffs] = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.phone, u.role_id, u.is_active, r.name as role_name
       FROM dashboard_users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? LIMIT 1;`,
      [cleanEmail]
    );

    if (staffs.length > 0) {
      const user = staffs[0];
      const lockout = await checkLockout(cleanEmail, ipAddress, 'DASHBOARD_USER');
      if (lockout.isLocked) {
        return sendError(res, 429, lockout.message, null, {
          remainingSeconds: lockout.remainingSeconds,
          remainingMinutes: lockout.remainingMinutes,
          unlockAt: lockout.unlockAt
        });
      }

      if (!user.is_active) {
        return sendError(res, 403, 'Your dashboard staff account has been deactivated. Please contact your Superadmin.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        await recordLoginAttempt(cleanEmail, ipAddress, 'DASHBOARD_USER', false);
        return sendError(res, 401, 'Invalid email or password.');
      }

      await recordLoginAttempt(cleanEmail, ipAddress, 'DASHBOARD_USER', true);

      const [permissions] = await pool.query(
        `SELECT p.code 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?;`,
        [user.role_id]
      );
      const permCodes = permissions.map((p) => p.code);

      const token = jwt.sign(
        { id: user.id, email: user.email, user_type: 'DASHBOARD_USER', role_id: user.role_id, jti: crypto.randomUUID() },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const sessionId = crypto.randomUUID();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO sessions (id, user_type, user_id, token_hash, ip_address, user_agent, expires_at)
         VALUES (?, 'DASHBOARD_USER', ?, ?, ?, ?, ?);`,
        [sessionId, user.id, tokenHash, ipAddress, userAgent, expiresAt]
      );

      await pool.query(`UPDATE dashboard_users SET last_login_at = NOW() WHERE id = ?;`, [user.id]);

      await logAudit({
        actorType: 'DASHBOARD_USER',
        actorId: user.id,
        action: 'LOGIN',
        resource: 'dashboard_users',
        resourceId: user.id,
        ipAddress,
        userAgent
      });

      const userObj = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        roleId: user.role_id,
        roleName: user.role_name,
        userType: 'DASHBOARD_USER',
        permissions: permCodes
      };

      return sendSuccess(res, 200, 'Dashboard login successful.', {
        token,
        user: userObj
      });
    }

    // 3. User not found in either table -> Record single failed attempt
    await recordLoginAttempt(cleanEmail, ipAddress, 'DASHBOARD_USER', false);
    return sendError(res, 401, 'Invalid email or password.');
  } catch (err) {
    console.error('Unified Login Error:', err);
    return sendError(res, 500, 'An unexpected error occurred during login.');
  }
};

/**
 * Superadmin Login
 */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required.');
  }

  try {
    // 1. Check Brute-Force Lockout (isolated to Superadmin attempts)
    const lockout = await checkLockout(email, ipAddress, 'SUPER_ADMIN');
    if (lockout.isLocked) {
      return sendError(res, 429, lockout.message, null, {
        remainingSeconds: lockout.remainingSeconds,
        remainingMinutes: lockout.remainingMinutes,
        unlockAt: lockout.unlockAt
      });
    }

    // 2. Query admin_users
    const [admins] = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, phone, is_active FROM admin_users WHERE email = ? LIMIT 1;`,
      [email.toLowerCase().trim()]
    );

    if (admins.length === 0) {
      await recordLoginAttempt(email, ipAddress, 'SUPER_ADMIN', false);
      return sendError(res, 401, 'Invalid email or password.');
    }

    const admin = admins[0];

    if (!admin.is_active) {
      return sendError(res, 403, 'Your Superadmin account has been deactivated.');
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      await recordLoginAttempt(email, ipAddress, 'SUPER_ADMIN', false);
      return sendError(res, 401, 'Invalid email or password.');
    }

    // 4. Record successful login
    await recordLoginAttempt(email, ipAddress, 'SUPER_ADMIN', true);

    // 5. Generate JWT Token with unique RFC-compliant jti (prevents duplicate tokens/hashes)
    const token = jwt.sign(
      { id: admin.id, email: admin.email, user_type: 'SUPER_ADMIN', jti: crypto.randomUUID() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 6. Create Session in sessions table
    const sessionId = crypto.randomUUID();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    await pool.query(
      `INSERT INTO sessions (id, user_type, user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, 'SUPER_ADMIN', ?, ?, ?, ?, ?);`,
      [sessionId, admin.id, tokenHash, ipAddress, userAgent, expiresAt]
    );

    // 7. Update last_login_at
    await pool.query(`UPDATE admin_users SET last_login_at = NOW() WHERE id = ?;`, [admin.id]);

    // 8. Audit Log
    await logAudit({
      actorType: 'SUPER_ADMIN',
      actorId: admin.id,
      action: 'LOGIN',
      resource: 'admin_users',
      resourceId: admin.id,
      ipAddress,
      userAgent
    });

    const adminData = {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      phone: admin.phone,
      userType: 'SUPER_ADMIN',
      role: 'Super Administrator',
      permissions: ['*']
    };

    return sendSuccess(res, 200, 'Superadmin login successful.', {
      token,
      user: adminData,
      admin: adminData
    });
  } catch (err) {
    console.error('Superadmin Login Error:', err);
    return sendError(res, 500, 'An unexpected error occurred during login.');
  }
};

/**
 * Dashboard Staff User Login
 */
export const dashboardLogin = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required.');
  }

  try {
    // 1. Check Brute-Force Lockout (isolated to Dashboard User attempts)
    const lockout = await checkLockout(email, ipAddress, 'DASHBOARD_USER');
    if (lockout.isLocked) {
      return sendError(res, 429, lockout.message, null, {
        remainingSeconds: lockout.remainingSeconds,
        remainingMinutes: lockout.remainingMinutes,
        unlockAt: lockout.unlockAt
      });
    }

    // 2. Query dashboard_users with Role info
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.phone, u.role_id, u.is_active, r.name as role_name
       FROM dashboard_users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? LIMIT 1;`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      await recordLoginAttempt(email, ipAddress, 'DASHBOARD_USER', false);
      return sendError(res, 401, 'Invalid email or password.');
    }

    const user = users[0];

    if (!user.is_active) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact Superadmin.');
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      await recordLoginAttempt(email, ipAddress, 'DASHBOARD_USER', false);
      return sendError(res, 401, 'Invalid email or password.');
    }

    // 4. Record successful login
    await recordLoginAttempt(email, ipAddress, 'DASHBOARD_USER', true);

    // 5. Fetch Role Permissions
    const [permissions] = await pool.query(
      `SELECT p.code 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?;`,
      [user.role_id]
    );
    const permCodes = permissions.map((p) => p.code);

    // 6. Generate JWT Token with unique RFC-compliant jti (prevents duplicate tokens/hashes)
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: 'DASHBOARD_USER', role_id: user.role_id, jti: crypto.randomUUID() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 7. Create Session
    const sessionId = crypto.randomUUID();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO sessions (id, user_type, user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, 'DASHBOARD_USER', ?, ?, ?, ?, ?);`,
      [sessionId, user.id, tokenHash, ipAddress, userAgent, expiresAt]
    );

    // 8. Update last_login_at
    await pool.query(`UPDATE dashboard_users SET last_login_at = NOW() WHERE id = ?;`, [user.id]);

    // 9. Audit Log
    await logAudit({
      actorType: 'DASHBOARD_USER',
      actorId: user.id,
      action: 'LOGIN',
      resource: 'dashboard_users',
      resourceId: user.id,
      ipAddress,
      userAgent
    });

    return sendSuccess(res, 200, 'Dashboard login successful.', {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        roleId: user.role_id,
        roleName: user.role_name,
        permissions: permCodes
      }
    });
  } catch (err) {
    console.error('Dashboard User Login Error:', err);
    return sendError(res, 500, 'An unexpected error occurred during login.');
  }
};

/**
 * Logout (Revoke Active Session)
 */
export const logout = async (req, res) => {
  try {
    const sessionId = req.user.session_id;

    if (sessionId) {
      await pool.query(`UPDATE sessions SET is_revoked = TRUE WHERE id = ?;`, [sessionId]);
    }

    await logAudit({
      actorType: req.user.user_type,
      actorId: req.user.id,
      action: 'LOGOUT',
      resource: 'sessions',
      resourceId: sessionId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    console.error('Logout Error:', err);
    return sendError(res, 500, 'Logout failed.');
  }
};

/**
 * Get Current Authenticated Profile
 */
export const getMe = async (req, res) => {
  const user = req.user;
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return sendSuccess(res, 200, 'Current profile retrieved.', {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: fullName || user.email.split('@')[0],
      jobTitle: user.job_title || (user.user_type === 'SUPER_ADMIN' ? 'Super Administrator' : 'Operations Staff'),
      phone: user.phone || '',
      roleName: user.role_name || (user.user_type === 'SUPER_ADMIN' ? 'Super Administrator' : 'Staff'),
      roleId: user.role_id || null,
      userType: user.user_type,
      permissions: user.permissions || [],
      isActive: Boolean(user.is_active),
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at
    }
  });
};

/**
 * Update Current Authenticated Profile
 */
export const updateMe = async (req, res) => {
  const user = req.user;
  const { firstName, lastName, name, phone, jobTitle, email } = req.body;

  // Strict Security Validation: Work email is immutable and cannot be changed
  if (email !== undefined && String(email).trim().toLowerCase() !== user.email.trim().toLowerCase()) {
    return sendError(
      res,
      400,
      'Work email cannot be modified for security reasons. Your email is your permanent account identity.'
    );
  }

  let fName = firstName;
  let lName = lastName;

  // Split single 'name' if provided
  if (name !== undefined && firstName === undefined && lastName === undefined) {
    const parts = name.trim().split(/\s+/);
    fName = parts[0] || '';
    lName = parts.slice(1).join(' ') || '';
  }

  try {
    const table = user.user_type === 'SUPER_ADMIN' ? 'admin_users' : 'dashboard_users';
    const updates = [];
    const params = [];

    if (fName !== undefined) { updates.push('first_name = ?'); params.push(fName); }
    if (lName !== undefined) { updates.push('last_name = ?'); params.push(lName); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (jobTitle !== undefined) { updates.push('job_title = ?'); params.push(jobTitle); }

    if (updates.length > 0) {
      params.push(user.id);
      await pool.query(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?;`, params);
    }

    const [rows] = await pool.query(
      `SELECT id, email, first_name, last_name, phone, job_title, is_active, last_login_at, created_at 
       FROM ${table} WHERE id = ? LIMIT 1;`,
      [user.id]
    );

    const updated = rows[0];
    const updatedFullName = `${updated.first_name || ''} ${updated.last_name || ''}`.trim();

    const result = {
      id: updated.id,
      email: updated.email,
      firstName: updated.first_name,
      lastName: updated.last_name,
      name: updatedFullName || updated.email.split('@')[0],
      jobTitle: updated.job_title || (user.user_type === 'SUPER_ADMIN' ? 'Super Administrator' : 'Operations Staff'),
      phone: updated.phone || '',
      roleName: user.role_name || (user.user_type === 'SUPER_ADMIN' ? 'Super Administrator' : 'Staff'),
      roleId: user.role_id || null,
      userType: user.user_type,
      permissions: user.permissions || [],
      isActive: Boolean(updated.is_active),
      lastLoginAt: updated.last_login_at,
      createdAt: updated.created_at
    };

    return sendSuccess(res, 200, 'Profile updated successfully.', { user: result });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return sendError(res, 500, 'Failed to update user profile.');
  }
};

/**
 * Get Active Sessions for Current User
 */
export const getMySessions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_agent, ip_address, created_at, expires_at,
              CASE WHEN id = ? THEN TRUE ELSE FALSE END as is_current
       FROM sessions
       WHERE user_type = ? AND user_id = ? AND is_revoked = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC;`,
      [req.user.session_id, req.user.user_type, req.user.id]
    );

    return sendSuccess(res, 200, 'Active sessions retrieved.', { sessions: rows });
  } catch (err) {
    console.error('Get Sessions Error:', err);
    return sendError(res, 500, 'Failed to fetch active sessions.');
  }
};

/**
 * Revoke Other Active Sessions
 */
export const revokeOtherSessions = async (req, res) => {
  try {
    await pool.query(
      `UPDATE sessions SET is_revoked = TRUE 
       WHERE user_type = ? AND user_id = ? AND id != ? AND is_revoked = FALSE;`,
      [req.user.user_type, req.user.id, req.user.session_id]
    );

    return sendSuccess(res, 200, 'Other active sessions signed out successfully.');
  } catch (err) {
    console.error('Revoke Sessions Error:', err);
    return sendError(res, 500, 'Failed to revoke other sessions.');
  }
};
