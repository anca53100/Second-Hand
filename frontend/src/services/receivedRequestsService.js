import { apiFetch } from './api.js';

export function getReceivedRequests() {
  return apiFetch('/requests/received');
}

export function respondToRequest(id, status) {
  return apiFetch(`/requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } });
}

export async function deleteReceivedRequest(id) {
  await apiFetch(`/requests/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
