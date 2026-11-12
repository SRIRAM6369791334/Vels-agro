import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const DB_NAME = process.env.DB_NAME || 'DB-vels';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  ...(process.env.DB_SSL === 'true' && {
    ssl: {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    }
  })
};

// Main database pool
export const pool = mysql.createPool({
  ...dbConfig,
  database: DB_NAME
});

// Initialize database with safe fallback for dev & production
export const initDB = async () => {
  try {
    // Only attempt CREATE DATABASE if explicitly allowed and not in restricted cloud environments
    if (!isProduction && process.env.DB_AUTO_CREATE !== 'false') {
      try {
        const rootConn = await mysql.createConnection(dbConfig);
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        await rootConn.end();
      } catch (createErr) {
        // In many managed databases, CREATE DATABASE is prohibited; safely continue to test pool
        console.warn(`⚠️ Note: Auto-create DB skipped/restricted (${createErr.code || createErr.message}). Attempting pool connection...`);
      }
    }

    // Test pool connection
    const testConn = await pool.getConnection();
    console.log(`✅ MySQL Connected successfully to database: \`${DB_NAME}\``);
    testConn.release();
    return true;
  } catch (error) {
    console.error(`❌ MySQL Connection Error [${error.code || 'UNKNOWN'}]:`, error.message);
    if (!isProduction) {
      console.log(`ℹ️  Note: Ensure MySQL service/XAMPP is running and credentials match in .env`);
    }
    return false;
  }
};

// Graceful pool shutdown
export const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Database connection pool closed.');
  } catch (err) {
    console.error('Error closing database pool:', err.message);
  }
};

export default pool;
