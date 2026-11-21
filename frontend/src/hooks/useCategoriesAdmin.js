import { useEffect, useState } from 'react';
import { createCategory, getCategories, setCategoryStatus, updateCategory } from '../services/categoriesService.js';

export default function useCategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => active && setCategories(data))
      .catch(() => active && setError('No pudimos cargar las categorías.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const create = async (name) => {
    const category = await createCategory(name);
    setCategories((list) => [...list, category]);
  };

  const update = async (id, name) => {
    const category = await updateCategory(id, name);
    setCategories((list) => list.map((c) => (c.id === id ? category : c)));
  };

  const toggle = async (category) => {
    setBusyId(category.id);
    setError(null);
    try {
      const next = category.status === 'Activa' ? 'Inactiva' : 'Activa';
      const updated = await setCategoryStatus(category.id, next);
      setCategories((list) => list.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return { categories, loading, error, busyId, create, update, toggle };
}
