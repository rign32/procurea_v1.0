import { useEffect, useState, useCallback, Fragment } from 'react';
import { getUsers, impersonateUser, blockUser, unblockUser, deleteUser, getUserBilling, updateUserLanguage } from '../services/api';
import {
    Search,
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
    Trash2,
    ChevronDown,
    CreditCard,
    Infinity,
    TrendingUp,
    Calendar,
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
    language: string;
    plan: string;
    searchCredits: number;
    stripeSubscriptionId: string | null;
    subscriptionCancelAtPeriodEnd: boolean;
    trialCreditsUsed: boolean;
    organization: { id: string; name: string; domain: string | null; plan?: string; searchCredits?: number } | null;
    _count: { ownedRfqs: number };
}

interface BillingDetail {
    user: {
        plan: string;
        searchCredits: number;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        subscriptionCancelAtPeriodEnd: boolean;
        trialCreditsUsed: boolean;
    };
    orgCredits: number | null;
    orgPlan: string | null;
    orgName: string | null;
    totalSearches: number;
    monthlySearches: number;
    totalSuppliersFound: number;
    creditTransactions: Array<{
        id: string;
        amount: number;
        type: string;
        description: string | null;
        balanceAfter: number;
        createdAt: string;
    }>;
    campaigns: Array<{
        id: string;
        name: string;
        status: string;
        createdAt: string;
        suppliersCount: number;
    }>;
}

function PlanBadge({ plan, hasSubscription }: { plan: string; hasSubscription: boolean }) {
    if (plan === 'unlimited' || hasSubscription) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 font-medium">
                <Infinity size={10} /> Unlimited
            </span>
        );
    }
    if (plan === 'pay_as_you_go') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/15 text-blue-400 font-medium">
                <CreditCard size={10} /> Pay as you go
            </span>
        );
    }
    return (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-surface-overlay text-text-muted font-medium">
            Research
        </span>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [billingDetail, setBillingDetail] = useState<BillingDetail | null>(null);
    const [billingLoading, setBillingLoading] = useState(false);
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

    const handleExpandUser = async (userId: string) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
            setBillingDetail(null);
            return;
        }
        setExpandedUserId(userId);
        setBillingDetail(null);
        setBillingLoading(true);
        try {
            const { data } = await getUserBilling(userId);
            setBillingDetail(data);
        } catch (err) {
            console.error('Failed to load billing detail:', err);
        } finally {
            setBillingLoading(false);
        }
    };

    const handleImpersonate = async (user: User) => {
        setActionLoading(user.id);
        const newTab = window.open('about:blank', '_blank');
        try {
            const { data } = await impersonateUser(user.id);
            let frontendUrl: string;
            if (window.location.hostname === 'localhost') {
                frontendUrl = 'http://localhost:5173';
            } else {
                frontendUrl = user.language === 'en'
                    ? 'https://app.procurea.io'
                    : 'https://app.procurea.pl';
            }
            const impersonationUrl = `${frontendUrl}?impersonate_token=${encodeURIComponent(data.accessToken)}&refresh_token=${encodeURIComponent(data.refreshToken)}`;
            if (newTab) {
                newTab.location.href = impersonationUrl;
            } else {
                window.location.href = impersonationUrl;
            }
        } catch (err: any) {
            console.error('Impersonation failed:', err);
            if (newTab) newTab.close();
            alert(`Nie udalo sie zalogowac jako uzytkownik: ${err?.response?.data?.message || err?.message || 'Nieznany blad'}`);
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

    const handleToggleLanguage = async (user: User) => {
        const newLang = user.language === 'en' ? 'pl' : 'en';
        try {
            await updateUserLanguage(user.id, newLang);
            fetchUsers();
        } catch (err) {
            console.error('Failed to update language:', err);
        }
    };

    const handleDelete = async (user: User) => {
        const confirmed = window.confirm(
            `Czy na pewno chcesz usunac uzytkownika ${user.email}? Ta operacja jest nieodwracalna.`
        );
        if (!confirmed) return;

        setActionLoading(user.id);
        try {
            await deleteUser(user.id);
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            alert(`Blad podczas usuwania: ${err?.response?.data?.message || err?.message || 'Nieznany blad'}`);
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Uzytkownicy</h1>
                    <p className="text-sm text-text-muted mt-1">{total} {total === 1 ? 'uzytkownik' : 'uzytkownikow'} w systemie</p>
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
                        Nie znaleziono uzytkownikow
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-overlay/50">
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Uzytkownik</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Wersja</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Plan / Billing</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Organizacja</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Ostatnie logowanie</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted text-xs uppercase tracking-wider">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.map((user) => {
                                    const isExpanded = expandedUserId === user.id;
                                    const effectivePlan = user.organization?.plan || user.plan;
                                    const hasSubscription = !!user.stripeSubscriptionId;
                                    const totalCredits = (user.searchCredits || 0) + (user.organization?.searchCredits || 0);

                                    return (
                                        <Fragment key={user.id}>
                                            <tr
                                                className={`hover:bg-surface-hover transition-colors cursor-pointer ${isExpanded ? 'bg-surface-hover/50' : ''}`}
                                                onClick={() => handleExpandUser(user.id)}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${user.role === 'ADMIN' ? 'bg-accent-muted text-accent' : 'bg-surface-overlay text-text-secondary'}`}>
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
                                                    <button
                                                        onClick={() => handleToggleLanguage(user)}
                                                        title={`${user.language === 'en' ? 'app.procurea.io' : 'app.procurea.pl'} — kliknij aby zmienic`}
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                                        user.language === 'en' ? 'bg-blue-500/15 text-blue-400' :
                                                        user.language === 'de' ? 'bg-amber-500/15 text-amber-400' :
                                                        'bg-surface-overlay text-text-muted'
                                                    }`}>
                                                        {user.language === 'en' ? '🇺🇸 EN' :
                                                         user.language === 'de' ? '🇩🇪 DE' : '🇵🇱 PL'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col gap-1">
                                                        <PlanBadge plan={effectivePlan} hasSubscription={hasSubscription} />
                                                        {totalCredits > 0 && effectivePlan !== 'unlimited' && !hasSubscription && (
                                                            <span className="text-xs text-text-muted">{totalCredits} kredytow</span>
                                                        )}
                                                        <span className="text-xs text-text-muted">{user._count.ownedRfqs} kampanii</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {user.organization ? (
                                                        <div className="flex items-center gap-1.5 text-text-secondary">
                                                            <Building2 size={14} />
                                                            <span className="truncate max-w-[150px]">{user.organization.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-text-muted">&mdash;</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-text-secondary text-xs">
                                                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pl-PL') : '\u2014'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleImpersonate(user)}
                                                            disabled={actionLoading === user.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-muted text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
                                                            title="Zaloguj sie jako ten uzytkownik"
                                                        >
                                                            {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
                                                            Zaloguj
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
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            disabled={actionLoading === user.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger-muted text-danger hover:bg-danger/20 transition-all disabled:opacity-50"
                                                            title="Usun uzytkownika"
                                                        >
                                                            {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                                            Usun
                                                        </button>
                                                        <ChevronDown
                                                            size={14}
                                                            className={`text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable billing detail */}
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={7} className="p-0">
                                                        <div className="bg-surface-overlay/30 border-t border-border/50 p-4">
                                                            {billingLoading ? (
                                                                <div className="flex items-center justify-center py-8">
                                                                    <Loader2 className="h-5 w-5 text-accent animate-spin" />
                                                                </div>
                                                            ) : billingDetail ? (
                                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                                    {/* Stats cards */}
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Statystyki</h4>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div className="bg-surface-raised rounded-lg p-3 border border-border/50">
                                                                                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase tracking-wider mb-1">
                                                                                    <TrendingUp size={10} /> Wyszukiwania
                                                                                </div>
                                                                                <div className="text-lg font-bold text-text-primary">{billingDetail.totalSearches}</div>
                                                                            </div>
                                                                            <div className="bg-surface-raised rounded-lg p-3 border border-border/50">
                                                                                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase tracking-wider mb-1">
                                                                                    <Calendar size={10} /> Ten miesiac
                                                                                </div>
                                                                                <div className="text-lg font-bold text-text-primary">{billingDetail.monthlySearches}</div>
                                                                            </div>
                                                                            <div className="bg-surface-raised rounded-lg p-3 border border-border/50">
                                                                                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase tracking-wider mb-1">
                                                                                    <Building2 size={10} /> Dostawcy
                                                                                </div>
                                                                                <div className="text-lg font-bold text-text-primary">{billingDetail.totalSuppliersFound}</div>
                                                                            </div>
                                                                            <div className="bg-surface-raised rounded-lg p-3 border border-border/50">
                                                                                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase tracking-wider mb-1">
                                                                                    <CreditCard size={10} /> Kredyty
                                                                                </div>
                                                                                <div className="text-lg font-bold text-text-primary">
                                                                                    {billingDetail.user.searchCredits}
                                                                                    {billingDetail.orgCredits !== null && (
                                                                                        <span className="text-xs font-normal text-text-muted ml-1">
                                                                                            (+{billingDetail.orgCredits} org)
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Recent campaigns */}
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Ostatnie kampanie</h4>
                                                                        {billingDetail.campaigns.length === 0 ? (
                                                                            <p className="text-xs text-text-muted py-2">Brak kampanii</p>
                                                                        ) : (
                                                                            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                                                                {billingDetail.campaigns.slice(0, 10).map(c => (
                                                                                    <div key={c.id} className="flex items-center justify-between text-xs bg-surface-raised rounded-lg px-3 py-2 border border-border/50">
                                                                                        <div className="truncate flex-1 mr-2">
                                                                                            <span className="font-medium text-text-primary">{c.name}</span>
                                                                                            <span className="text-text-muted ml-2">{new Date(c.createdAt).toLocaleDateString('pl-PL')}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                                                                c.status === 'completed' ? 'bg-success-muted text-success' :
                                                                                                c.status === 'running' ? 'bg-accent-muted text-accent' :
                                                                                                'bg-surface-overlay text-text-muted'
                                                                                            }`}>
                                                                                                {c.status}
                                                                                            </span>
                                                                                            <span className="text-text-muted">{c.suppliersCount} firm</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Credit transactions */}
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Transakcje kredytowe</h4>
                                                                        {billingDetail.creditTransactions.length === 0 ? (
                                                                            <p className="text-xs text-text-muted py-2">Brak transakcji</p>
                                                                        ) : (
                                                                            <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                                                                {billingDetail.creditTransactions.slice(0, 15).map(tx => (
                                                                                    <div key={tx.id} className="flex items-center justify-between text-xs bg-surface-raised rounded-lg px-3 py-2 border border-border/50">
                                                                                        <div className="truncate flex-1 mr-2">
                                                                                            <span className="text-text-primary">{tx.description || tx.type}</span>
                                                                                            <span className="text-text-muted ml-2">{new Date(tx.createdAt).toLocaleDateString('pl-PL')}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                                            <span className={`font-medium ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                                                                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                                                            </span>
                                                                                            <span className="text-text-muted w-8 text-right">{tx.balanceAfter}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-text-muted py-4 text-center">Nie udalo sie zaladowac danych billingowych</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
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
