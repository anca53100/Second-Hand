import dns from 'node:dns';
import mongoose from 'mongoose';
import { models } from '../models/index.js';
import { env } from './env.js';

if (env.dnsServers.length > 0) dns.setServers(env.dnsServers);

let connection = null;

export function connectDB() {
  connection ??= (async () => {
    await mongoose.connect(env.mongodbUri, {
      dbName: env.mongodbDb,
      serverSelectionTimeoutMS: 10_000,
    });
    await Promise.all(models.map((Model) => Model.init()));
    return mongoose.connection;
  })().catch((error) => {
    connection = null;
    throw error;
  });
  return connection;
}

export async function disconnectDB() {
  connection = null;
  await mongoose.disconnect();
}

export function dbState() {
  const states = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  return states[mongoose.connection.readyState] ?? 'desconocido';
}
