import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, RotateCw } from 'lucide-react';
import { useCart } from './CartContext';
import { useToast } from '../../components/Toast';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';
import EmptyState from '../../components/EmptyState';
import './CartPage.css';

export default function CartPage() {
  const { items, summary, maxQty, status, error, isBusy, update, remove, clear, refresh } = useCart();
  const toast = useToast();

  const checkout = () => toast.info('Checkout is a demo here: payments are outside this assignment.');

  let content;
  if (status === 'loading') {
    content = (
      <div className="cart-loading" role="status" aria-label="Loading cart">
        <div className="skeleton" style={{ height: 120 }} />
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  } else if (status === 'error') {
    content = (
      <EmptyState
        icon={RotateCw}
        title="Couldn't load your cart"
        action={<button type="button" className="btn btn--primary" onClick={refresh}>Try again</button>}
      >
        {error}
      </EmptyState>
    );
  } else if (items.length === 0) {
    content = (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        action={<Link to="/" className="btn btn--primary">Continue shopping</Link>}
      >
        Soft basics are waiting. Add a few favourites and they'll show up here.
      </EmptyState>
    );
  } else {
    content = (
      <div className="cart-layout">
        <section aria-label="Cart items">
          <ul className="cart-list card">
            {items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                maxQty={maxQty}
                busy={isBusy(item.product.id)}
                onUpdate={update}
                onRemove={remove}
              />
            ))}
          </ul>
          <div className="cart-list__footer">
            <Link to="/" className="link-btn">
              <ArrowLeft size={16} aria-hidden="true" /> Continue shopping
            </Link>
            <button type="button" className="link-btn link-btn--muted" onClick={clear} disabled={isBusy('__all__')}>
              Clear cart
            </button>
          </div>
        </section>
        <CartSummary summary={summary} onCheckout={checkout} />
      </div>
    );
  }

  return (
    <div className="container page-pad cart-page">
      <header className="page-head">
        <h1 className="page-title">Your cart</h1>
        {summary.item_count > 0 && (
          <p className="page-sub">
            {summary.item_count} {summary.item_count === 1 ? 'item' : 'items'}
          </p>
        )}
      </header>
      {content}
    </div>
  );
}
