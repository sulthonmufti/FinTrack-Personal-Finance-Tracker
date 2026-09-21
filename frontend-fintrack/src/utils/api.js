import axios from 'axios';

// Base URL diambil dari environment variable
// Lokal: VITE_API_BASE_URL=http://localhost:5000
// Production: VITE_API_BASE_URL=https://api.yourdomain.com
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
