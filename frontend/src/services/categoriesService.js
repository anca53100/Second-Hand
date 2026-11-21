import { apiFetch } from './api.js';

export function getCategories() {
  return apiFetch('/categories');
}

export async function getActiveCategoryNames() {
  const list = await apiFetch('/categories', { query: { status: 'Activa' } });
  return list.map((c) => c.name);
}

export function createCategory(name) {
  return apiFetch('/categories', { method: 'POST', body: { name } });
}

export function updateCategory(id, name) {
  return apiFetch(`/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: { name } });
}

export function setCategoryStatus(id, status) {
  return apiFetch(`/categories/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } });
}
