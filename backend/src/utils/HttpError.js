export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    if (errors) this.errors = errors;
  }
}

export function throwIfErrors(errors) {
  const found = Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
  const messages = Object.values(found);
  if (messages.length) throw new HttpError(400, messages[0], found);
}
