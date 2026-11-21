import { Router } from 'express';
import { getMe, listUsers, setUserRole, setUserStatus, updateMe } from '../controllers/users.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);

router.get('/', requireAuth, requireRole('admin'), listUsers);
router.patch('/:id/status', requireAuth, requireRole('admin'), setUserStatus);
router.patch('/:id/role', requireAuth, requireRole('admin'), setUserRole);

export default router;
