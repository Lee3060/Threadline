import { useCallback, useState } from 'react';
import { SlidersHorizontal, SearchX, WifiOff } from 'lucide-react';
import useProductFilters from './useProductFilters';
import useProducts from './useProducts';
import useCategories from './useCategories';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import SortSelect from './SortSelect';
import SearchBox from './SearchBox';
import ActiveFilters from './ActiveFilters';
import SkeletonGrid from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { useCart } from '../cart/CartContext';
import './ProductListing.css';

export default function ProductListing() {
  const { filters, setFilters, clearFilters, activeCount } = useProductFilters();
  const { products, total, priceRange, loading, initialLoading, error, retry } = useProducts(filters);
  const { categories } = useCategories();
  const cart = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const activeCategory = categories.find((c) => c.slug === filters.category);
  const heading = activeCategory?.name || (filters.search ? 'Search results' : 'All products');

  let body;
  if (error && !products.length) {
    body = (
      <EmptyState
        icon={WifiOff}
        title="Couldn't load products"
        action={<button type="button" className="btn btn--primary" onClick={retry}>Retry</button>}
      >
        {error}
      </EmptyState>
    );
  } else if (initialLoading) {
    body = <SkeletonGrid count={8} />;
  } else if (!loading && products.length === 0) {
    body = (
      <EmptyState
        icon={SearchX}
        title="No products match"
        action={<button type="button" className="btn btn--primary" onClick={clearFilters}>Clear filters</button>}
      >
        Try a different search, another category or a wider price range.
      </EmptyState>
    );
  } else {
    body = (
      <div className={`product-grid${loading ? ' is-refreshing' : ''}`} aria-busy={loading || undefined}>
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            index={i}
            product={p}
            quantity={cart.getQuantity(p.id)}
            maxQty={cart.maxQty}
            busy={cart.isBusy(p.id)}
            onAdd={cart.add}
            onUpdate={cart.update}
            onRemove={cart.remove}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="hero__eyebrow">Innerwear · Thermals · Loungewear</p>
          <h1 className="hero__title">
            Soft basics, <em>made to be lived in.</em>
          </h1>
          <p className="hero__text">Breathable cotton, modal and merino for every day of the year. Free shipping above ₹999.</p>
        </div>
      </section>

      <div className="container listing">
        <FilterPanel
          filters={filters}
          categories={categories}
          priceRange={priceRange}
          onChange={setFilters}
          open={drawerOpen}
          onClose={closeDrawer}
          resultCount={total}
        />

        <section className="listing__main" aria-labelledby="listing-title">
          <div className="toolbar">
            <SearchBox value={filters.search} onChange={(search) => setFilters({ search }, { replace: true })} />
            <div className="toolbar__row">
              <button type="button" className="btn btn--outline filter-toggle" onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filters
                {activeCount > 0 && <span className="filter-toggle__count">{activeCount}</span>}
              </button>
              <SortSelect value={filters.sort} onChange={(sort) => setFilters({ sort })} />
            </div>
          </div>

          <div className="listing__head">
            <h2 id="listing-title" className="listing__title">{heading}</h2>
            {!initialLoading && !error && (
              <p className="listing__count" aria-live="polite">
                {total} {total === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>

          <ActiveFilters filters={filters} categories={categories} onRemove={setFilters} onClear={clearFilters} />

          {body}
        </section>
      </div>
    </>
  );
}
