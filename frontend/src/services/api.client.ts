import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api.types';
import { analytics } from '../lib/analytics';

// API Base URL
// Dev: '/api' → Vite proxy strips /api and forwards to localhost:3010
// Prod: '/api' → Firebase Hosting rewrites to Cloud Function
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// WebSocket Base URL - direct connection to backend
// In production (Cloud Functions), WebSocket is not available — polling fallback activates
// Set VITE_WS_URL=http://localhost:3010 in .env.local for local dev
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || '';

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send httpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Firebase Hosting strips all cookies except __session,
    // so we send the token via Authorization header as well
    const token = localStorage.getItem('procurea_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle errors and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, response.data);
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 403 ACCOUNT_BLOCKED - Don't try to refresh, redirect to login with blocked message
    if (error.response?.status === 403 && error.response?.data?.message === 'ACCOUNT_BLOCKED') {
      localStorage.removeItem('procurea_token');
      localStorage.removeItem('procurea_refresh');
      if (typeof window !== 'undefined') {
        window.location.href = '/login?blocked=true';
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('procurea_refresh');
        const refreshRes = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
          headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {},
        });
        // Store new tokens from response
        if (refreshRes.data?.accessToken) {
          localStorage.setItem('procurea_token', refreshRes.data.accessToken);
        }
        if (refreshRes.data?.refreshToken) {
          localStorage.setItem('procurea_refresh', refreshRes.data.refreshToken);
        }
        isRefreshing = false;
        processQueue();
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        isRefreshing = false;
        processQueue(refreshError);
        // Clear stale tokens
        localStorage.removeItem('procurea_token');
        localStorage.removeItem('procurea_refresh');

        if (typeof window !== 'undefined') {
          const axiosErr = refreshError as { response?: { data?: { message?: string } } };
          const isBlocked = axiosErr?.response?.data?.message === 'ACCOUNT_BLOCKED';
          window.location.href = isBlocked ? '/login?blocked=true' : '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'Network error',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error,
      details: error.response?.data?.details,
    };

    // Track non-auth API errors in GA4
    const status = error.response?.status;
    if (status && status !== 401 && status !== 403) {
      analytics.apiError(originalRequest?.url || 'unknown', status);
    }

    if (import.meta.env.DEV) {
      console.error('[API] Error:', apiError);
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
