import axios from "axios";

// In local development, Vite's dev server proxies "/api" to the backend (see vite.config.js),
// so VITE_API_URL can be left unset. In production (Vercel/Netlify), set VITE_API_URL to your
// deployed backend URL, e.g. https://distance-pathways-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
