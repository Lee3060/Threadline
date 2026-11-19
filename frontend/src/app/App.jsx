import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';
import { CartProvider } from '../features/cart/CartContext';
import Layout from './Layout';
import routes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              {routes.map(({ path, element: Page }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ErrorBoundary>
                      <Page />
                    </ErrorBoundary>
                  }
                />
              ))}
            </Route>
          </Routes>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
