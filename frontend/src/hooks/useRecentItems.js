import { useEffect, useState } from 'react';
import { getRecentItems } from '../services/itemsService.js';

export default function useRecentItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getRecentItems()
      .then((data) => active && setItems(data))
      .catch(() => active && setError('No pudimos cargar los artículos. Intenta de nuevo.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return { items, loading, error };
}
