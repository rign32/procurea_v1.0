import { useState, useEffect } from "react"
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom"
import {
    LayoutDashboard,
    Target,
    FileText,
    Users,
    Mail,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    HelpCircle,
    Phone,
    Infinity as InfinityIcon,
    FlaskConical,
    FolderOpen,
    FileSignature,
    ClipboardCheck,
    FolderKanban,
    ShoppingCart,
    Plus,
    Search,
    ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { t, isEN } from "@/i18n"
import { useAuthStore } from "@/stores/auth.store"
import { useUIStore } from "@/stores/ui.store"
import { BillingModal } from "@/components/billing/BillingModal"
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget"
import { WhatsNewModal } from "@/components/changelog/WhatsNewModal"
import { usePendingApprovalsCount } from "@/hooks/useApprovals"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { CommandPalette } from "@/components/palette/CommandPalette"

interface AppLayoutProps {
    onLogout?: () => void
}

type NavItem = {
    name: string
    href: string
    icon: typeof LayoutDashboard
    badge?: number
    count?: number
}

export default function AppLayout({ onLogout }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [paletteOpen, setPaletteOpen] = useState(false)
    const { billingModalOpen, setBillingModalOpen, openBillingModal } = useUIStore()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { user } = useAuthStore()

    useEffect(() => {
        if (searchParams.has('billing')) {
            openBillingModal()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setPaletteOpen((v) => !v)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    const isFullPlan = user?.plan === 'full'
    const isUnlimited = user?.plan === 'unlimited' || user?.orgPlan === 'unlimited'
    const isDemo = user?.isDemo ?? false
    const { data: pendingApprovalsCount } = usePendingApprovalsCount()

    const navMain: NavItem[] = [
        { name: t.nav.dashboard, href: "/", icon: LayoutDashboard },
        { name: t.nav.campaigns, href: "/campaigns", icon: Target },
        ...(isFullPlan ? [{ name: t.nav.rfqs, href: "/rfqs", icon: FileText }] : []),
        { name: t.nav.suppliers, href: "/suppliers", icon: Users },
        { name: t.nav.blacklist, href: "/blacklist", icon: ShieldAlert },
        { name: t.nav.documents, href: "/documents", icon: FolderOpen },
    ]

    const navProcurement: NavItem[] = isFullPlan ? [
        { name: t.nav.contracts, href: "/contracts", icon: FileSignature },
        { name: t.nav.purchaseOrders, href: "/purchase-orders", icon: ShoppingCart },
        { name: t.nav.approvals, href: "/approvals", icon: ClipboardCheck, badge: pendingApprovalsCount },
        { name: t.nav.workspaces, href: "/workspaces", icon: FolderKanban },
        { name: t.nav.sequences, href: "/sequences", icon: Mail },
    ] : []

    const navFoot: NavItem[] = [
        { name: t.nav.settings, href: "/settings", icon: Settings },
    ]

    const initials = user?.name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U'
    const orgLine = user?.organizationName || user?.organization?.name
    const orgLabel = orgLine ? `${orgLine} · CEO` : isEN ? 'Procurea · CEO' : 'Procurea · CEO'

    /** Breadcrumb derivation from pathname. */
    const pathname = location.pathname
    const crumbs = deriveCrumbs(pathname)

    return (
        <div className="min-h-screen bg-bg text-ink flex flex-col">
            {/* Demo Mode Banner */}
            {isDemo && (
                <div className="flex items-center justify-center gap-2 bg-warn-soft border-b border-warn-border px-4 py-1.5 text-xs font-medium text-warn shrink-0">
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span>
                        {isEN ? 'Demo Mode — sample data, read-only. ' : 'Tryb Demo — dane przykładowe. '}
                        <a
                            href={isEN ? 'https://procurea.io' : 'https://procurea.pl'}
                            className="underline hover:text-ink transition-colors"
                        >
                            {isEN ? 'Sign up for free' : 'Załóż darmowe konto'}
                        </a>
                    </span>
                </div>
            )}

            <div className="flex flex-1 min-h-0">
                {/* Mobile backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-[248px] shrink-0 flex flex-col bg-bg border-r border-rule px-3 py-3.5 transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Brand */}
                    <Link
                        to="/"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-2 pt-1 pb-[18px] mb-1 border-b border-rule group"
                    >
                        <div className="w-[26px] h-[26px] rounded-[6px] bg-brand text-white grid place-items-center font-mono font-bold text-[13px] tracking-tight shrink-0">
                            P
                        </div>
                        <span className="font-bold text-[15px] tracking-[-0.015em] text-ink">
                            Procurea
                        </span>
                        <span className="ml-auto font-mono text-[9.5px] font-medium px-1.5 py-0.5 bg-bg-3 text-muted-ink rounded-[3px] tracking-[0.08em] uppercase">
                            Beta
                        </span>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setSidebarOpen(false) }}
                            className="lg:hidden -mr-1 p-1 text-muted-ink hover:text-ink"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </Link>

                    <nav className="flex-1 overflow-y-auto flex flex-col min-h-0">
                        <NavSection label={isEN ? 'Workspace' : 'Workspace'} />
                        {navMain.map((n) => (
                            <NavLink
                                key={n.href}
                                item={n}
                                isActive={isNavActive(n.href, pathname)}
                                onClick={() => setSidebarOpen(false)}
                            />
                        ))}

                        {/* New campaign CTA */}
                        <div className="px-1 pt-3.5 pb-2">
                            <Link
                                to="/campaigns/new"
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center justify-center gap-1.5 w-full h-9 rounded-[8px] bg-brand text-white text-[13px] font-semibold hover:bg-brand-2 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                {isEN ? 'New campaign' : 'Nowa kampania'}
                            </Link>
                        </div>

                        {navProcurement.length > 0 && (
                            <>
                                <NavSection label={isEN ? 'Procurement' : 'Zakupy'} />
                                {navProcurement.map((n) => (
                                    <NavLink
                                        key={n.href}
                                        item={n}
                                        isActive={isNavActive(n.href, pathname)}
                                        onClick={() => setSidebarOpen(false)}
                                    />
                                ))}
                            </>
                        )}

                        <NavSection label={isEN ? 'Settings' : 'Ustawienia'} className="mt-2" />
                        {navFoot.map((n) => (
                            <NavLink
                                key={n.href}
                                item={n}
                                isActive={isNavActive(n.href, pathname)}
                                onClick={() => setSidebarOpen(false)}
                            />
                        ))}
                        <WhatsNewModal />

                        {/* Help block */}
                        <div className="mt-auto px-1 pt-4">
                            <div className="rounded-[8px] bg-bg-2 p-3 space-y-1.5">
                                <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-ink">
                                    <HelpCircle className="h-3 w-3" />
                                    {t.nav.needHelp}
                                </div>
                                <a
                                    href={isEN
                                        ? "mailto:hello@procurea.io?subject=Report%20%E2%80%94%20Procurea"
                                        : "mailto:kontakt@procurea.pl?subject=Zg%C5%82oszenie%20%E2%80%94%20Procurea"}
                                    className="flex items-center gap-2 text-[11.5px] text-ink-2 hover:text-ink transition-colors"
                                >
                                    <Mail className="h-3 w-3" />
                                    {isEN ? 'hello@procurea.io' : 'kontakt@procurea.pl'}
                                </a>
                                <a
                                    href="tel:+48536067316"
                                    className="flex items-center gap-2 text-[11.5px] text-ink-2 hover:text-ink transition-colors"
                                >
                                    <Phone className="h-3 w-3" />
                                    +48 536 067 316
                                </a>
                            </div>
                        </div>
                    </nav>

                    {/* User card */}
                    <div className="mt-3 pt-3.5 border-t border-rule">
                        <div className="flex items-center gap-2.5 px-1.5 py-2 rounded-[8px] hover:bg-bg-2 transition-colors cursor-pointer group">
                            <div className="relative shrink-0">
                                <div
                                    className={cn(
                                        "w-7 h-7 rounded-[6px] grid place-items-center font-mono text-[11.5px] font-semibold",
                                        isUnlimited
                                            ? "bg-brand text-white ring-2 ring-brand/20"
                                            : "bg-brand text-white"
                                    )}
                                >
                                    {initials}
                                </div>
                                {isUnlimited && (
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-cta grid place-items-center ring-2 ring-bg">
                                        <InfinityIcon className="h-2 w-2 text-cta-ink" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[12.5px] font-semibold text-ink truncate">
                                    {user?.name || user?.email?.split('@')[0] || 'User'}
                                </div>
                                <div className="text-[11px] text-muted-ink truncate">
                                    {orgLabel}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onLogout}
                                title={t.nav.logout}
                                className="p-1 text-muted-ink hover:text-ink transition-colors"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                            </button>
                            <ChevronRight className="h-3 w-3 text-muted-ink-2 group-hover:text-ink-2 transition-colors" />
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Topbar */}
                    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 lg:px-6 border-b border-rule backdrop-blur-[8px] bg-bg/85 supports-[backdrop-filter]:bg-bg/70">
                        <button
                            type="button"
                            className="lg:hidden -ml-1 p-1.5 text-ink-2 hover:text-ink"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-1.5 text-[13px] text-muted-ink min-w-0">
                            {crumbs.map((c, i) => {
                                const last = i === crumbs.length - 1
                                return (
                                    <span key={i} className="flex items-center gap-1.5 min-w-0">
                                        {i > 0 && <span className="text-rule-3">›</span>}
                                        {last ? (
                                            <span className="text-ink font-semibold truncate">{c.label}</span>
                                        ) : (
                                            <Link to={c.href || '#'} className="hover:text-ink-2 transition-colors truncate">
                                                {c.label}
                                            </Link>
                                        )}
                                    </span>
                                )
                            })}
                        </div>

                        <div className="flex-1" />

                        {/* Search → opens command palette (⌘K) */}
                        <button
                            type="button"
                            onClick={() => setPaletteOpen(true)}
                            className="hidden md:flex relative w-[260px] max-w-full h-8 items-center pl-8 pr-14 rounded-[8px] bg-surface border border-rule-2 text-[12.5px] text-muted-ink-2 hover:border-rule-3 hover:text-ink-2 transition-colors text-left"
                            aria-label={isEN ? 'Open command palette' : 'Otwórz panel wyszukiwania'}
                        >
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" />
                            <span className="truncate">
                                {isEN ? 'Search campaigns, suppliers…' : 'Szukaj kampanii, dostawców…'}
                            </span>
                            <span className="kbd absolute right-2 top-1/2 -translate-y-1/2 select-none">⌘K</span>
                        </button>

                        {/* Actions */}
                        <a
                            href={isEN ? 'https://procurea.io/docs' : 'https://procurea.pl/pomoc'}
                            target="_blank"
                            rel="noreferrer"
                            title={isEN ? 'Help' : 'Pomoc'}
                            className="h-8 w-8 grid place-items-center rounded-[8px] text-ink-2 hover:bg-bg-2 hover:text-ink transition-colors"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </a>
                        <NotificationBellCompat />
                    </header>

                    {/* Page container */}
                    <main className="flex-1 min-w-0">
                        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            {!isDemo && <BillingModal open={billingModalOpen} onOpenChange={setBillingModalOpen} />}
            <FeedbackWidget />
            <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </div>
    )
}

/* ──────────── helpers ──────────── */

function NavSection({ label, className }: { label: string; className?: string }) {
    return (
        <div
            className={cn(
                "px-2 pt-3.5 pb-1.5 font-mono text-[9.5px] font-medium tracking-[0.1em] uppercase text-muted-ink-2",
                className
            )}
        >
            {label}
        </div>
    )
}

function NavLink({
    item,
    isActive,
    onClick,
}: {
    item: NavItem
    isActive: boolean
    onClick?: () => void
}) {
    return (
        <Link
            to={item.href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-2.5 px-2.5 py-[7px] rounded-[6px] text-[13px] font-medium transition-colors relative group",
                isActive
                    ? "bg-surface text-ink font-semibold shadow-[0_1px_2px_rgba(14,22,20,0.04)] border border-rule"
                    : "text-ink-2 hover:bg-bg-2 hover:text-ink border border-transparent"
            )}
        >
            <item.icon
                className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-ink-2" : "text-muted-ink group-hover:text-ink-2"
                )}
                strokeWidth={1.5}
            />
            <span className="truncate">{item.name}</span>
            {item.badge != null && item.badge > 0 && (
                <span className="ml-auto font-mono text-[10.5px] font-medium px-1.5 py-0.5 bg-bad text-white rounded-full leading-none">
                    {item.badge}
                </span>
            )}
            {item.count != null && item.count > 0 && item.badge == null && (
                <span
                    className={cn(
                        "ml-auto font-mono text-[10.5px] font-medium px-1.5 py-0.5 rounded-full leading-none",
                        isActive ? "bg-bg-3 text-ink-3" : "bg-bg-2 text-muted-ink"
                    )}
                >
                    {item.count}
                </span>
            )}
        </Link>
    )
}

/** Wrap NotificationBell to match new topbar styling (icon button 32px). */
function NotificationBellCompat() {
    // Render the existing NotificationBell — it has its own popover logic.
    // If it renders as a button with shadcn sizing, we accept the visual drift for Wave 2.
    return (
        <div className="[&_button]:h-8 [&_button]:w-8 [&_button]:rounded-[8px] [&_button]:text-ink-2 [&_button:hover]:bg-bg-2 [&_button:hover]:text-ink">
            <NotificationBell />
        </div>
    )
}

function isNavActive(href: string, pathname: string): boolean {
    if (href === '/') return pathname === '/' || pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
}

function deriveCrumbs(pathname: string): { label: string; href?: string }[] {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return [{ label: isEN ? 'Dashboard' : 'Dashboard' }]

    const crumbs: { label: string; href?: string }[] = []
    const labelMap: Record<string, string> = {
        dashboard: 'Dashboard',
        campaigns: isEN ? 'Campaigns' : 'Kampanie',
        suppliers: isEN ? 'Suppliers' : 'Dostawcy',
        blacklist: isEN ? 'Blacklist' : 'Czarna lista',
        documents: isEN ? 'Documents' : 'Dokumenty',
        settings: isEN ? 'Settings' : 'Ustawienia',
        rfqs: 'RFQs',
        contracts: isEN ? 'Contracts' : 'Umowy',
        'purchase-orders': isEN ? 'POs' : 'Zamówienia',
        approvals: isEN ? 'Approvals' : 'Akceptacje',
        workspaces: isEN ? 'Workspaces' : 'Przestrzenie',
        sequences: isEN ? 'Sequences' : 'Sekwencje',
        contacts: isEN ? 'Contacts' : 'Kontakty',
        new: isEN ? 'New' : 'Nowa',
    }

    let pathSoFar = ''
    for (let i = 0; i < segments.length; i++) {
        const s = segments[i]
        pathSoFar += '/' + s
        const isLast = i === segments.length - 1
        const label = labelMap[s] || (s.length < 24 ? capitalize(s) : s.slice(0, 12) + '…')
        crumbs.push({ label, href: isLast ? undefined : pathSoFar })
    }
    return crumbs
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
