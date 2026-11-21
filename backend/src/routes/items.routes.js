import { Router } from 'express';
import {
  createItem, getItem, listItems, listMyItems, setItemStatus, updateItem,
} from '../controllers/items.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', optionalAuth, listItems);

router.get('/mine', requireAuth, listMyItems);
router.get('/:id', optionalAuth, getItem);
router.post('/', requireAuth, createItem);
router.put('/:id', requireAuth, updateItem);
router.patch('/:id/status', requireAuth, setItemStatus);

export default router;
