import { apiFetch } from './api.js';
import { getItemById } from './itemsService.js';

const toBody = (data) => ({
  title: data.title.trim(),
  category: data.category,
  condition: data.condition,
  location: data.location,
  description: data.description,
  photos: data.photos,
});

export function getMyItems() {
  return apiFetch('/items/mine');
}

export async function getMyItemById(id) {
  const item = await getItemById(id);
  return item?.mine ? item : null;
}

export function createMyItem(data) {
  return apiFetch('/items', { method: 'POST', body: toBody(data) });
}

export function updateMyItem(id, data) {
  return apiFetch(`/items/${encodeURIComponent(id)}`, { method: 'PUT', body: toBody(data) });
}

export function setMyItemStatus(id, status) {
  return apiFetch(`/items/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } });
}
