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

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get('/', listRoles);
router.get('/permissions', listPermissions);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
