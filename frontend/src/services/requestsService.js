import { apiFetch, fetchOrNull } from './api.js';

export function getMyRequests() {
  return apiFetch('/requests');
}

export function getRequestById(id) {
  return fetchOrNull(`/requests/${encodeURIComponent(id)}`);
}

export function createRequest(itemId, { type, offeredItemId, message }) {
  return apiFetch('/requests', {
    method: 'POST',
    body: { itemId, type, message, ...(type === 'Intercambio' ? { offeredItemId } : {}) },
  });
}
