import client from './client';

export const getCart = () => client.get('/cart');
export const addItem = (productId, quantity = 1) => client.post('/cart/items', { product_id: productId, quantity });
export const updateItem = (productId, quantity) => client.patch(`/cart/items/${productId}`, { quantity });
export const removeItem = (productId) => client.delete(`/cart/items/${productId}`);
export const clearCart = () => client.delete('/cart');
