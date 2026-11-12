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
import { validate } from '../middlewares/validate.js';
import {
  createDashboardUserSchema,
  updateDashboardUserSchema,
  resetPasswordSchema,
  statusSchema,
  idParamSchema
} from '../validators/dashboardUserValidator.js';

const router = express.Router();

// Guard all dashboard-user routes with Superadmin privileges
router.use(authenticate, requireSuperAdmin);

router.get('/', listDashboardUsers);
router.get('/:id', validate(idParamSchema, 'params'), getDashboardUserById);
router.post('/', validate(createDashboardUserSchema), createDashboardUser);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateDashboardUserSchema), updateDashboardUser);
router.patch(
  '/:id/reset-password',
  validate(idParamSchema, 'params'),
  validate(resetPasswordSchema),
  resetUserPassword
);
router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(statusSchema),
  toggleUserStatus
);

export default router;
