import client from './client';

/** Drops empty values so the URL only carries filters that are set. */
function clean(params) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
}

export function getProducts(params = {}, signal) {
  return client.get('/products', { params: clean(params), signal });
}

export function getCategories(signal) {
  return client.get('/categories', { signal });
}
