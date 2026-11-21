import * as authService from '../services/auth.service.js';

export async function register(req, res) {
  res.status(201).json(await authService.register(req.body ?? {}));
}

export async function login(req, res) {
  res.json(await authService.login(req.body ?? {}));
}

export async function forgotPassword(req, res) {
  res.json(await authService.requestPasswordReset(req.body ?? {}));
}

export async function resetPassword(req, res) {
  res.json(await authService.resetPassword(req.body ?? {}));
}
