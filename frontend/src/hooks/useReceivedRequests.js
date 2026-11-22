import { useEffect, useState } from 'react';
import { deleteReceivedRequest, getReceivedRequests, respondToRequest } from '../services/receivedRequestsService.js';

export default function useReceivedRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    getReceivedRequests()
      .then((data) => active && setItems(data))
      .catch(() => active && setError('No pudimos cargar las solicitudes.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const run = async (id, action, { quiet = false } = {}) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      return null;
    } catch (err) {
      if (!quiet) setError(err.message);
      return err.message;
    } finally {
      setBusyId(null);
    }
  };

  const respond = (id, status, options) => run(id, async () => {
    const updated = await respondToRequest(id, status);
    setItems((list) => list.map((r) => {
      if (r.id === id) return updated;
      if (status === 'Entregada' && r.itemId === updated.itemId && r.status === 'Pendiente') return { ...r, status: 'Rechazada' };
      return r;
    }));
  }, options);

  const remove = (id) => run(id, async () => {
    await deleteReceivedRequest(id);
    setItems((list) => list.filter((r) => r.id !== id));
  });

  return { items, loading, error, busyId, respond, remove };
}
