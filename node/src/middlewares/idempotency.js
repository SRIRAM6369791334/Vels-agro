import crypto from 'crypto';
import { sendError } from '../utils/response.js';

/**
 * In-memory store for idempotency keys & in-flight requests.
 * In a distributed cluster, Redis would be used; for single-node / local, an in-memory Map with auto-cleanup is ultra-fast (< 0.1ms).
 */
const inFlightRequests = new Map(); // key -> Promise / timestamp
const idempotencyCache = new Map(); // key -> { statusCode, body, expiresAt }

// Auto-cleanup every 60 seconds to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of idempotencyCache.entries()) {
    if (item.expiresAt < now) {
      idempotencyCache.delete(key);
    }
  }
  for (const [key, timestamp] of inFlightRequests.entries()) {
    if (now - timestamp > 10000) { // stale in-flight after 10s
      inFlightRequests.delete(key);
    }
  }
}, 30000).unref();

/**
 * Idempotency & Rapid-Fire Deduplication Middleware
 * Prevents:
 * 1. Accidental button double-clicks / multi-clicks
 * 2. Network retries creating duplicate records (e.g. duplicate staff or roles)
 * 3. Race condition exploits on concurrent identical payloads
 */
export const idempotencyGuard = (options = { ttlSeconds: 60 }) => {
  return (req, res, next) => {
    // Only apply to state-modifying requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const explicitKey = req.headers['x-idempotency-key'];
    let idempotencyKey;

    if (explicitKey) {
      idempotencyKey = `idemp:${req.user?.id || 'anon'}:${explicitKey.trim()}`;
    } else {
      // Automatic fingerprint: Hash of method + URL + user + body to catch rapid double clicks within 2 seconds
      const bodyHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(req.body || {}))
        .digest('hex');
      idempotencyKey = `auto:${req.ip}:${req.user?.id || 'anon'}:${req.method}:${req.baseUrl + req.path}:${bodyHash}`;
    }

    // 1. Check if an identical request is ALREADY currently in-flight (processing right now)
    if (inFlightRequests.has(idempotencyKey)) {
      return sendError(
        res,
        409,
        'Duplicate request detected. An identical operation is currently being processed. Please wait.'
      );
    }

    // 2. Check if this request was already completed and cached (for explicit idempotency keys)
    if (explicitKey && idempotencyCache.has(idempotencyKey)) {
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached.expiresAt > Date.now()) {
        res.setHeader('X-Cache-Lookup', 'HIT');
        return res.status(cached.statusCode).json(cached.body);
      }
      idempotencyCache.delete(idempotencyKey);
    }

    // Mark as in-flight
    inFlightRequests.set(idempotencyKey, Date.now());

    // Intercept response to cache and clean up
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      inFlightRequests.delete(idempotencyKey);

      // Only cache successful or client-specified idempotent responses
      if (explicitKey && res.statusCode >= 200 && res.statusCode < 300) {
        idempotencyCache.set(idempotencyKey, {
          statusCode: res.statusCode,
          body,
          expiresAt: Date.now() + options.ttlSeconds * 1000
        });
      }

      return originalJson(body);
    };

    // If request closes or aborts prematurely, remove from in-flight
    res.on('close', () => {
      inFlightRequests.delete(idempotencyKey);
    });

    next();
  };
};
