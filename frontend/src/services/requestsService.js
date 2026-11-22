import { apiFetch, fetchOrNull } from './api.js';

export function getMyRequests() {
  return apiFetch('/requests');
}

export function getRequestById(id) {
  return fetchOrNull(`/requests/${encodeURIComponent(id)}`);
}

export function cancelRequest(id) {
  return apiFetch(`/requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status: 'Cancelada' } });
}

export function createRequest(itemId, { type, offeredItemId, message }) {
  return apiFetch('/requests', {
    method: 'POST',
    body: { itemId, type, message, ...(type === 'Intercambio' ? { offeredItemId } : {}) },
  });
}
