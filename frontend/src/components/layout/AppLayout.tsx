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
    ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"
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
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Kampanie", href: "/campaigns", icon: Target },
        ...(isFullPlan ? [{ name: "Zapytania ofertowe", href: "/rfqs", icon: FileText }] : []),
        { name: "Dostawcy", href: "/suppliers", icon: Users },
        { name: "Blacklist", href: "/blacklist", icon: ShieldAlert },
        ...(isFullPlan ? [{ name: "Sekwencje", href: "/sequences", icon: Mail }] : []),
        { name: "Ustawienia", href: "/settings", icon: Settings },
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
                "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
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
                            title="Wyloguj"
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
