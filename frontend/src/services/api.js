const DEFAULT_API_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

export const SESSION_KEY = 'sh_session';
export const UNAUTHORIZED_EVENT = 'sh:unauthorized';

function readToken() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))?.token ?? null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors ?? {};
  }
}

export async function apiFetch(path, { method = 'GET', body, query } = {}) {
  const token = readToken();
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let url = `${API_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      [value].flat().forEach((v) => params.append(key, v));
    }
    const qs = params.toString();
    if (qs) url += `${url.includes('?') ? '&' : '?'}${qs}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(response.status, data?.message || 'Ocurrió un error. Intenta de nuevo.', data?.errors);
  }
  return data;
}

export async function fetchOrNull(path) {
  try {
    return await apiFetch(path);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}
