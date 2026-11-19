import { Lock, Truck } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

export default function CartSummary({ summary, onCheckout }) {
  const { item_count, subtotal, savings, gst_rate, gst_amount, shipping, free_shipping_above, total } = summary;
  const toFree = Math.max(0, free_shipping_above - subtotal);
  const progress = Math.min(100, (subtotal / free_shipping_above) * 100);

  return (
    <aside className="cart-summary card" aria-labelledby="summary-title">
      <h2 id="summary-title" className="cart-summary__title">Order summary</h2>

      {item_count > 0 && (
        <div className="ship-meter">
          <p className="ship-meter__text">
            <Truck size={16} aria-hidden="true" />
            {toFree > 0 ? (
              <span>
                Add <strong>{formatPrice(toFree)}</strong> more for free shipping
              </span>
            ) : (
              <span>You've unlocked <strong>free shipping</strong></span>
            )}
          </p>
          <div className="ship-meter__bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <dl className="summary-rows">
        <div className="summary-row">
          <dt>Subtotal ({item_count} {item_count === 1 ? 'item' : 'items'})</dt>
          <dd data-testid="summary-subtotal">{formatPrice(subtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className="summary-row summary-row--save">
            <dt>You save</dt>
            <dd data-testid="summary-savings">−{formatPrice(savings)}</dd>
          </div>
        )}
        <div className="summary-row">
          <dt>GST @ {gst_rate}%</dt>
          <dd data-testid="summary-gst">{formatPrice(gst_amount)}</dd>
        </div>
        <div className="summary-row">
          <dt>Shipping</dt>
          <dd data-testid="summary-shipping">{shipping > 0 ? formatPrice(shipping) : 'Free'}</dd>
        </div>
        <div className="summary-row summary-row--total">
          <dt>Total</dt>
          <dd data-testid="summary-total">{formatPrice(total)}</dd>
        </div>
      </dl>

      <button type="button" className="btn btn--primary btn--block btn--lg" onClick={onCheckout} disabled={item_count === 0}>
        <Lock size={16} aria-hidden="true" /> Checkout
      </button>
      <p className="cart-summary__note">Prices exclude GST; GST is added at checkout.</p>
    </aside>
  );
}
