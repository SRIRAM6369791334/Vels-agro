import pool from '../config/db.js';

const LOCKOUT_THRESHOLD = 5; // 5 failed attempts per account
const IP_LOCKOUT_THRESHOLD = 15; // 15 failed attempts per IP (anti-stuffing)
const LOCKOUT_WINDOW_MINUTES = 15; // 15-minute window

export const checkLockout = async (email, ipAddress, userType = null) => {
  try {
    // 1. Check account-level lockout (protects the account even if attacker rotates IPs)
    let accountQuery = `
      SELECT COUNT(*) as failed_count, MAX(attempted_at) as last_attempt
      FROM login_attempts
      WHERE email = ? 
        AND is_successful = FALSE
        AND attempted_at > (NOW() - INTERVAL ? MINUTE)
    `;
    const accountParams = [email.toLowerCase().trim(), LOCKOUT_WINDOW_MINUTES];

    if (userType) {
      accountQuery += ` AND user_type = ?`;
      accountParams.push(userType);
    }

    const [accountRows] = await pool.query(accountQuery, accountParams);
    const accountFailedCount = accountRows[0]?.failed_count || 0;

    if (accountFailedCount >= LOCKOUT_THRESHOLD) {
      const lastAttempt = new Date(accountRows[0].last_attempt);
      const unlockTime = new Date(lastAttempt.getTime() + LOCKOUT_WINDOW_MINUTES * 60 * 1000);
      const remainingMinutes = Math.max(1, Math.ceil((unlockTime - new Date()) / (60 * 1000)));

      return {
        isLocked: true,
        remainingMinutes,
        message: `Account temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`
      };
    }

    // 2. Check IP-level lockout (protects against credential stuffing across different emails from the same IP)
    const [ipRows] = await pool.query(
      `SELECT COUNT(*) as ip_failed_count, MAX(attempted_at) as last_attempt
       FROM login_attempts
       WHERE ip_address = ? 
         AND is_successful = FALSE
         AND attempted_at > (NOW() - INTERVAL ? MINUTE);`,
      [ipAddress, LOCKOUT_WINDOW_MINUTES]
    );

    const ipFailedCount = ipRows[0]?.ip_failed_count || 0;
    if (ipFailedCount >= IP_LOCKOUT_THRESHOLD) {
      const lastAttempt = new Date(ipRows[0].last_attempt);
      const unlockTime = new Date(lastAttempt.getTime() + LOCKOUT_WINDOW_MINUTES * 60 * 1000);
      const remainingMinutes = Math.max(1, Math.ceil((unlockTime - new Date()) / (60 * 1000)));

      return {
        isLocked: true,
        remainingMinutes,
        message: `Too many failed login attempts originating from this IP address. Access blocked for ${remainingMinutes} minute(s).`
      };
    }

    return { 
      isLocked: false, 
      remainingAttempts: LOCKOUT_THRESHOLD - accountFailedCount 
    };
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
