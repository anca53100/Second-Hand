import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { ADMIN_EMAIL, resetDatabase } from '../data/initial.js';

try {
  const { name } = await connectDB();
  const created = await resetDatabase({ adminPassword: env.seedAdminPassword });
  console.log(`Base "${name}" vaciada. Quedan ${created.users} cuenta de administrador (${ADMIN_EMAIL}) `
    + `y ${created.categories} categorías. Las cuentas y los artículos se crean desde la app.`);
} catch (error) {
  console.error('No se pudo vaciar la base:', error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
