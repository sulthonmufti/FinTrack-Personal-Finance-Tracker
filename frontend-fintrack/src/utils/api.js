import axios from "axios";

// Mengambil URL dari .env, jika tidak ada pakai default localhost:5000
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Memastikan URL berakhiran /api
const API_BASE_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor untuk otomatis menyertakan Token Login ke setiap request backend
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
