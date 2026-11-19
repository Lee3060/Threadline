import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductListing from './ProductListing';
import { CartProvider } from '../cart/CartContext';
import { ToastProvider } from '../../components/Toast';
import { CartButton } from '../../app/Layout';
import { CATEGORIES, cartWith, emptyCart, makeProduct } from '../../test/fixtures';
import * as productsApi from '../../api/products';
import * as cartApi from '../../api/cart';

vi.mock('../../api/products', () => ({ getProducts: vi.fn(), getCategories: vi.fn() }));
vi.mock('../../api/cart', () => ({
  getCart: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(),
}));

const trunks = makeProduct();
const socks = makeProduct({
  id: 15, name: 'Wool Blend Winter Socks', price: 449, mrp: 649, discount_percent: 31, in_stock: false, stock: 0,
  category: { id: 5, name: 'Socks', slug: 'socks' },
});
const page = (items) => ({ items, total: items.length, price_range: { min: 299, max: 1899 } });

function renderListing(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ToastProvider>
        <CartProvider>
          <CartButton />
          <Routes>
            <Route path="/" element={<ProductListing />} />
          </Routes>
        </CartProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

const lastParams = () => productsApi.getProducts.mock.calls.at(-1)[0];

beforeEach(() => {
  vi.clearAllMocks();
  productsApi.getProducts.mockResolvedValue(page([trunks, socks]));
  productsApi.getCategories.mockResolvedValue(CATEGORIES);
  cartApi.getCart.mockResolvedValue(emptyCart());
});

describe('ProductListing', () => {
  it('renders products with a result count', async () => {
    renderListing();
    expect(await screen.findByRole('heading', { name: trunks.name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: socks.name })).toBeInTheDocument();
    expect(screen.getByText('2 products')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
  });

  it('requests the right parameters when the sort changes', async () => {
    renderListing();
    await screen.findByRole('heading', { name: trunks.name });
    expect(lastParams()).toMatchObject({ sort: 'featured', category: '' });

    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'price_asc');
    await waitFor(() => expect(lastParams()).toMatchObject({ sort: 'price_asc' }));
  });

  it('requests the right parameters when a category is picked, and keeps the sort', async () => {
    renderListing('/?sort=price_desc');
    await screen.findByRole('heading', { name: trunks.name });
    const filters = screen.getByRole('complementary', { name: 'Filters' });
    await userEvent.click(await within(filters).findByRole('radio', { name: /socks/i }));
    await waitFor(() => expect(lastParams()).toMatchObject({ category: 'socks', sort: 'price_desc' }));
    expect(screen.getByRole('button', { name: /remove filter socks/i })).toBeInTheDocument();
  });

  it('reads filters from the URL on first load', async () => {
    renderListing('/?category=socks&search=wool&min_price=300');
    await screen.findByRole('heading', { name: trunks.name });
    expect(productsApi.getProducts.mock.calls[0][0]).toMatchObject({ category: 'socks', search: 'wool', min_price: '300' });
  });

  it('sends the search term after typing stops', async () => {
    renderListing();
    await screen.findByRole('heading', { name: trunks.name });
    await userEvent.type(screen.getByLabelText('Search products'), 'thermal');
    await waitFor(() => expect(lastParams()).toMatchObject({ search: 'thermal' }));
    expect(productsApi.getProducts.mock.calls.filter(([p]) => p.search === 't')).toHaveLength(0);
  });

  it('shows an empty state with Clear filters when nothing matches', async () => {
    productsApi.getProducts.mockResolvedValue(page([]));
    renderListing('/?search=zzz');
    expect(await screen.findByText('No products match')).toBeInTheDocument();

    productsApi.getProducts.mockResolvedValue(page([trunks]));
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByRole('heading', { name: trunks.name })).toBeInTheDocument();
    expect(lastParams().search).toBe('');
  });

  it('shows an error state with Retry', async () => {
    productsApi.getProducts.mockRejectedValueOnce(new Error('Could not reach the server.'));
    renderListing();
    expect(await screen.findByText("Couldn't load products")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { name: trunks.name })).toBeInTheDocument();
  });

  it('Add to cart updates the header badge', async () => {
    cartApi.addItem.mockResolvedValue(cartWith(trunks, 1));
    renderListing();
    await screen.findByRole('heading', { name: trunks.name });
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');

    await userEvent.click(screen.getByRole('button', { name: `Add ${trunks.name} to cart` }));
    expect(cartApi.addItem).toHaveBeenCalledWith(trunks.id, 1);
    await waitFor(() => expect(screen.getByTestId('cart-count')).toHaveTextContent('1'));
    expect(screen.getByLabelText('Quantity 1')).toBeInTheDocument();
    expect(await screen.findByText(`${trunks.name} added to cart`)).toBeInTheDocument();
  });

  it('shows the backend message as a toast when adding fails', async () => {
    cartApi.addItem.mockRejectedValue(new Error('Only 3 left in stock'));
    renderListing();
    await screen.findByRole('heading', { name: trunks.name });
    await userEvent.click(screen.getByRole('button', { name: `Add ${trunks.name} to cart` }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Only 3 left in stock');
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });
});
