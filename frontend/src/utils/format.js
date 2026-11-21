export function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'hace 1 día';
  if (days < 7) return `hace ${days} días`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? 'hace 1 semana' : `hace ${weeks} semanas`;
}

export function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export const normalize = (text) =>
  String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function getPageNumbers(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]));
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const splitDate = (iso) => String(iso).slice(0, 10).split('-').map(Number);

export function formatDay(iso) {
  const [, m, d] = splitDate(iso);
  return `${d} de ${MONTHS[m - 1]}`;
}

export function formatDate(iso) {
  const [y] = splitDate(iso);
  return `${formatDay(iso)} de ${y}`;
}

export function formatMonthYear(iso) {
  const [y, m] = splitDate(iso);
  return `${MONTHS[m - 1]} de ${y}`;
}

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export function formatShortDate(iso) {
  const [y, m, d] = splitDate(iso);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}
