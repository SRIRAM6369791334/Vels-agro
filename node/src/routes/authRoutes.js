import express from 'express';
import { adminLogin, dashboardLogin, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/admin/login', validate(loginSchema), adminLogin);
router.post('/dashboard/login', validate(loginSchema), dashboardLogin);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
