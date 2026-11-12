import express from 'express';
import { getAuditLogs, getLoginAttempts } from '../controllers/auditController.js';
import { authenticate, requireSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get('/audit-logs', getAuditLogs);
router.get('/login-attempts', getLoginAttempts);

export default router;
