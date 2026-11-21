import { ADMIN_EMAIL } from '../constants.js';
import { Category, models, User } from '../models/index.js';

export { ADMIN_EMAIL };
export const BASE_CATEGORIES = ['Libros', 'Útiles escolares', 'Ropa', 'Muebles'];

export async function createInitialData({ adminPassword }) {
  await User.create({ name: 'Administrador', email: ADMIN_EMAIL, password: adminPassword, role: 'admin' });
  const start = Date.now();
  for (const [i, name] of BASE_CATEGORIES.entries()) {
    await Category.create({ name, status: 'Activa', createdAt: new Date(start + i) });
  }
  return { users: 1, categories: BASE_CATEGORIES.length };
}

export async function resetDatabase({ adminPassword }) {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
  return createInitialData({ adminPassword });
}
