import express from 'express';
import {
  adminLogin,
  dashboardLogin,
  unifiedLogin,
  logout,
  getMe,
  updateMe,
  getMySessions,
  revokeOtherSessions
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', validate(loginSchema), unifiedLogin);
router.post('/admin/login', validate(loginSchema), adminLogin);
router.post('/dashboard/login', validate(loginSchema), dashboardLogin);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.get('/sessions', authenticate, getMySessions);
router.post('/sessions/revoke-others', authenticate, revokeOtherSessions);

export default router;
