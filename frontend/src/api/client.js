import axios from 'axios';
import { getCartToken } from '../utils/cartToken';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  config.headers['X-Cart-Token'] = getCartToken();
  return config;
});

/** Error with the backend's message and code, e.g. { msg: "Only 3 left", code: "OUT_OF_STOCK" }. */
export class ApiError extends Error {
  constructor(message, { code = 'ERROR', status = 0, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

client.interceptors.response.use(
  (response) => response.data?.data,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const body = error.response?.data;
    const message =
      body?.msg ||
      (error.response ? `Request failed (${error.response.status})` : 'Could not reach the server. Is the API running?');
    return Promise.reject(
      new ApiError(message, { code: body?.code, status: error.response?.status || 0, details: body?.details }),
    );
  },
);

export const isCancel = axios.isCancel;
export default client;
