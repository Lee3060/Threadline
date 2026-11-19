import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats rupees with Indian digit grouping', () => {
    expect(formatPrice(649)).toBe('₹649');
    expect(formatPrice(1362.9)).toBe('₹1,362.9');
    expect(formatPrice(125000)).toBe('₹1,25,000');
  });

  it('keeps paise up to two decimals', () => {
    expect(formatPrice(64.95)).toBe('₹64.95');
  });

  it('treats bad input as zero', () => {
    expect(formatPrice(undefined)).toBe('₹0');
    expect(formatPrice('abc')).toBe('₹0');
  });
});
