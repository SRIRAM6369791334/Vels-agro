import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates required environment variables on startup.
 * Throws an explicit error if any critical secret is missing.
 * No hardcoded fallback strings allowed!
 */
const requireEnv = (key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`❌ Configuration Error: Environment variable [${key}] is required but not set in .env!`);
  }
  return value.trim();
};

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database Configurations (Strictly from .env)
  DB: {
    HOST: requireEnv('DB_HOST'),
    USER: requireEnv('DB_USER'),
    PASSWORD: process.env.DB_PASSWORD ?? '', // Allow empty string if local root has no password
    NAME: requireEnv('DB_NAME'),
    PORT: Number(process.env.DB_PORT) || 3306,
    CONNECTION_LIMIT: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    SSL: process.env.DB_SSL === 'true',
    SSL_REJECT_UNAUTHORIZED: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    AUTO_CREATE: process.env.DB_AUTO_CREATE !== 'false'
  },

  // JWT & Security Secrets (Strictly from .env - NO fallback secrets!)
  JWT: {
    SECRET: requireEnv('JWT_SECRET'),
    EXPIRES_IN: requireEnv('JWT_EXPIRES_IN')
  },

  // Initial Bootstrap Superadmin
  SUPERADMIN: {
    EMAIL: requireEnv('SUPERADMIN_DEFAULT_EMAIL'),
    PASSWORD: requireEnv('SUPERADMIN_DEFAULT_PASSWORD')
  },

  // CORS & Rate Limiting
  CLIENT_URL: requireEnv('CLIENT_URL'),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100
};

export default env;
