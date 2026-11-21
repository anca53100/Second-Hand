import { Router } from 'express';
import {
  createCategory, listCategories, setCategoryStatus, updateCategory,
} from '../controllers/categories.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/', listCategories);

router.post('/', requireAuth, requireRole('admin'), createCategory);
router.put('/:id', requireAuth, requireRole('admin'), updateCategory);
router.patch('/:id/status', requireAuth, requireRole('admin'), setCategoryStatus);

export default router;
