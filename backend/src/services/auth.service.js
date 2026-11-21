import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ADMIN_EMAIL, LOCALITIES } from '../constants.js';
import { User } from '../models/user.model.js';
import { getUserStats } from '../utils/counts.js';
import { passwordResetEmail } from '../utils/emails.js';
import { HttpError, throwIfErrors } from '../utils/HttpError.js';
import { sendMail } from '../utils/mailer.js';
import { serializeMe } from '../utils/serializers.js';
import { isEmail, phoneDigits } from '../utils/text.js';

const RESET_MINUTES = 60;
const RESET_COOLDOWN_MS = 60_000;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function register(body = {}) {
  const data = {
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim().toLowerCase(),
    phone: String(body.phone ?? '').trim(),
    location: String(body.location ?? ''),
    password: String(body.password ?? ''),
  };

  throwIfErrors({
    name: data.name ? '' : 'Este campo es obligatorio.',
    email: isEmail(data.email) ? '' : 'Ingresa un correo válido.',
    phone: phoneDigits(data.phone).length === 10 ? '' : 'El teléfono debe tener 10 dígitos.',
    location: LOCALITIES.includes(data.location) ? '' : 'Selecciona tu localidad.',
    password: data.password.length >= 8 ? '' : 'Mínimo 8 caracteres.',
    confirmPassword: body.confirmPassword === undefined || body.confirmPassword === data.password
      ? '' : 'Las contraseñas no coinciden.',
  });

  const conflict = new HttpError(409, 'Este correo ya está registrado.');
  if (await User.findByEmail(data.email)) throw conflict;

  let user;
  try {
    user = await User.create(data);
  } catch (error) {
    if (error.code === 11000) throw conflict;
    throw error;
  }
  return { user: serializeMe(user, { publications: 0, requests: 0 }) };
}

export async function login(body = {}) {
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  throwIfErrors({
    email: isEmail(email) ? '' : 'Ingresa un correo válido.',
    password: password ? '' : 'Ingresa tu contraseña.',
  });

  const user = await User.findByEmail(email);
  if (!user || !(await user.checkPassword(password))) {
    throw new HttpError(401, 'Correo o contraseña incorrectos.');
  }
  if (user.status !== 'Activo') {
    throw new HttpError(403, 'Tu cuenta está inactiva. Contacta al administrador.');
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  return { user: serializeMe(user, await getUserStats(user.id)), token };
}

export async function requestPasswordReset(body = {}) {
  const email = String(body.email ?? '').trim().toLowerCase();
  throwIfErrors({ email: isEmail(email) ? '' : 'Ingresa un correo válido.' });

  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(404, 'No hay ninguna cuenta registrada con ese correo.');
  if (user.email === ADMIN_EMAIL) {
    throw new HttpError(403, 'La contraseña de la cuenta principal del administrador no se recupera por correo.');
  }
  if (user.status !== 'Activo') throw new HttpError(403, 'Tu cuenta está inactiva. Contacta al administrador.');

  const waitMs = user.passwordResetRequestedAt
    ? RESET_COOLDOWN_MS - (Date.now() - user.passwordResetRequestedAt.getTime())
    : 0;
  if (waitMs > 0) {
    throw new HttpError(429, `Ya pediste un enlace hace un momento. Usa ese o espera ${Math.ceil(waitMs / 1000)} segundos para pedir otro.`);
  }

  const token = randomBytes(32).toString('hex');
  user.passwordResetHash = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + RESET_MINUTES * 60_000);
  user.passwordResetRequestedAt = new Date();
  await user.save();

  const link = `${env.appUrl}/restablecer-contrasena/${token}`;
  let sent;
  try {
    ({ sent } = await sendMail({ to: user.email, ...passwordResetEmail({ name: user.name, link, minutes: RESET_MINUTES }) }));
  } catch (error) {
    Object.assign(user, { passwordResetHash: null, passwordResetExpires: null, passwordResetRequestedAt: null });
    await user.save();
    throw error;
  }

  return sent
    ? { sent, message: `Te enviamos un enlace a ${user.email}. Vence en 1 hora.` }
    : { sent, message: 'El correo no está configurado en el servidor, así que no se envió. El enlace quedó en la terminal del backend (vence en 1 hora).' };
}

export async function resetPassword(body = {}) {
  const token = String(body.token ?? '');
  const password = String(body.password ?? '');
  throwIfErrors({ password: password.length >= 8 ? '' : 'Mínimo 8 caracteres.' });

  const user = token
    ? await User.findOne({ passwordResetHash: hashToken(token), passwordResetExpires: { $gt: new Date() } })
    : null;
  if (!user || user.status !== 'Activo') {
    throw new HttpError(400, 'El enlace no es válido o ya venció. Pide uno nuevo.');
  }

  user.password = password;
  user.passwordChangedAt = new Date();
  user.passwordResetHash = null;
  user.passwordResetExpires = null;
  await user.save();
  return { message: 'Tu contraseña se actualizó. Ya puedes entrar con la nueva.' };
}
