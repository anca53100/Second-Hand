import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { ADMIN_EMAIL, createInitialData } from './data/initial.js';
import { User } from './models/user.model.js';


try {
  const { host, name } = await connectDB();
  console.log(`MongoDB conectado: ${host} / base "${name}"`);
} catch (error) {
  console.error('No se pudo conectar a MongoDB:', error.message);
  if (error.message.includes('querySrv')) {
    console.error('Node no pudo resolver el DNS del cluster: agrega DNS_SERVERS=8.8.8.8,1.1.1.1 en backend/.env (ver .env.example).');
  } else {
    console.error('Revisa MONGODB_URI en backend/.env y que tu IP esté autorizada en Atlas (Network Access).');
  }
  process.exit(1);
}

if ((await User.estimatedDocumentCount()) === 0) {
  const created = await createInitialData({ adminPassword: env.seedAdminPassword });
  console.log(`Base vacía: se creó la cuenta ${ADMIN_EMAIL} y ${created.categories} categorías base`);
}

const server = app.listen(env.port, (error) => {
  if (error) {
    console.error(`No se pudo abrir el puerto ${env.port}:`, error.message);
    process.exit(1);
  }
  console.log(`API escuchando en http://localhost:${env.port}/api`);
  console.log(`Documentación Swagger en http://localhost:${env.port}/api/docs`);
  console.log(`Administrador: ${ADMIN_EMAIL} (su contraseña es el valor de SEED_ADMIN_PASSWORD en backend/.env)`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  });
}
