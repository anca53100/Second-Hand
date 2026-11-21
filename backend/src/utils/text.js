export const normalize = (text) =>
  String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const collapseSpaces = (text) => String(text ?? '').trim().replace(/\s+/g, ' ');

export const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const toParagraphs = (text) =>
  String(text ?? '').split(/\n+/).map((p) => p.trim()).filter(Boolean);

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? ''));
export const phoneDigits = (value) => String(value ?? '').replace(/\D/g, '');
export const isImageDataUrl = (value) =>
  typeof value === 'string' && /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
