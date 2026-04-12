import axios from 'axios';

/**
 * Base URL: empty in dev → same-origin + Vite proxy.
 * Production: set VITE_API_URL=https://your-api.example.com
 */
const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
