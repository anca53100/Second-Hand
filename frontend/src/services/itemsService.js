import { apiFetch, fetchOrNull } from './api.js';

export function getRecentItems() {
  return apiFetch('/items', { query: { limit: 4, sort: 'recent' } });
}

export function getItems() {
  return apiFetch('/items');
}

export function getItemById(id) {
  return fetchOrNull(`/items/${encodeURIComponent(id)}`);
}
