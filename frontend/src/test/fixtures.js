export const makeProduct = (overrides = {}) => ({
  id: 1,
  name: 'Everyday Cotton Trunks (Pack of 3)',
  slug: 'everyday-cotton-trunks',
  price: 649,
  mrp: 899,
  discount_percent: 28,
  short_description: 'Breathable combed cotton with a soft, no-dig waistband.',
  image_url: '/products/trunks-navy.svg',
  rating: 4.5,
  review_count: 1284,
  in_stock: true,
  stock: 120,
  category: { id: 1, name: "Men's Innerwear", slug: 'mens-innerwear' },
  ...overrides,
});

export const CATEGORIES = [
  { id: 1, name: "Men's Innerwear", slug: 'mens-innerwear', product_count: 3 },
  { id: 5, name: 'Socks', slug: 'socks', product_count: 3 },
];

export const emptyCart = () => ({
  items: [],
  summary: {
    item_count: 0, subtotal: 0, savings: 0, gst_rate: 5, gst_amount: 0,
    shipping: 0, free_shipping_above: 999, total: 0,
  },
  max_qty_per_item: 10,
});

export const cartWith = (product, quantity) => {
  const subtotal = product.price * quantity;
  return {
    items: [{ product, quantity, line_total: subtotal }],
    summary: {
      item_count: quantity, subtotal, savings: (product.mrp - product.price) * quantity, gst_rate: 5,
      gst_amount: +(subtotal * 0.05).toFixed(2), shipping: subtotal >= 999 ? 0 : 49, free_shipping_above: 999,
      total: +(subtotal * 1.05 + (subtotal >= 999 ? 0 : 49)).toFixed(2),
    },
    max_qty_per_item: 10,
  };
};
