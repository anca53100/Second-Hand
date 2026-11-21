import { Router } from 'express';
import { dbState } from '../config/db.js';
import { Category, Item, Request, User } from '../models/index.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import categoriesRoutes from './categories.routes.js';
import itemsRoutes from './items.routes.js';
import requestsRoutes from './requests.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.get('/health', async (req, res) => {
  const [users, categories, items, requests] = await Promise.all(
    [User, Category, Item, Request].map((Model) => Model.estimatedDocumentCount()),
  );
  res.json({
    status: 'ok',
    storage: 'mongodb',
    database: dbState(),
    data: { users, categories, items, requests },
    time: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/items', itemsRoutes);
router.use('/requests', requestsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/admin', adminRoutes);

export default router;
