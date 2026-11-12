import express from 'express';
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  listPermissions
} from '../controllers/roleController.js';
import { authenticate, requireSuperAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idempotencyGuard } from '../middlewares/idempotency.js';
import { createRoleSchema, updateRoleSchema, idParamSchema } from '../validators/roleValidator.js';

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get('/', listRoles);
router.get('/permissions', listPermissions);
router.get('/:id', validate(idParamSchema, 'params'), getRoleById);
router.post('/', idempotencyGuard(), validate(createRoleSchema), createRole);
router.put('/:id', idempotencyGuard(), validate(idParamSchema, 'params'), validate(updateRoleSchema), updateRole);
router.delete('/:id', idempotencyGuard(), validate(idParamSchema, 'params'), deleteRole);

export default router;
