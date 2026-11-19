import { useCallback, useEffect, useState } from 'react';
import { getProducts } from '../../api/products';
import { isCancel } from '../../api/client';

/** Fetches products whenever the filters change; an older request is cancelled. */
export default function useProducts(filters) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(filters);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    getProducts(JSON.parse(key), controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (isCancel(err) || controller.signal.aborted) return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      });
    return () => controller.abort();
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    products: state.data?.items ?? [],
    total: state.data?.total ?? 0,
    priceRange: state.data?.price_range ?? null,
    loading: state.loading,
    initialLoading: state.loading && !state.data,
    error: state.error,
    retry,
  };
}
