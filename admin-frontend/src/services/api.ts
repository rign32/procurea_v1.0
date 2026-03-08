import axios from 'axios';
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

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            useAuthStore.getState().logout();
            window.location.href = '/';
        }
        return Promise.reject(error);
    },
);

// Auth
export const adminLogin = (username: string, password: string) =>
    api.post('/admin/auth/login', { username, password });

// Dashboard
export const getDashboard = () => api.get('/admin/dashboard');

// Users
export const getUsers = (params?: Record<string, string>) =>
    api.get('/admin/users', { params });

export const getUserById = (id: string) => api.get(`/admin/users/${id}`);

export const impersonateUser = (id: string) =>
    api.post(`/admin/users/${id}/impersonate`);

export const blockUser = (id: string, reason?: string) =>
    api.post(`/admin/users/${id}/block`, { reason });

export const unblockUser = (id: string) =>
    api.post(`/admin/users/${id}/unblock`);

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

export default api;
