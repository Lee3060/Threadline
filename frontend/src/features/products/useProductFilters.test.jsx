import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import useProductFilters from './useProductFilters';

function setup(initial = '/') {
  const wrapper = ({ children }) => <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>;
  return renderHook(() => ({ ...useProductFilters(), location: useLocation() }), { wrapper });
}

describe('useProductFilters', () => {
  it('reads filters from the URL', () => {
    const { result } = setup('/?category=socks&sort=price_desc&search=wool&min_price=300&max_price=900');
    expect(result.current.filters).toEqual({
      category: 'socks', search: 'wool', sort: 'price_desc', min_price: '300', max_price: '900',
    });
    expect(result.current.activeCount).toBe(4);
  });

  it('falls back to defaults for missing or invalid values', () => {
    const { result } = setup('/?sort=cheapest&min_price=-5&max_price=abc');
    expect(result.current.filters).toEqual({ category: '', search: '', sort: 'featured', min_price: '', max_price: '' });
    expect(result.current.activeCount).toBe(0);
  });

  it('writes changes to the URL and drops empty values and the default sort', () => {
    const { result } = setup('/?search=cotton');
    act(() => result.current.setFilters({ category: 'thermals', sort: 'price_asc' }));
    expect(result.current.location.search).toBe('?search=cotton&category=thermals&sort=price_asc');

    act(() => result.current.setFilters({ search: '', sort: 'featured' }));
    expect(result.current.location.search).toBe('?category=thermals');
  });

  it('clearFilters removes filters but keeps the sort', () => {
    const { result } = setup('/?category=socks&search=wool&sort=rating&min_price=100');
    act(() => result.current.clearFilters());
    expect(result.current.location.search).toBe('?sort=rating');
  });
});
