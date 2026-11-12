import mysql from 'mysql2/promise';
import env from './env.js';

const dbConfig = {
  host: env.DB.HOST,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  port: env.DB.PORT,
  waitForConnections: true,
  connectionLimit: Math.max(env.DB.CONNECTION_LIMIT || 10, 25),
  queueLimit: 1000, // Bounded queue: prevents out-of-memory heap explosion under massive spikes
  connectTimeout: 10000, // 10 seconds connection timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  maxIdle: 10,
  idleTimeout: 60000,
  ...(env.DB.SSL && {
    ssl: {
      rejectUnauthorized: env.DB.SSL_REJECT_UNAUTHORIZED
    }
  })
};

// Main database pool
export const pool = mysql.createPool({
  ...dbConfig,
  database: env.DB.NAME
});

// Initialize database with safe fallback for dev & production
export const initDB = async () => {
  try {
    if (!env.isProduction && env.DB.AUTO_CREATE) {
      try {
        const rootConn = await mysql.createConnection(dbConfig);
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB.NAME}\`;`);
        await rootConn.end();
      } catch (createErr) {
        console.warn(`⚠️ Note: Auto-create DB skipped/restricted (${createErr.code || createErr.message}). Attempting pool connection...`);
      }
    }

    // Test pool connection
    const testConn = await pool.getConnection();
    console.log(`✅ MySQL Connected successfully to database: \`${env.DB.NAME}\``);
    testConn.release();
    return true;
  } catch (error) {
    console.error(`❌ MySQL Connection Error [${error.code || 'UNKNOWN'}]:`, error.message);
    if (!env.isProduction) {
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
