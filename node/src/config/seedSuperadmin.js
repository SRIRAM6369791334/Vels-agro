import bcrypt from 'bcryptjs';
import pool from './db.js';

export const seedSuperadmin = async () => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admin_users;');
    const count = rows[0]?.count || 0;

    if (count === 0) {
      const email = process.env.SUPERADMIN_DEFAULT_EMAIL || 'admin@velsagro.com';
      const rawPassword = process.env.SUPERADMIN_DEFAULT_PASSWORD || 'SuperAdmin@123';

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(rawPassword, salt);

      await pool.query(
        `INSERT INTO admin_users (email, password_hash, first_name, last_name, is_active)
         VALUES (?, ?, 'Super', 'Administrator', TRUE);`,
        [email.toLowerCase(), passwordHash]
      );

      console.log(`\n👑 Initial Superadmin Seeded:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${rawPassword}`);
      console.log(`   (Change password after initial deployment)\n`);
    }
  } catch (err) {
    console.error('Superadmin seed check error:', err.message);
  }
};
