import { mockItems } from '../data/items.mock.js';

// Capa de acceso a datos. Hoy usa datos mock; al tener el backend,
// solo se cambia el cuerpo de estas funciones por llamadas fetch a la API REST.
// const API_URL = import.meta.env.VITE_API_URL;

export async function getRecentItems() {
  // Simula latencia de red para probar el estado de carga
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockItems;
  // Futuro: const res = await fetch(`${API_URL}/items?limit=4&sort=recent`); return res.json();
}
