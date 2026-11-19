import { describe, expect, it } from 'vitest';
import { CART_TOKEN_KEY, getCartToken } from './cartToken';

describe('getCartToken', () => {
  it('creates a UUID once and reuses it', () => {
    const first = getCartToken();
    expect(first).toMatch(/^[0-9a-f-]{36}$/i);
    expect(window.localStorage.getItem(CART_TOKEN_KEY)).toBe(first);
    expect(getCartToken()).toBe(first);
  });

  it('replaces a corrupted saved token', () => {
    window.localStorage.setItem(CART_TOKEN_KEY, 'not-a-uuid');
    expect(getCartToken()).not.toBe('not-a-uuid');
  });
});
