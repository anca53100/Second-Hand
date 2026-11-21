import { useEffect, useState } from 'react';
import { getActiveCategoryNames } from '../services/categoriesService.js';

export default function useActiveCategories() {
  const [names, setNames] = useState([]);

  useEffect(() => {
    let active = true;
    getActiveCategoryNames()
      .then((list) => active && setNames(list))
      .catch(() => active && setNames([]));
    return () => { active = false; };
  }, []);

  return names;
}
