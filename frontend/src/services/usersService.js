import { apiFetch } from './api.js';

export function getUsers() {
  return apiFetch('/users');
}

export async function findUserByEmail(email) {
  const [user] = await apiFetch('/users', { query: { email } });
  return user ?? null;
}

export function getRecentUsers(limit = 7) {
  return apiFetch('/users', { query: { limit } });
}

export function setUserStatus(id, status) {
  return apiFetch(`/users/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } });
}

export function setUserRole(id, role) {
  return apiFetch(`/users/${encodeURIComponent(id)}/role`, { method: 'PATCH', body: { role } });
}
