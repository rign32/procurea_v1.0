import { create } from 'zustand';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: AdminUser | null;
    isAuthenticated: boolean;
    login: (token: string, user: AdminUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    return {
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null,
        isAuthenticated: !!storedToken,

        login: (token: string, user: AdminUser) => {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));
            set({ token, user, isAuthenticated: true });
        },

        logout: () => {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            set({ token: null, user: null, isAuthenticated: false });
        },
    };
});
