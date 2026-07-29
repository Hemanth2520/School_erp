import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'https://school-erp-87v2.onrender.com/api/v1').replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api/v1')
  ? rawApiUrl
  : rawApiUrl.endsWith('/api')
  ? `${rawApiUrl}/v1`
  : `${rawApiUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for secure cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach Bearer token from localStorage for cross-domain auth reliability
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Capture new access tokens & handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    // If login or refresh returned a new accessToken, store it in localStorage
    const newAccessToken = response?.data?.data?.accessToken || response?.data?.accessToken;
    if (newAccessToken && typeof newAccessToken === 'string') {
      localStorage.setItem('accessToken', newAccessToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await apiClient.post('/auth/refresh');
        const newToken = refreshRes?.data?.data?.accessToken || refreshRes?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
