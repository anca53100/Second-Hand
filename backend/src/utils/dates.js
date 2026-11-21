const OFFSET_MS = -5 * 60 * 60 * 1000;

export function toBogotaISO(date) {
  if (!date) return null;
  const local = new Date(new Date(date).getTime() + OFFSET_MS);
  return `${local.toISOString().slice(0, 19)}-05:00`;
}

export function toBogotaDate(date) {
  return date ? toBogotaISO(date).slice(0, 10) : null;
}
