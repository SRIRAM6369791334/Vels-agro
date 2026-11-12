import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get Paginated Audit Logs (Fast Indexed Query)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    const actorType = req.query.actor_type || null;
    const action = req.query.action || null;
    const resource = req.query.resource || null;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (actorType) {
      whereClause += ' AND actor_type = ?';
      params.push(actorType);
    }

    if (action) {
      whereClause += ' AND action = ?';
      params.push(action);
    }

    if (resource) {
      whereClause += ' AND resource = ?';
      params.push(resource);
    }

    // Fast count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause};`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Fast indexed query
    const query = `
      SELECT id, actor_type, actor_id, action, resource, resource_id, 
             payload_before, payload_after, ip_address, user_agent, created_at
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?;
    `;

    const [logs] = await pool.query(query, [...params, limit, offset]);

    return sendSuccess(res, 200, 'Audit logs retrieved successfully.', logs, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Get Audit Logs Error:', err);
    return sendError(res, 500, 'Failed to retrieve audit logs.');
  }
};

/**
 * Get Recent Login Attempts & Lockout Status
 */
export const getLoginAttempts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;
    const isSuccessful = req.query.is_successful !== undefined ? req.query.is_successful === 'true' : null;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (isSuccessful !== null) {
      whereClause += ' AND is_successful = ?';
      params.push(isSuccessful);
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM login_attempts ${whereClause};`, params);
    const total = countResult[0]?.total || 0;

    const query = `
      SELECT id, email, ip_address, user_type, is_successful, attempted_at
      FROM login_attempts
      ${whereClause}
      ORDER BY attempted_at DESC
      LIMIT ? OFFSET ?;
    `;

    const [attempts] = await pool.query(query, [...params, limit, offset]);

    return sendSuccess(res, 200, 'Login attempts retrieved successfully.', attempts, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Get Login Attempts Error:', err);
    return sendError(res, 500, 'Failed to retrieve login attempts.');
  }
};
