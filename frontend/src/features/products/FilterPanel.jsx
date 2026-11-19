import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import './FilterPanel.css';

function PriceFields({ min, max, bounds, onApply }) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  useEffect(() => { setLo(min); setHi(max); }, [min, max]);

  const invalid = lo !== '' && hi !== '' && Number(lo) > Number(hi);
  const changed = lo !== min || hi !== max;

  const submit = (e) => {
    e.preventDefault();
    if (!invalid) onApply({ min_price: lo, max_price: hi });
  };

  return (
    <form className="price-fields" onSubmit={submit} noValidate>
      <div className="price-fields__row">
        <label className="field">
          <span className="field__label">Min</span>
          <span className="field__input-wrap">
            <span aria-hidden="true">₹</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder={bounds ? String(Math.floor(bounds.min)) : '0'}
              value={lo}
              onChange={(e) => setLo(e.target.value)}
              aria-label="Minimum price"
              aria-invalid={invalid || undefined}
            />
          </span>
        </label>
        <span className="price-fields__dash" aria-hidden="true">–</span>
        <label className="field">
          <span className="field__label">Max</span>
          <span className="field__input-wrap">
            <span aria-hidden="true">₹</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder={bounds ? String(Math.ceil(bounds.max)) : ''}
              value={hi}
              onChange={(e) => setHi(e.target.value)}
              aria-label="Maximum price"
              aria-invalid={invalid || undefined}
            />
          </span>
        </label>
      </div>
      {invalid && <p className="field__error" role="alert">Min price can't be more than max.</p>}
      {bounds && !invalid && (
        <p className="field__hint">
          Range {formatPrice(bounds.min)} – {formatPrice(bounds.max)}
        </p>
      )}
      <button type="submit" className="btn btn--outline btn--block btn--sm" disabled={invalid || !changed}>
        Apply price
      </button>
    </form>
  );
}

/**
 * Category list + price range. A sidebar on desktop; on mobile the same panel slides up as a drawer.
 */
export default function FilterPanel({ filters, categories, priceRange, totalCount, onChange, open, onClose, resultCount }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [open, onClose]);

  const allCount = totalCount ?? categories.reduce((n, c) => n + c.product_count, 0);

  return (
    <>
      <div className={`drawer-backdrop${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`filters${open ? ' is-open' : ''}`}
        aria-label="Filters"
        {...(open ? { role: 'dialog', 'aria-modal': 'true' } : {})}
      >
        <div className="filters__head">
          <h2 className="filters__title">Filters</h2>
          <button ref={closeRef} type="button" className="icon-btn filters__close" onClick={onClose} aria-label="Close filters">
            <X size={20} />
          </button>
        </div>

        <div className="filters__body">
          <fieldset className="filter-group">
            <legend className="filter-group__title">Category</legend>
            <ul className="cat-list">
              {[{ slug: '', name: 'All products', product_count: allCount }, ...categories].map((c) => {
                const active = filters.category === c.slug;
                return (
                  <li key={c.slug || 'all'}>
                    <label className={`cat-option${active ? ' is-active' : ''}`}>
                      <input
                        type="radio"
                        name="category"
                        value={c.slug}
                        checked={active}
                        onChange={() => onChange({ category: c.slug })}
                      />
                      <span className="cat-option__name">{c.name}</span>
                      <span className="cat-option__count">{c.product_count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset className="filter-group">
            <legend className="filter-group__title">Price</legend>
            <PriceFields min={filters.min_price} max={filters.max_price} bounds={priceRange} onApply={onChange} />
          </fieldset>
        </div>

        <div className="filters__foot">
          <button type="button" className="btn btn--primary btn--block" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </button>
        </div>
      </aside>
    </>
  );
}
