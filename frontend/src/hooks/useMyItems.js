import { useEffect, useState } from 'react';
import { getMyItems, setMyItemStatus } from '../services/myItemsService.js';

export default function useMyItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    getMyItems()
      .then((data) => active && setItems(data))
      .catch(() => active && setError('No pudimos cargar tus publicaciones. Intenta de nuevo.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const toggleStatus = async (item) => {
    setBusyId(item.id);
    setError(null);
    try {
      const next = item.status === 'Disponible' ? 'Inactivo' : 'Disponible';
      const updated = await setMyItemStatus(item.id, next);
      setItems((list) => list.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return { items, loading, error, busyId, toggleStatus };
}
