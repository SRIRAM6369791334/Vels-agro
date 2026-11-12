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
import { idempotencyGuard } from '../middlewares/idempotency.js';
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
router.post('/', idempotencyGuard(), validate(createDashboardUserSchema), createDashboardUser);
router.put('/:id', idempotencyGuard(), validate(idParamSchema, 'params'), validate(updateDashboardUserSchema), updateDashboardUser);
router.patch(
  '/:id/reset-password',
  idempotencyGuard(),
  validate(idParamSchema, 'params'),
  validate(resetPasswordSchema),
  resetUserPassword
);
router.patch(
  '/:id/status',
  idempotencyGuard(),
  validate(idParamSchema, 'params'),
  validate(statusSchema),
  toggleUserStatus
);

export default router;
