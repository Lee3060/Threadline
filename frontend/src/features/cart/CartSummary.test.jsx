import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartSummary from './CartSummary';

const summary = {
  item_count: 2, subtotal: 1298, savings: 500, gst_rate: 5, gst_amount: 64.9,
  shipping: 0, free_shipping_above: 999, total: 1362.9,
};

describe('CartSummary', () => {
  it('shows subtotal, savings, GST 5%, shipping and total from the API', () => {
    render(<CartSummary summary={summary} onCheckout={() => {}} />);
    expect(screen.getByTestId('summary-subtotal')).toHaveTextContent('₹1,298');
    expect(screen.getByTestId('summary-savings')).toHaveTextContent('₹500');
    expect(screen.getByText('GST @ 5%')).toBeInTheDocument();
    expect(screen.getByTestId('summary-gst')).toHaveTextContent('₹64.9');
    expect(screen.getByTestId('summary-shipping')).toHaveTextContent('Free');
    expect(screen.getByTestId('summary-total')).toHaveTextContent('₹1,362.9');
    expect(screen.getByText(/free shipping/i)).toBeInTheDocument();
    expect(screen.getByText('Prices exclude GST; GST is added at checkout.')).toBeInTheDocument();
  });

  it('shows the shipping fee and how much more is needed for free shipping', () => {
    render(
      <CartSummary
        summary={{ ...summary, item_count: 1, subtotal: 649, savings: 250, gst_amount: 32.45, shipping: 49, total: 730.45 }}
        onCheckout={() => {}}
      />,
    );
    expect(screen.getByTestId('summary-shipping')).toHaveTextContent('₹49');
    expect(screen.getByText('₹350')).toBeInTheDocument(); // 999 − 649
    expect(screen.getByTestId('summary-total')).toHaveTextContent('₹730.45');
  });

  it('calls onCheckout and disables it for an empty cart', async () => {
    const onCheckout = vi.fn();
    const { rerender } = render(<CartSummary summary={summary} onCheckout={onCheckout} />);
    await userEvent.click(screen.getByRole('button', { name: /checkout/i }));
    expect(onCheckout).toHaveBeenCalled();

    rerender(<CartSummary summary={{ ...summary, item_count: 0, subtotal: 0, total: 0 }} onCheckout={onCheckout} />);
    expect(screen.getByRole('button', { name: /checkout/i })).toBeDisabled();
  });
});
