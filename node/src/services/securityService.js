import pool from '../config/db.js';

const LOCKOUT_THRESHOLD = 5; // 5 failed attempts
const LOCKOUT_WINDOW_MINUTES = 15; // 15-minute window

export const checkLockout = async (email, ipAddress) => {
  try {
    const query = `
      SELECT COUNT(*) as failed_count, MAX(attempted_at) as last_attempt
      FROM login_attempts
      WHERE email = ? 
        AND ip_address = ? 
        AND is_successful = FALSE
        AND attempted_at > (NOW() - INTERVAL ? MINUTE);
    `;

    const [rows] = await pool.query(query, [email, ipAddress, LOCKOUT_WINDOW_MINUTES]);
    const failedCount = rows[0]?.failed_count || 0;

    if (failedCount >= LOCKOUT_THRESHOLD) {
      const lastAttempt = new Date(rows[0].last_attempt);
      const unlockTime = new Date(lastAttempt.getTime() + LOCKOUT_WINDOW_MINUTES * 60 * 1000);
      const remainingMinutes = Math.max(1, Math.ceil((unlockTime - new Date()) / (60 * 1000)));

      return {
        isLocked: true,
        remainingMinutes,
        message: `Account temporarily locked due to multiple failed attempts. Try again in ${remainingMinutes} minute(s).`
      };
    }

    return { isLocked: false, remainingAttempts: LOCKOUT_THRESHOLD - failedCount };
  } catch (err) {
    console.error('Lockout check error:', err.message);
    return { isLocked: false };
  }
};

export const recordLoginAttempt = async (email, ipAddress, userType, isSuccessful) => {
  try {
    const query = `
      INSERT INTO login_attempts (email, ip_address, user_type, is_successful, attempted_at)
      VALUES (?, ?, ?, ?, NOW());
    `;
    await pool.query(query, [email, ipAddress, userType, isSuccessful]);
  } catch (err) {
    console.error('Failed to record login attempt:', err.message);
  }
};
