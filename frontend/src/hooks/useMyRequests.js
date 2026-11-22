import { useEffect, useState } from 'react';
import { cancelRequest, getMyRequests } from '../services/requestsService.js';

export default function useMyRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getMyRequests()
      .then((data) => active && setItems(data))
      .catch((err) => active && setError(err?.message || 'No pudimos cargar tus solicitudes. Intenta de nuevo.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const cancel = async (id) => {
    const updated = await cancelRequest(id);
    setItems((list) => list.map((r) => (r.id === id ? updated : r)));
  };

  return { items, loading, error, cancel };
}
