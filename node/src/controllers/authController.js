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
    // 1. Check if email exists in admin_users
    const [admins] = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, phone, is_active FROM admin_users WHERE email = ? LIMIT 1;`,
      [cleanEmail]
    );

    if (admins.length > 0) {
      const admin = admins[0];
      const lockout = await checkLockout(cleanEmail, ipAddress, 'SUPER_ADMIN');
      if (lockout.isLocked) {
        return sendError(res, 429, lockout.message);
      }

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
        return sendError(res, 429, lockout.message);
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
      return sendError(res, 429, lockout.message);
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
      return sendError(res, 429, lockout.message);
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
  return sendSuccess(res, 200, 'Current profile retrieved.', {
    user: req.user
  });
};
