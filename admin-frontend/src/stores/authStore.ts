import { create } from 'zustand';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: AdminUser | null;
    isAuthenticated: boolean;
    login: (token: string, refreshToken: string, user: AdminUser) => void;
    setTokens: (token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
    const storedToken = localStorage.getItem('admin_token');
    const storedRefreshToken = localStorage.getItem('admin_refresh_token');
    const storedUser = localStorage.getItem('admin_user');

    return {
        token: storedToken,
        refreshToken: storedRefreshToken,
        user: storedUser ? JSON.parse(storedUser) : null,
        isAuthenticated: !!storedToken,

        login: (token: string, refreshToken: string, user: AdminUser) => {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_refresh_token', refreshToken);
            localStorage.setItem('admin_user', JSON.stringify(user));
            set({ token, refreshToken, user, isAuthenticated: true });
        },

        setTokens: (token: string, refreshToken: string) => {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_refresh_token', refreshToken);
            set({ token, refreshToken });
        },

        logout: () => {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
            localStorage.removeItem('admin_user');
            set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
        },
    };
});
