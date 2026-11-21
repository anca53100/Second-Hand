import { apiFetch } from './api.js';

export function getDashboardStats() {
  return apiFetch('/admin/stats');
}
