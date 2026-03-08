import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    LayoutDashboard,
    Users,
    AlertTriangle,
    Plug,
    LogOut,
    Shield,
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Użytkownicy' },
    { to: '/errors', icon: AlertTriangle, label: 'Logi błędów' },
    { to: '/integrations', icon: Plug, label: 'API & Koszty' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-raised border-r border-border flex flex-col shrink-0">
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                        <Shield size={18} className="text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-text-primary">Procurea</div>
                        <div className="text-[10px] font-mono text-accent uppercase tracking-wider">Admin Panel</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? 'bg-accent-muted text-accent-hover shadow-glow'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User / Logout */}
                <div className="px-3 py-4 border-t border-border">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{user?.name || 'Admin'}</div>
                            <div className="text-xs text-text-muted truncate">{user?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-danger hover:bg-danger-muted transition-all duration-150"
                    >
                        <LogOut size={16} />
                        Wyloguj
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-surface">
                <div className="p-8 max-w-[1400px] mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
