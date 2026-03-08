import { useEffect, useState, useCallback } from 'react';
import { getUsers, impersonateUser, blockUser, unblockUser } from '../services/api';
import {
    Search,
    ExternalLink,
    UserCheck,
    UserX,
    Shield,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Building2,
    LogIn,
} from 'lucide-react';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    phone: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isBlocked: boolean;
    blockedAt: string | null;
    blockedReason: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    onboardingCompleted: boolean;
    ssoProvider: string | null;
    organization: { id: string; name: string; domain: string | null } | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const pageSize = 20;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {
                skip: String(page * pageSize),
                take: String(pageSize),
            };
            if (search) params.search = search;
            const { data } = await getUsers(params);
            setUsers(data.users);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchUsers();
    };

    const handleImpersonate = async (userId: string) => {
        setActionLoading(userId);

        // Open blank tab immediately (synchronous, direct response to click = not blocked by popup blockers)
        const newTab = window.open('about:blank', '_blank');

        try {
            const { data } = await impersonateUser(userId);

            const frontendUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:5173'
                : `${window.location.protocol}//app.${window.location.hostname.split('.').slice(-2).join('.')}`;

            const impersonationUrl = `${frontendUrl}?impersonate_token=${encodeURIComponent(data.accessToken)}&refresh_token=${encodeURIComponent(data.refreshToken)}`;

            if (newTab) {
                newTab.location.href = impersonationUrl;
            } else {
                // Fallback if popup was still blocked — navigate current window
                window.location.href = impersonationUrl;
            }
        } catch (err: any) {
            console.error('Impersonation failed:', err);
            if (newTab) newTab.close();
            alert(`Nie udało się zalogować jako użytkownik: ${err?.response?.data?.message || err?.message || 'Nieznany błąd'}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleBlock = async (user: User) => {
        setActionLoading(user.id);
        try {
            if (user.isBlocked) {
                await unblockUser(user.id);
            } else {
                await blockUser(user.id, 'Zablokowany przez administratora');
            }
            fetchUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Użytkownicy</h1>
                    <p className="text-sm text-text-muted mt-1">{total} {total === 1 ? 'użytkownik' : 'użytkowników'} w systemie</p>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Szukaj po email lub nazwie..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-sm"
                />
            </form>

            {/* Users Table */}
            <div className="bg-surface-raised border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 text-accent animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-sm">
                        Nie znaleziono użytkowników
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-overlay/50">
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Użytkownik</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Organizacja</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Ostatnie logowanie</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-surface-hover transition-colors group">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${user.role === 'ADMIN' ? 'bg-accent-muted text-accent' : 'bg-surface-overlay text-text-secondary'
                                                    }`}>
                                                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-text-primary truncate flex items-center gap-2">
                                                        {user.name || 'Bez nazwy'}
                                                        {user.role === 'ADMIN' && <Shield size={12} className="text-accent" />}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-text-muted">
                                                        <Mail size={10} />
                                                        <span className="truncate">{user.email}</span>
                                                        {user.phone && (
                                                            <>
                                                                <Phone size={10} className="ml-1" />
                                                                <span>{user.phone}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-1">
                                                {user.isBlocked ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-danger-muted text-danger w-fit">
                                                        <UserX size={10} /> Zablokowany
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success-muted text-success w-fit">
                                                        <UserCheck size={10} /> Aktywny
                                                    </span>
                                                )}
                                                {!user.onboardingCompleted && (
                                                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-warning-muted text-warning w-fit">
                                                        Onboarding
                                                    </span>
                                                )}
                                                {user.ssoProvider && (
                                                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-surface-overlay text-text-muted w-fit font-mono">
                                                        {user.ssoProvider}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.organization ? (
                                                <div className="flex items-center gap-1.5 text-text-secondary">
                                                    <Building2 size={14} />
                                                    <span className="truncate max-w-[150px]">{user.organization.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-text-secondary text-xs">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pl-PL') : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleImpersonate(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-muted text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
                                                    title="Zaloguj się jako ten użytkownik"
                                                >
                                                    {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
                                                    Zaloguj się
                                                </button>
                                                <button
                                                    onClick={() => handleToggleBlock(user)}
                                                    disabled={actionLoading === user.id}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${user.isBlocked
                                                            ? 'bg-success-muted text-success hover:bg-success/20'
                                                            : 'bg-danger-muted text-danger hover:bg-danger/20'
                                                        }`}
                                                >
                                                    {user.isBlocked ? <UserCheck size={12} /> : <UserX size={12} />}
                                                    {user.isBlocked ? 'Odblokuj' : 'Zablokuj'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <span className="text-xs text-text-muted">
                            Strona {page + 1} z {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover disabled:opacity-30 text-text-secondary transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover disabled:opacity-30 text-text-secondary transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
