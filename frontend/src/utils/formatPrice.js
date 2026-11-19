const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats a number as Indian Rupees, e.g. 1362.9 → "₹1,362.9". */
export function formatPrice(value) {
  const n = Number(value);
  return inr.format(Number.isFinite(n) ? n : 0);
}
