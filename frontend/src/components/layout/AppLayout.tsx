import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
    Phone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { t, isEN } from "@/i18n"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/auth.store"

interface AppLayoutProps {
    onLogout?: () => void
}

export default function AppLayout({ onLogout }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const { user } = useAuthStore()

    const isFullPlan = user?.plan === 'full';

    const navigation = [
        { name: t.nav.dashboard, href: "/", icon: LayoutDashboard },
        { name: t.nav.campaigns, href: "/campaigns", icon: Target },
        ...(isFullPlan ? [{ name: t.nav.rfqs, href: "/rfqs", icon: FileText }] : []),
        { name: t.nav.suppliers, href: "/suppliers", icon: Users },
        { name: t.nav.blacklist, href: "/blacklist", icon: ShieldAlert },
        ...(isFullPlan ? [{ name: t.nav.sequences, href: "/sequences", icon: Mail }] : []),
        { name: t.nav.settings, href: "/settings", icon: Settings },
    ]

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-14 items-center border-b px-4">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-lg font-bold">P</span>
                        </div>
                        <span>Procurea</span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>

                <div className="border-t p-3">
                    <div className="rounded-md bg-muted/50 p-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <HelpCircle className="h-3.5 w-3.5" />
                            {t.nav.needHelp}
                        </div>
                        <a href={isEN
                          ? "mailto:hello@procurea.io?subject=Report%20%E2%80%94%20Procurea&body=Hello%2C%20thank%20you%20for%20reporting%20issues%20and%20suggestions%20%E2%80%94%20attaching%20screenshots%20and%20describing%20the%20situation%20will%20help%20us%20assist%20you%20faster.%0A%0ALocation%3A%20%0ADescription%3A%20"
                          : "mailto:kontakt@procurea.pl?subject=Zg%C5%82oszenie%20%E2%80%94%20Procurea&body=Dzie%C5%84%20dobry%2C%20dzi%C4%99kuj%C4%99%20za%20zg%C5%82aszanie%20problem%C3%B3w%20i%20sugestii%20rozwoju%20%E2%80%94%20do%C5%82%C4%85czanie%20screenshot%C3%B3w%20oraz%20opisywanie%20sytuacji%2C%20w%20kt%C3%B3rej%20program%20nie%20zadzia%C5%82a%C5%82%20nale%C5%BCycie%20pomo%C5%BCe%20szybciej%20Pa%C5%84stwu%20pom%C3%B3c.%0A%0AMiejsce%20wyst%C4%99powania%3A%20%0AOpis%20problemu%3A%20"
                        } className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <Mail className="h-3.5 w-3.5" />
                            {isEN ? 'hello@procurea.io' : 'kontakt@procurea.pl'}
                        </a>
                        <a href="tel:+48536067316" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <Phone className="h-3.5 w-3.5" />
                            +48 536 067 316
                        </a>
                    </div>
                </div>

                <div className="border-t p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-soft">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {user?.name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium">{user?.name || 'User'}</span>
                            <span className="text-xs text-muted-foreground truncate">{user?.email || ''}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onLogout}
                            title={t.nav.logout}
                            className="shrink-0"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold">Procurea</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
