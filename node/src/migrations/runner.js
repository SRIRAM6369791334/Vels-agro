import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = process.env.DB_NAME || 'DB-vels';

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  multipleStatements: true,
  ...(process.env.DB_SSL === 'true' && {
    ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  })
};

export const runMigrations = async () => {
  console.log(`\n========================================`);
  console.log(`🚀 Starting Database Migrations for [${DB_NAME}]`);
  console.log(`========================================`);

  // Step 1: Ensure database exists
  try {
    const rootConn = await mysql.createConnection(baseConfig);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await rootConn.end();
  } catch (err) {
    console.warn(`⚠️ Warning during DB check: ${err.message}. Continuing with target DB connection...`);
  }

  // Step 2: Connect to target database
  const connection = await mysql.createConnection({
    ...baseConfig,
    database: DB_NAME
  });

  try {
    // Step 3: Ensure schema_migrations table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Step 4: Get applied migrations
    const [rows] = await connection.query(`SELECT version FROM schema_migrations;`);
    const executedVersions = new Set(rows.map((r) => r.version));

    // Step 5: Read all SQL migration files
    const sqlDir = path.join(__dirname, 'sql');
    const files = fs
      .readdirSync(sqlDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const pendingFiles = files.filter((file) => {
      const version = file.split('_')[0];
      return !executedVersions.has(version);
    });

    if (pendingFiles.length === 0) {
      console.log(`✅ Database is already up to date. No pending migrations.\n`);
      return { success: true, count: 0 };
    }

    console.log(`Found ${pendingFiles.length} pending migration(s) to execute:`);
    pendingFiles.forEach((file) => console.log(`   - ${file}`));
    console.log(`----------------------------------------`);

    // Step 6: Execute each pending migration in a transaction
    for (const file of pendingFiles) {
      const version = file.split('_')[0];
      const filePath = path.join(sqlDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      console.log(`⏳ Applying migration: ${file}...`);

      await connection.query('START TRANSACTION;');
      try {
        await connection.query(sqlContent);
        await connection.query(
          'INSERT INTO schema_migrations (version, name) VALUES (?, ?);',
          [version, file]
        );
        await connection.query('COMMIT;');
        console.log(`   ✅ Migration ${file} applied successfully.`);
      } catch (migrationErr) {
        await connection.query('ROLLBACK;');
        console.error(`\n❌ Failed applying migration: ${file}`);
        console.error(`Reason: ${migrationErr.message}`);
        throw migrationErr;
      }
    }

    console.log(`========================================`);
    console.log(`🎉 All ${pendingFiles.length} migrations applied successfully!`);
    console.log(`========================================\n`);
    return { success: true, count: pendingFiles.length };
  } finally {
    await connection.end();
  }
};
