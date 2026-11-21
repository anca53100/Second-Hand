import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { seedDatabase } from '../data/seed.js';

try {
  const { name } = await connectDB();
  const loaded = await seedDatabase({ adminPassword: env.seedAdminPassword, userPassword: env.seedUserPassword });
  console.log(`Base "${name}" reiniciada: ${loaded.users} usuarios, ${loaded.categories} categorías, `
    + `${loaded.items} artículos, ${loaded.requests} solicitudes`);
} catch (error) {
  console.error('No se pudieron cargar los datos de prueba:', error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
