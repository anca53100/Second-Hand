import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { HttpError } from '../utils/HttpError.js';

function readToken(req) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

async function userFromToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
  const user = await User.findById(payload.sub);
  if (user?.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) return null;
  return user;
}

export async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) throw new HttpError(401, 'Debes iniciar sesión para continuar.');

  const user = await userFromToken(token);
  if (!user) throw new HttpError(401, 'Tu sesión expiró o no es válida. Inicia sesión de nuevo.');
  if (user.status !== 'Activo') throw new HttpError(403, 'Tu cuenta está inactiva. Contacta al administrador.');

  req.user = user;
  next();
}

export async function optionalAuth(req, res, next) {
  const token = readToken(req);
  const user = token ? await userFromToken(token) : null;
  if (user?.status === 'Activo') req.user = user;
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      throw new HttpError(403, role === 'admin'
        ? 'Esta acción es solo para administradores.'
        : 'No tienes permiso para esta acción.');
    }
    next();
  };
}
