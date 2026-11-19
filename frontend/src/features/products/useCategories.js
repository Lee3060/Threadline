import { useEffect, useState } from 'react';
import { getCategories } from '../../api/products';
import { isCancel } from '../../api/client';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then((data) => setCategories(data || []))
      .catch((err) => {
        if (!isCancel(err) && !controller.signal.aborted) setError(err.message);
      });
    return () => controller.abort();
  }, []);

  return { categories, error };
}
