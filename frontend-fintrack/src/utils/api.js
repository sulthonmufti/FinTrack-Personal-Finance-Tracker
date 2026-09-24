import axios from "axios";

// Ambil URL dasar dari .env (default: http://localhost:5000)
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Pastikan baseURL selalu berakhiran /api
const API_BASE_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// INTERCEPTOR: Otomatis tempelkan Token JWT ke SETIAP request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
