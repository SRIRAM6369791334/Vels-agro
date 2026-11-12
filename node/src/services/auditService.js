import pool from '../config/db.js';

export const logAudit = async ({
  actorType = 'SYSTEM',
  actorId = null,
  action,
  resource,
  resourceId = null,
  payloadBefore = null,
  payloadAfter = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    const query = `
      INSERT INTO audit_logs 
      (actor_type, actor_id, action, resource, resource_id, payload_before, payload_after, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const beforeJson = payloadBefore ? JSON.stringify(payloadBefore) : null;
    const afterJson = payloadAfter ? JSON.stringify(payloadAfter) : null;

    await pool.query(query, [
      actorType,
      actorId,
      action,
      resource,
      resourceId ? String(resourceId) : null,
      beforeJson,
      afterJson,
      ipAddress,
      userAgent
    ]);
  } catch (err) {
    console.error('Audit Logging Failed (Non-blocking):', err.message);
  }
};
