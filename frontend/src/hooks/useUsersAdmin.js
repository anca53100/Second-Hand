import { useEffect, useState } from 'react';
import { getUsers, setUserRole, setUserStatus } from '../services/usersService.js';

export default function useUsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    getUsers()
      .then((data) => active && setUsers(data))
      .catch(() => active && setError('No pudimos cargar los usuarios.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const upsert = (updated) => setUsers((list) => (list.some((u) => u.id === updated.id)
    ? list.map((u) => (u.id === updated.id ? updated : u))
    : [updated, ...list]));

  const toggleStatus = async (user) => {
    setBusyId(user.id);
    setError(null);
    try {
      upsert(await setUserStatus(user.id, user.status === 'Activo' ? 'Inactivo' : 'Activo'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const setRole = async (user, role) => {
    setBusyId(user.id);
    try {
      upsert(await setUserRole(user.id, role));
    } finally {
      setBusyId(null);
    }
  };

  return { users, loading, error, busyId, toggleStatus, setRole };
}
