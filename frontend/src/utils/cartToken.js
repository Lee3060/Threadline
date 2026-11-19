import { getItem, setItem } from './storage';

export const CART_TOKEN_KEY = 'threadline.cartToken';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let memoryToken = null; // used when localStorage is unavailable

function makeUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // Fallback for older browsers / non-secure origins
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Returns the guest cart token, creating and saving one the first time. */
export function getCartToken() {
  const saved = getItem(CART_TOKEN_KEY) || memoryToken;
  if (saved && UUID_RE.test(saved)) return saved;
  const token = makeUuid();
  memoryToken = token;
  setItem(CART_TOKEN_KEY, token);
  return token;
}
