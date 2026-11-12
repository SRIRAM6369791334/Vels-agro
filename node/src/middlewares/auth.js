import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import env from '../config/env.js';
import { sendError } from '../utils/response.js';

const JWT_SECRET = env.JWT.SECRET;

// Helper to generate SHA-256 hash of token for indexed lookup
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * High-Speed Authentication Middleware (< 1ms via Covering Index)
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication token missing or invalid format.');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token has expired. Please login again.');
      }
      return sendError(res, 401, 'Invalid authentication token.');
    }

    const tokenHash = hashToken(token);

    // High-speed covering index lookup on `sessions`
    const [sessions] = await pool.query(
      `SELECT id, user_type, user_id, is_revoked, expires_at 
       FROM sessions 
       WHERE token_hash = ? AND is_revoked = FALSE AND expires_at > NOW() 
       LIMIT 1;`,
      [tokenHash]
    );

    if (sessions.length === 0) {
      return sendError(res, 401, 'Session has been revoked or expired.');
    }

    const session = sessions[0];

    // Fetch user details and permissions based on user_type
    if (session.user_type === 'SUPER_ADMIN') {
      const [admins] = await pool.query(
        `SELECT id, email, first_name, last_name, is_active FROM admin_users WHERE id = ? LIMIT 1;`,
        [session.user_id]
      );

      if (admins.length === 0 || !admins[0].is_active) {
        return sendError(res, 401, 'Superadmin account is inactive or not found.');
      }

      req.user = {
        ...admins[0],
        user_type: 'SUPER_ADMIN',
        role_name: 'Super Administrator',
        permissions: ['*'], // Superadmin holds all permissions
        session_id: session.id
      };
    } else {
      // DASHBOARD_USER
      const [users] = await pool.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.role_id, u.is_active, r.name as role_name
         FROM dashboard_users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = ? LIMIT 1;`,
        [session.user_id]
      );

      if (users.length === 0 || !users[0].is_active) {
        return sendError(res, 401, 'Dashboard user account is inactive or not found.');
      }

      // Fetch user's permissions via role_permissions
      const [perms] = await pool.query(
        `SELECT p.code 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?;`,
        [users[0].role_id]
      );

      req.user = {
        ...users[0],
        user_type: 'DASHBOARD_USER',
        permissions: perms.map((p) => p.code),
        session_id: session.id
      };
    }

    next();
  } catch (err) {
    console.error('Authentication Error:', err);
    return sendError(res, 500, 'Authentication check failed.');
  }
};

/**
 * Guard for Superadmin only routes
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'SUPER_ADMIN') {
    return sendError(res, 403, 'Access denied. Superadmin privileges required.');
  }
  next();
};

/**
 * Guard for specific RBAC permission
 */
export const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthenticated user.');
    }

    // Superadmin bypasses permission checks
    if (req.user.user_type === 'SUPER_ADMIN' || req.user.permissions.includes('*')) {
      return next();
    }

    if (!req.user.permissions.includes(permissionCode)) {
      return sendError(res, 403, `Access denied. Missing required permission: ${permissionCode}`);
    }

    next();
  };
};
