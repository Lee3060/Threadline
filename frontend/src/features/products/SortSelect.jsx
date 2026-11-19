import { ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS } from './useProductFilters';

export default function SortSelect({ value, onChange }) {
  return (
    <label className="sort">
      <ArrowUpDown size={16} aria-hidden="true" className="sort__icon" />
      <span className="visually-hidden">Sort by</span>
      <select className="sort__select" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Sort by">
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
