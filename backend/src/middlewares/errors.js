import { HttpError } from '../utils/HttpError.js';

export function notFound(req, res) {
  res.status(404).json({ message: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...(err.errors && { errors: err.errors }) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'La petición es demasiado grande. Usa imágenes más livianas o menos fotos.' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Ya existe un registro con esos datos.' });
  }
  if (err.name === 'ValidationError') {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
    return res.status(400).json({ message: 'Hay datos no válidos.', errors });
  }

  console.error(err);
  res.status(500).json({ message: 'Ocurrió un error en el servidor. Intenta de nuevo.' });
}
