import { X } from 'lucide-react';
import QuantityStepper from '../../components/QuantityStepper';
import { formatPrice } from '../../utils/formatPrice';

export default function CartItemRow({ item, maxQty, busy, onUpdate, onRemove }) {
  const { product, quantity, line_total } = item;
  const max = Math.min(maxQty, product.stock || maxQty);

  return (
    <li className="cart-row">
      <div className="cart-row__thumb">
        <img src={product.image_url} alt="" width="96" height="96" loading="lazy" />
      </div>
      <div className="cart-row__info">
        <p className="cart-row__cat">{product.category?.name}</p>
        <h3 className="cart-row__name">{product.name}</h3>
        <p className="cart-row__price">
          {formatPrice(product.price)}
          {product.mrp > product.price && <s>{formatPrice(product.mrp)}</s>}
        </p>
        <div className="cart-row__controls">
          <QuantityStepper
            size="sm"
            value={quantity}
            max={max}
            busy={busy}
            label={product.name}
            onChange={(q) => onUpdate(product.id, q)}
            onRemove={() => onRemove(product.id, product.name)}
          />
          <span className="cart-row__total" aria-label={`Line total ${formatPrice(line_total)}`}>
            {formatPrice(line_total)}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="icon-btn cart-row__remove"
        onClick={() => onRemove(product.id, product.name)}
        disabled={busy}
        aria-label={`Remove ${product.name}`}
      >
        <X size={18} />
      </button>
    </li>
  );
}
