import ProductListing from '../features/products/ProductListing';
import CartPage from '../features/cart/CartPage';
import NotFound from '../components/NotFound';

const routes = [
  { path: '/', element: ProductListing, title: 'Shop' },
  { path: '/cart', element: CartPage, title: 'Cart' },
  { path: '*', element: NotFound, title: 'Not found' },
];

export default routes;
