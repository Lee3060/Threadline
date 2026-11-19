import { ShoppingBag, Star, Loader2 } from 'lucide-react';
import QuantityStepper from '../../components/QuantityStepper';
import { formatPrice } from '../../utils/formatPrice';
import './ProductCard.css';

export default function ProductCard({ product, quantity = 0, maxQty = 10, busy = false, onAdd, onUpdate, onRemove, index = 0 }) {
  const { name, price, mrp, discount_percent, short_description, image_url, rating, review_count, in_stock, stock, category } = product;
  const max = Math.min(maxQty, stock || maxQty);

  let action;
  if (!in_stock) {
    action = (
      <button type="button" className="btn btn--block btn--disabled" disabled>
        Out of stock
      </button>
    );
  } else if (quantity > 0) {
    action = (
      <QuantityStepper
        value={quantity}
        max={max}
        busy={busy}
        label={name}
        onChange={(q) => onUpdate(product.id, q)}
        onRemove={() => onRemove(product.id, name)}
      />
    );
  } else {
    action = (
      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => onAdd(product)}
        disabled={busy}
        aria-label={`Add ${name} to cart`}
      >
        {busy ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
        {busy ? 'Adding…' : 'Add to cart'}
      </button>
    );
  }

  return (
    <article className={`card product-card${in_stock ? '' : ' is-oos'}`} style={{ '--i': Math.min(index, 11) }}>
      <div className="product-card__media">
        <img src={image_url} alt={name} width="400" height="400" loading="lazy" decoding="async" />
        {!in_stock ? (
          <span className="badge badge--muted">Sold out</span>
        ) : discount_percent > 0 ? (
          <span className="badge">{discount_percent}% off</span>
        ) : null}
      </div>

      <div className="product-card__body">
        <p className="product-card__cat">{category?.name}</p>
        <h3 className="product-card__name">{name}</h3>
        <p className="product-card__desc">{short_description}</p>

        <div className="product-card__rating" aria-label={`Rated ${rating} out of 5 from ${review_count} reviews`}>
          <Star size={14} aria-hidden="true" />
          <span>{rating.toFixed(1)}</span>
          <span className="product-card__reviews">({review_count.toLocaleString('en-IN')})</span>
        </div>

        <div className="product-card__foot">
          <p className="product-card__price">
            <span className="price">{formatPrice(price)}</span>
            {mrp > price && (
              <s className="mrp" aria-label={`MRP ${formatPrice(mrp)}`}>
                {formatPrice(mrp)}
              </s>
            )}
          </p>
          <div className="product-card__action">{action}</div>
        </div>
      </div>
    </article>
  );
}
