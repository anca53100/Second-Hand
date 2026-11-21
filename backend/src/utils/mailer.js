import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { HttpError } from './HttpError.js';

let transporter = null;

export const mailConfigured = () => Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

export async function sendMail({ to, subject, text, html }) {
  if (!mailConfigured()) {
    if (process.env.VERCEL) {
      console.error('No se envió el correo: faltan SMTP_HOST, SMTP_USER o SMTP_PASS en las variables de entorno.');
      throw new HttpError(503, 'No pudimos enviar el correo. Intenta de nuevo más tarde.');
    }
    console.log(`\n[Correo sin configurar: NO se envió. Este es el contenido]\nPara: ${to}\nAsunto: ${subject}\n\n${text}\n`);
    return { sent: false };
  }

  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  try {
    await transporter.sendMail({ from: env.mailFrom || `Second Hand <${env.smtp.user}>`, to, subject, text, html });
    return { sent: true };
  } catch (error) {
    console.error('No se pudo enviar el correo:', error.message);
    throw new HttpError(503, 'No pudimos enviar el correo. Intenta de nuevo en unos minutos.');
  }
}
