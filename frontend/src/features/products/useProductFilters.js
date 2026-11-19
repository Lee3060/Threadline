import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
];
const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));
export const DEFAULT_SORT = 'featured';
const KEYS = ['category', 'search', 'sort', 'min_price', 'max_price'];

function toPrice(raw) {
  if (raw === null || raw === '') return '';
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? String(n) : '';
}

/**
 * Filters live in the URL (?category=&sort=&search=&min_price=&max_price=), so refresh,
 * sharing a link and the browser's back/forward buttons all keep them.
 */
export default function useProductFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const sort = params.get('sort');
    return {
      category: params.get('category') || '',
      search: (params.get('search') || '').trim(),
      sort: SORT_VALUES.has(sort) ? sort : DEFAULT_SORT,
      min_price: toPrice(params.get('min_price')),
      max_price: toPrice(params.get('max_price')),
    };
  }, [params]);

  /** Merges changes into the URL. Empty values and the default sort are left out. */
  const setFilters = useCallback(
    (changes, { replace = false } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([key, value]) => {
            const v = value === undefined || value === null ? '' : String(value).trim();
            if (!v || (key === 'sort' && v === DEFAULT_SORT)) next.delete(key);
            else next.set(key, v);
          });
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  const clearFilters = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      KEYS.forEach((k) => k !== 'sort' && next.delete(k));
      return next;
    });
  }, [setParams]);

  const activeCount = ['category', 'search', 'min_price', 'max_price'].filter((k) => filters[k]).length;

  return { filters, setFilters, clearFilters, activeCount };
}
