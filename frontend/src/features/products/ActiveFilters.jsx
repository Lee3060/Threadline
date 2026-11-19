import { X } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

export default function ActiveFilters({ filters, categories, onRemove, onClear }) {
  const chips = [];
  if (filters.category) {
    const name = categories.find((c) => c.slug === filters.category)?.name || filters.category;
    chips.push({ keys: ['category'], label: name });
  }
  if (filters.search) chips.push({ keys: ['search'], label: `“${filters.search}”` });
  if (filters.min_price || filters.max_price) {
    const { min_price: lo, max_price: hi } = filters;
    const label = lo && hi ? `${formatPrice(lo)} – ${formatPrice(hi)}` : lo ? `From ${formatPrice(lo)}` : `Up to ${formatPrice(hi)}`;
    chips.push({ keys: ['min_price', 'max_price'], label });
  }
  if (chips.length === 0) return null;

  return (
    <div className="chips" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.keys[0]}
          type="button"
          className="chip"
          onClick={() => onRemove(Object.fromEntries(chip.keys.map((k) => [k, ''])))}
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X size={14} aria-hidden="true" />
        </button>
      ))}
      {chips.length > 1 && (
        <button type="button" className="link-btn link-btn--muted" onClick={onClear}>
          Clear all
        </button>
      )}
    </div>
  );
}
