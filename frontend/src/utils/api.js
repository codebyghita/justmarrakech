/**
 * Centralized API configuration.
 * The base URL is read from VITE_API_URL in .env
 * — change it for production without touching any component.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';

export const API_PUBLIC = `${API_BASE}/api/public`;
export const API_ADMIN  = `${API_BASE}/api/admin`;
