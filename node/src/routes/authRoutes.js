import express from 'express';
import { adminLogin, dashboardLogin, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/dashboard/login', dashboardLogin);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
