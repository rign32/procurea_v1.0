import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: '/api',
});

// Add auth token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- Refresh token logic ----
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

// Handle 401/403 responses with refresh logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle 403 - always logout (admin blocked, etc.)
        if (error.response?.status === 403) {
            useAuthStore.getState().logout();
            window.location.href = '/';
            return Promise.reject(error);
        }

        // Handle 401 - try refresh token before logging out
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Another request is already refreshing -- queue this one
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = useAuthStore.getState().refreshToken;
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Use plain axios (NOT `api`) to avoid the request interceptor
                // adding the expired access token to the Authorization header
                const refreshRes = await axios.post('/api/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                });

                const newAccessToken = refreshRes.data?.accessToken;
                const newRefreshToken = refreshRes.data?.refreshToken;

                if (newAccessToken && newRefreshToken) {
                    useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
                }

                isRefreshing = false;
                processQueue();

                // Retry the original request (interceptor will pick up the new token)
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);

                // Refresh failed -- logout and redirect to login
                useAuthStore.getState().logout();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

// Auth
export const adminLogin = (username: string, password: string) =>
    api.post('/admin/auth/login', { username, password });

// Dashboard
export const getDashboard = () => api.get('/admin/dashboard');

// Analytics — campaigns grouped by industry + sourcing mode
export interface IndustryAnalyticsRow {
    industry: string;
    sourcingMode: string;
    campaignCount: number;
    completedCount: number;
    acceptedCount: number;
    completionRate: number;
    acceptanceRate: number;
    avgSuppliersQualified: number;
    avgDurationMinutes: number | null;
}

export const getIndustryAnalytics = () =>
    api.get<IndustryAnalyticsRow[]>('/admin/analytics/by-industry');

// Users
export const getUsers = (params?: Record<string, string>) =>
    api.get('/admin/users', { params });

export const getUserById = (id: string) => api.get(`/admin/users/${id}`);

export const getUserBilling = (id: string) => api.get(`/admin/users/${id}/billing`);

export const impersonateUser = (id: string) =>
    api.post(`/admin/users/${id}/impersonate`);

export const blockUser = (id: string, reason?: string) =>
    api.post(`/admin/users/${id}/block`, { reason });

export const unblockUser = (id: string) =>
    api.post(`/admin/users/${id}/unblock`);

export const deleteUser = (id: string) =>
    api.delete(`/admin/users/${id}`);

export const updateUserLanguage = (id: string, language: string) =>
    api.patch(`/admin/users/${id}/language`, { language });

// Error Logs
export const getErrorLogs = (category?: string, limit?: number) =>
    api.get('/admin/errors', { params: { category, limit } });

// Integrations
export const getIntegrationStatus = (deep?: boolean) =>
    api.get('/admin/integrations/status', { params: { deep: deep ? 'true' : undefined } });

// Costs
export const getCostSummary = (startDate?: string, endDate?: string) =>
    api.get('/admin/costs/summary', { params: { startDate, endDate } });

export const getSourcingCostPerRequest = () =>
    api.get('/admin/costs/per-request');

// API Usage
export const getApiUsageStats = (params?: Record<string, string>) =>
    api.get('/admin/api-usage/stats', { params });

export const getApiUsageLogs = (params?: Record<string, string>) =>
    api.get('/admin/api-usage/logs', { params });

export const getObservabilityEvents = (params?: Record<string, string>) =>
    api.get('/admin/events', { params });

// Monitoring
export const getMonitoringStatus = () => api.get('/monitoring/status');

export const getMonitoringHistory = (hours?: number) =>
    api.get('/monitoring/history', { params: { hours } });

export const getMonitoringIncidents = (status?: string) =>
    api.get('/monitoring/incidents', { params: { status } });

export default api;
