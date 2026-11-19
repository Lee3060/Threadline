import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../features/cart/CartContext';
import routes from './routes';
import './Layout.css';

export function CartButton() {
  const { itemCount } = useCart();
  const [bump, setBump] = useState(false);
  const prev = useRef(itemCount);

  useEffect(() => {
    if (itemCount !== prev.current) {
      prev.current = itemCount;
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [itemCount]);

  return (
    <Link to="/cart" className="cart-btn" aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}>
      <ShoppingBag size={20} aria-hidden="true" />
      <span className="cart-btn__label">Cart</span>
      <span className={`cart-btn__badge${bump ? ' is-bumping' : ''}${itemCount === 0 ? ' is-empty' : ''}`} data-testid="cart-count">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </Link>
  );
}

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    const route = routes.find((r) => r.path === pathname) || routes[routes.length - 1];
    document.title = route.path === '/' ? 'Threadline · Everyday innerwear' : `${route.title} · Threadline`;
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="logo" aria-label="Threadline home">
            <span className="logo__mark" aria-hidden="true">T</span>
            <span className="logo__word">Threadline</span>
          </Link>
          <CartButton />
        </div>
      </header>

      <main id="main" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p className="logo__word logo__word--sm">Threadline</p>
          <p>Prices exclude GST (5%, added at checkout). Free shipping above ₹999.</p>
          {/* <p className="site-footer__fine">A demo store built with React, Flask and MySQL.</p> */}
        </div>
      </footer>
    </div>
  );
}
