// Base URL for the API and socket connection
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Ensure API_URL ends with a trailing slash
export const API_URL = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;

// Socket URL should not have a trailing slash
export const SOCKET_URL = BASE_URL.endsWith("/")
  ? BASE_URL.slice(0, -1)
  : BASE_URL;

// Debug logging
console.log("API_URL:", API_URL);
console.log("SOCKET_URL:", SOCKET_URL);
