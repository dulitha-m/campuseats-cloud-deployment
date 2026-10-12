// Base API URL configured via environment variable (e.g. VITE_API_URL=https://campuseats-api.onrender.com)
// If VITE_API_URL is unset, falls back to empty string
const RAW_API_URL = import.meta.env.VITE_API_URL || "";
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

// Returns the menu endpoint: live API when VITE_API_URL is configured, or local static JSON fallback
export const MENU_ENDPOINT = API_BASE_URL ? `${API_BASE_URL}/api/menu` : "/menu.json";
