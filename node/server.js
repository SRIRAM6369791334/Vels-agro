import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import env from './src/config/env.js';
import { initDB, closePool, pool } from './src/config/db.js';
import { seedSuperadmin } from './src/config/seedSuperadmin.js';
import { sendSuccess, sendError } from './src/utils/response.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import dashboardUserRoutes from './src/routes/dashboardUserRoutes.js';
import roleRoutes from './src/routes/roleRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';

const app = express();
const PORT = env.PORT;

// 1. Gzip/Brotli Payload Compression (High speed, 70% smaller network size)
app.use(compression());

// 2. Security Headers via Helmet
app.use(helmet());

// 2. Production CORS Configuration strictly from env
const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || !env.isProduction) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 3. Rate Limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

app.use('/api/', apiLimiter);

// 4. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Base Health & Root Routes
app.get('/', (req, res) => {
  return sendSuccess(res, 200, 'API Server is up and running!', {
    environment: env.NODE_ENV,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const conn = await pool.getConnection();
    conn.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  return sendSuccess(res, 200, 'Health check passed', {
    status: 'healthy',
    database: {
      name: env.DB.NAME,
      status: dbStatus
    },
    uptime: process.uptime()
  });
});

// 6. API v1 Routes Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/dashboard-users', dashboardUserRoutes);
app.use('/api/v1/admin/roles', roleRoutes);
app.use('/api/v1/admin', auditRoutes);

// 7. 404 Route Not Found Handler
app.use((req, res, next) => {
  return sendError(res, 404, `Resource not found at: ${req.method} ${req.originalUrl}`);
});

// 8. Global Error Handler Middleware
app.use((err, req, res, next) => {
  // 1. Intercept malformed JSON syntax errors gracefully without exposing stack traces
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(
      res,
      400,
      'Invalid JSON format in request body.'
    );
  }

  console.error('Unhandled Application Error:', err);

  const statusCode = err.statusCode || (err.message && err.message.includes('CORS') ? 403 : 500);
  return sendError(res, statusCode, err.message || 'Internal Server Error');
});

// 9. Start Server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT} [${env.NODE_ENV}]`);
  const dbConnected = await initDB();
  if (dbConnected) {
    await seedSuperadmin();
  }
});

// 10. Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP Server closed.');
    await closePool();
    console.log('✅ Graceful shutdown completed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('❌ Forcefully shutting down due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
