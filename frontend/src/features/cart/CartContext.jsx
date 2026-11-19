import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as cartApi from '../../api/cart';
import { useToast } from '../../components/Toast';

const CartContext = createContext(null);

const EMPTY_SUMMARY = {
  item_count: 0,
  subtotal: 0,
  savings: 0,
  gst_rate: 5,
  gst_amount: 0,
  shipping: 0,
  free_shipping_above: 999,
  total: 0,
};
export const EMPTY_CART = { items: [], summary: EMPTY_SUMMARY, max_qty_per_item: 10 };

export function CartProvider({ children }) {
  const toast = useToast();
  const [cart, setCart] = useState(EMPTY_CART);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({}); // { [productId]: true } while a request runs
  const busyRef = useRef(busy);
  busyRef.current = busy;

  const refresh = useCallback(async () => {
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      setCart(await cartApi.getCart());
      setError(null);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Runs one cart request for a product, with a per-product busy flag and toasts. */
  const run = useCallback(
    async (productId, request, successMsg) => {
      if (busyRef.current[productId]) return false;
      setBusy((b) => ({ ...b, [productId]: true }));
      try {
        const next = await request();
        setCart(next);
        setStatus('ready');
        if (successMsg) toast.success(successMsg);
        return true;
      } catch (err) {
        toast.error(err.message);
        return false;
      } finally {
        setBusy((b) => {
          const { [productId]: _, ...rest } = b;
          return rest;
        });
      }
    },
    [toast],
  );

  const add = useCallback(
    (product, quantity = 1) =>
      run(product.id, () => cartApi.addItem(product.id, quantity), `${product.name} added to cart`),
    [run],
  );
  const update = useCallback((productId, quantity) => run(productId, () => cartApi.updateItem(productId, quantity)), [run]);
  const remove = useCallback(
    (productId, name) => run(productId, () => cartApi.removeItem(productId), name ? `${name} removed` : 'Item removed'),
    [run],
  );
  const clear = useCallback(() => run('__all__', () => cartApi.clearCart(), 'Cart cleared'), [run]);

  const quantities = useMemo(
    () => Object.fromEntries(cart.items.map((i) => [i.product.id, i.quantity])),
    [cart.items],
  );

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      summary: cart.summary,
      maxQty: cart.max_qty_per_item,
      itemCount: cart.summary.item_count,
      status,
      error,
      busy,
      isBusy: (id) => Boolean(busy[id]),
      getQuantity: (id) => quantities[id] || 0,
      add,
      update,
      remove,
      clear,
      refresh,
    }),
    [cart, status, error, busy, quantities, add, update, remove, clear, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export default CartContext;
