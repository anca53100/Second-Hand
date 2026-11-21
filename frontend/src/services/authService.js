import { apiFetch } from './api.js';

export function login({ email, password }) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } });
}

export function register({ name, email, phone, location, password }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: { name, email, phone, location, password },
  });
}

export function getMe() {
  return apiFetch('/users/me');
}

export function updateProfile(changes) {
  return apiFetch('/users/me', { method: 'PUT', body: changes });
}

export function requestPasswordReset({ email }) {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword({ token, password }) {
  return apiFetch('/auth/reset-password', { method: 'POST', body: { token, password } });
}
