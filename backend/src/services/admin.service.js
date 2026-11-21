import { Category } from '../models/category.model.js';
import { Item } from '../models/item.model.js';
import { Request } from '../models/request.model.js';
import { User } from '../models/user.model.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getStats() {
  const weekAgo = new Date(Date.now() - WEEK_MS);
  const [activeUsers, publishedItems, requestsThisWeek, activeCategories] = await Promise.all([
    User.countDocuments({ status: 'Activo' }),
    Item.countDocuments(),
    Request.countDocuments({ createdAt: { $gte: weekAgo } }),
    Category.countDocuments({ status: 'Activa' }),
  ]);
  return { activeUsers, publishedItems, requestsThisWeek, activeCategories };
}
