import express from 'express';
import {
  listDashboardUsers,
  getDashboardUserById,
  createDashboardUser,
  updateDashboardUser,
  resetUserPassword,
  toggleUserStatus
} from '../controllers/dashboardUserController.js';
import { authenticate, requireSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Guard all dashboard-user routes with Superadmin privileges
router.use(authenticate, requireSuperAdmin);

router.get('/', listDashboardUsers);
router.get('/:id', getDashboardUserById);
router.post('/', createDashboardUser);
router.put('/:id', updateDashboardUser);
router.patch('/:id/reset-password', resetUserPassword);
router.patch('/:id/status', toggleUserStatus);

export default router;
