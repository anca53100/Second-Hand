import { fileURLToPath } from 'node:url';

try {
  process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));
} catch {
}

function appUrl() {
  const url = process.env.APP_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0].trim();
  return url.replace(/\/+$/, '');
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copia .env.example como .env y complétala.`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongodbUri: required('MONGODB_URI'),
  mongodbDb: process.env.MONGODB_DB || 'secondhand',
  dnsServers: (process.env.DNS_SERVERS || '').split(',').map((s) => s.trim()).filter(Boolean),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
  appUrl: appUrl(),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER || '',
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
  },
  mailFrom: process.env.MAIL_FROM || '',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin12345',
  seedUserPassword: process.env.SEED_USER_PASSWORD || 'Usuario12345',
};
