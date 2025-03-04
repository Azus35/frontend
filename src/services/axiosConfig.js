import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-production-77df.up.railway.app/api/auth',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar token en las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
