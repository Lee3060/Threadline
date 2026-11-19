import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartButton } from './Layout';
import { CartProvider } from '../features/cart/CartContext';
import { cartWith, makeProduct } from '../test/fixtures';
import * as cartApi from '../api/cart';

vi.mock('../api/cart', () => ({
  getCart: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe('CartButton', () => {
  it('shows the item count from the saved cart and links to /cart', async () => {
    cartApi.getCart.mockResolvedValue(cartWith(makeProduct(), 3));
    render(
      <MemoryRouter>
        <CartProvider>
          <CartButton />
        </CartProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart, 3 items' })).toHaveAttribute('href', '/cart');
  });
});
