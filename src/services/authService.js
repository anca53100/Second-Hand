// Capa de autenticación. Hoy simula las respuestas; al tener el backend,
// se reemplaza cada función por un fetch a la API REST (POST /auth/login, etc.).
// const API_URL = import.meta.env.VITE_API_URL;

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login({ email, password }) {
  await wait();
  if (password === 'incorrecta') throw new Error('Correo o contraseña incorrectos.'); // solo para probar el error
  return { user: { name: 'Usuario de prueba', email }, token: 'mock-token' };
}

export async function register(data) {
  await wait();
  if (data.email === 'ana@correo.com') throw new Error('Este correo ya está registrado.'); // RQF001: correo único
  return { user: { name: data.name, email: data.email } };
}

export async function requestPasswordReset({ email }) {
  await wait();
  return { ok: true, email };
}
