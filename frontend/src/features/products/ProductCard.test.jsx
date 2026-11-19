import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';
import { makeProduct } from '../../test/fixtures';

const handlers = () => ({ onAdd: vi.fn(), onUpdate: vi.fn(), onRemove: vi.fn() });

describe('ProductCard', () => {
  it('shows image, name, category, description, price, MRP and discount', () => {
    render(<ProductCard product={makeProduct()} {...handlers()} />);
    expect(screen.getByRole('heading', { name: 'Everyday Cotton Trunks (Pack of 3)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Everyday Cotton Trunks (Pack of 3)' })).toHaveAttribute('src', '/products/trunks-navy.svg');
    expect(screen.getByText("Men's Innerwear")).toBeInTheDocument();
    expect(screen.getByText(/no-dig waistband/)).toBeInTheDocument();
    expect(screen.getByText('₹649')).toBeInTheDocument();
    expect(screen.getByText('₹899')).toBeInTheDocument();
    expect(screen.getByText('28% off')).toBeInTheDocument();
  });

  it('calls onAdd with the product when Add to cart is clicked', async () => {
    const h = handlers();
    const product = makeProduct();
    render(<ProductCard product={product} {...h} />);
    await userEvent.click(screen.getByRole('button', { name: /add .* to cart/i }));
    expect(h.onAdd).toHaveBeenCalledWith(product);
  });

  it('shows a quantity stepper once the product is in the cart', async () => {
    const h = handlers();
    render(<ProductCard product={makeProduct()} quantity={2} {...h} />);
    expect(screen.queryByRole('button', { name: /add .* to cart/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Quantity 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(h.onUpdate).toHaveBeenCalledWith(1, 3);
    await userEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(h.onUpdate).toHaveBeenCalledWith(1, 1);
  });

  it('disables the button for an out-of-stock product', () => {
    render(<ProductCard product={makeProduct({ in_stock: false, stock: 0 })} {...handlers()} />);
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });

  it('disables the button while the request is running', () => {
    render(<ProductCard product={makeProduct()} busy {...handlers()} />);
    expect(screen.getByRole('button', { name: /add .* to cart/i })).toBeDisabled();
    expect(screen.getByText('Adding…')).toBeInTheDocument();
  });
});
