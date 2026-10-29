import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://evnuvora-api.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
