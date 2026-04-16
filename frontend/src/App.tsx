import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Loader2, Lock, Sparkles } from 'lucide-react'
import AppLayout from './components/layout/AppLayout'
import Login from './Login'
import AuthCallbackPage from './pages/AuthCallbackPage'
import { useAuthStore } from './stores/auth.store'
import apiClient from './services/api.client'
import { setUserIdentity, clearUserIdentity } from './lib/analytics'
import type { User } from './types/campaign.types'

// Lazy-loaded pages (code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'))
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'))
const RfqWizardPage = lazy(() => import('./pages/RfqWizardPage'))
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'))
const SupplierDetailPage = lazy(() => import('./pages/SupplierDetailPage'))
const RfqsPage = lazy(() => import('./pages/RfqsPage'))
const RfqDetailPage = lazy(() => import('./pages/RfqDetailPage'))
const SupplierPortalPage = lazy(() => import('./pages/SupplierPortalPage'))
const SequencesPage = lazy(() => import('./pages/SequencesPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const BlacklistPage = lazy(() => import('./pages/BlacklistPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const StatusPage = lazy(() => import('./pages/StatusPage'))
const ContractsPage = lazy(() => import('./pages/ContractsPage'))
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'))
const WorkspacesPage = lazy(() => import('./pages/WorkspacesPage'))

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds default
    },
    mutations: {
      retry: 0,
    },
  },
})

function PlanGuard({ children, feature }: { children: React.ReactNode; feature?: string }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isEN = (import.meta.env.VITE_LANGUAGE || 'pl') === 'en';

  if (user?.plan !== 'full') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isEN ? 'Premium Feature' : 'Funkcja Premium'}
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          {feature
            ? (isEN
              ? `${feature} is available on the Full plan. Upgrade to unlock all features.`
              : `${feature} jest dostępna w planie Full. Przejdź na wyższy plan, aby odblokować wszystkie funkcje.`)
            : (isEN
              ? 'This feature is available on the Full plan. Upgrade to unlock all features.'
              : 'Ta funkcja jest dostępna w planie Full. Przejdź na wyższy plan, aby odblokować wszystkie funkcje.')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
          >
            {isEN ? 'Go back' : 'Wróć'}
          </button>
          <button
            onClick={() => navigate('/settings?tab=billing')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isEN ? 'View plans' : 'Zobacz plany'}
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function App() {
  const { user, isAuthenticated, setUser, setImpersonated, logout, sessionValidated, markSessionValidated } = useAuthStore()

  // Wait for Zustand persist to finish rehydrating from localStorage
  const [hydrated, setHydrated] = useState(false)

  // Capture URL params SYNCHRONOUSLY at first render — before Router's <Navigate> can
  // redirect to /login and wipe them from window.location.search.
  // React effect order: children (Navigate) run before parent (App), so reading
  // window.location.search in a useEffect is too late.
  const [initialSearch] = useState(() => window.location.search)

  // Track whether impersonation flow is in progress (block rendering until resolved)
  const [impersonating, setImpersonating] = useState(() => {
    // If URL has impersonation tokens, start in impersonating state to show loader immediately
    const params = new URLSearchParams(initialSearch);
    return !!params.get('impersonate_token');
  })

  useEffect(() => {
    // Subscribe to hydration completion
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    // Check if already hydrated (e.g., synchronous storage)
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }

    return unsubscribe
  }, [])

  // Handle admin impersonation via direct tokens from URL (?impersonate_token=xxx&refresh_token=yyy)
  // This is ONLY triggered from admin panel (admin.procurea.pl) — normal login flow is unaffected
  useEffect(() => {
    if (!hydrated) return;

    // Read from captured initial search params (not window.location.search which may have changed)
    const params = new URLSearchParams(initialSearch);
    const token = params.get('impersonate_token');
    const refresh = params.get('refresh_token');

    if (!token) return;

    // Clean URL immediately (remove tokens from address bar)
    window.history.replaceState({}, '', window.location.pathname || '/');

    // Store tokens and fetch user profile
    localStorage.setItem('procurea_token', token);
    if (refresh) localStorage.setItem('procurea_refresh', refresh);

    apiClient.get('/auth/me').then((res) => {
      console.log('[App] Admin impersonation successful:', res.data.email);
      setUser(res.data);
      setUserIdentity(res.data);
      setImpersonated(true);
      markSessionValidated();
    }).catch((err) => {
      console.error('[App] Admin impersonation failed:', err);
      localStorage.removeItem('procurea_token');
      localStorage.removeItem('procurea_refresh');
    }).finally(() => {
      setImpersonating(false);
    });
  }, [hydrated, initialSearch, setUser, setImpersonated, markSessionValidated]);

  // Handle staging auto-login — always refresh session on staging to pick up backend fixes
  // IMPORTANT: Only attempt auto-login if VITE_STAGING_SECRET is set at build time.
  // If the secret is missing/empty, skip entirely and fall through to normal login flow.
  // This prevents infinite redirect loops when the secret is misconfigured (403 from backend).
  const [stagingRefreshed, setStagingRefreshed] = useState(false);
  useEffect(() => {
    if (!hydrated || impersonating || stagingRefreshed) return;
    if (import.meta.env.VITE_STAGING_MODE !== 'true') return;

    const stagingSecret = (import.meta.env.VITE_STAGING_SECRET || '').trim();
    if (!stagingSecret) {
      // Secret not set at build time — skip auto-login bypass, let user log in normally.
      // This is intentional: when VITE_STAGING_SECRET is unset, staging acts like production
      // login-wise (Google SSO / Microsoft SSO / email code), just against the staging backend.
      console.log('[Staging] VITE_STAGING_SECRET not set — skipping auto-login, use normal login.');
      // Clear any persisted session from previous staging builds that had the secret,
      // because those tokens will be stale/invalid and would cause infinite redirect loops
      // via the axios 401 interceptor (window.location.href = '/login').
      if (isAuthenticated) {
        console.log('[Staging] Clearing stale persisted session from previous staging build.');
        logout();
      }
      setStagingRefreshed(true);
      return;
    }

    const stagingAutoLogin = async () => {
      try {
        console.log('[Staging] Auto-login initiated...');
        const res = await fetch('/api/auth/staging/auto-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Staging-Secret': stagingSecret,
          },
          body: JSON.stringify({ language: import.meta.env.VITE_LANGUAGE || 'pl' }),
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`Staging auto-login failed: ${res.status}`);

        const data = await res.json();
        if (data.success && data.user) {
          if (data.accessToken) localStorage.setItem('procurea_token', data.accessToken);
          if (data.refreshToken) localStorage.setItem('procurea_refresh', data.refreshToken);
          setUser(data.user);
          setUserIdentity(data.user);
          markSessionValidated();
          console.log('[Staging] Auto-login successful:', data.user.email);
        }
      } catch (err: unknown) {
        // Single attempt — do NOT retry. Fall through to normal login screen.
        console.error('[Staging] Auto-login failed:', err instanceof Error ? err.message : err);
        console.log('[Staging] Falling back to normal login flow.');
        // Clear any persisted session so the user lands on /login cleanly instead of
        // hitting the 401 interceptor redirect loop with a stale token.
        if (isAuthenticated) {
          logout();
        }
      } finally {
        // ALWAYS set refreshed=true so the effect never re-runs, preventing infinite loops.
        setStagingRefreshed(true);
      }
    };

    stagingAutoLogin();
  }, [hydrated, impersonating, stagingRefreshed, setUser, markSessionValidated, isAuthenticated, logout]);

  // Handle dev auto-login — local development with plan='full'
  const [devRefreshed, setDevRefreshed] = useState(false);
  useEffect(() => {
    if (!hydrated || impersonating || devRefreshed) return;
    // Only in Vite dev mode AND not staging mode
    if (!import.meta.env.DEV || import.meta.env.VITE_STAGING_MODE === 'true') return;

    const devAutoLogin = async () => {
      try {
        console.log('[Dev] Auto-login initiated...');
        const res = await fetch('/api/auth/dev/auto-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`Dev auto-login failed: ${res.status}`);

        const data = await res.json();
        if (data.success && data.user) {
          if (data.accessToken) localStorage.setItem('procurea_token', data.accessToken);
          if (data.refreshToken) localStorage.setItem('procurea_refresh', data.refreshToken);
          setUser(data.user);
          setUserIdentity(data.user);
          markSessionValidated();
          console.log('[Dev] Auto-login successful:', data.user.email, 'plan:', data.user.plan);
        }
      } catch (err: unknown) {
        console.error('[Dev] Auto-login failed:', err instanceof Error ? err.message : err);
      } finally {
        setDevRefreshed(true);
      }
    };

    devAutoLogin();
  }, [hydrated, impersonating, devRefreshed, setUser, markSessionValidated]);

  // Validate persisted session against backend on mount (stale session detection only)
  useEffect(() => {
    if (!hydrated || impersonating || !isAuthenticated || !user?.id || sessionValidated) return;

    markSessionValidated();

    // Retry logic: only logout on 401/403, not on network errors
    const validateSession = async (retryCount = 0) => {
      try {
        const res = await apiClient.get('/auth/me');
        // Refresh user data (picks up new fields like plan)
        if (res.data?.id) {
          setUser(res.data);
          setUserIdentity(res.data);
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number }; message?: string };
        // Only logout on authentication errors (401, 403)
        if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
          console.log('[App] Stale session detected (401/403), logging out');
          logout();
        } else if (retryCount < 2) {
          // Retry network errors or other 5xx errors
          console.log(`[App] Session validation failed (${axiosErr.message}), retrying... (${retryCount + 1}/2)`);
          setTimeout(() => validateSession(retryCount + 1), 1000);
        } else {
          // After 2 retries, assume network issue and stay logged in
          console.log('[App] Session validation failed after retries, assuming temporary network issue');
        }
      }
    };

    validateSession();
  }, [hydrated, impersonating, isAuthenticated, user?.id, sessionValidated, markSessionValidated, setUser, logout]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setUserIdentity(loggedInUser)
    markSessionValidated()
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Proceed with local logout even if server call fails
    }
    clearUserIdentity()
    logout()
  }

  const needsOnboarding = false; // Beta: rejestracja uproszczona, bez onboardingu

  // Show loading screen while Zustand rehydrates or impersonation is in progress
  if (!hydrated || impersonating) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {import.meta.env.VITE_STAGING_MODE === 'true' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          zIndex: 9999,
        }} />
      )}
      {import.meta.env.DEV && import.meta.env.VITE_STAGING_MODE !== 'true' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #22c55e, #06b6d4)',
          zIndex: 9999,
        }} />
      )}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'shadow-soft-xl rounded-[1rem] border-muted/50 backdrop-blur-md',
          style: { padding: '16px' }
        }}
      />
      <Router>
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* OAuth callback — public, handles token exchange */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Public Routes — Supplier Portal + Status (no auth required) */}
          <Route path="/offers/:accessToken" element={<SupplierPortalPage />} />
          <Route path="/status" element={<StatusPage />} />

          {/* Onboarding — authenticated but not yet onboarded */}
          {/* Beta: onboarding skipped — redirect to dashboard */}
          <Route path="/onboarding" element={<Navigate to="/" />} />

          {/* Protected Routes */}
          <Route element={
            isAuthenticated
              ? (needsOnboarding ? <Navigate to="/onboarding" /> : <AppLayout onLogout={handleLogout} />)
              : <Navigate to="/login" />
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<RfqWizardPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/rfqs" element={<PlanGuard feature="RFQ"><RfqsPage /></PlanGuard>} />
            <Route path="/rfqs/:id" element={<PlanGuard feature="RFQ"><RfqDetailPage /></PlanGuard>} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="/blacklist" element={<BlacklistPage />} />
            <Route path="/contacts" element={<PlanGuard feature={((import.meta.env.VITE_LANGUAGE || 'pl') === 'en') ? 'Contacts' : 'Kontakty'}><ContactsPage /></PlanGuard>} />
            <Route path="/sequences" element={<PlanGuard feature={((import.meta.env.VITE_LANGUAGE || 'pl') === 'en') ? 'Email Sequences' : 'Sekwencje email'}><SequencesPage /></PlanGuard>} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/contracts" element={<PlanGuard feature={((import.meta.env.VITE_LANGUAGE || 'pl') === 'en') ? 'Contracts' : 'Kontrakty'}><ContractsPage /></PlanGuard>} />
            <Route path="/approvals" element={<PlanGuard feature={((import.meta.env.VITE_LANGUAGE || 'pl') === 'en') ? 'Approvals' : 'Zatwierdzenia'}><ApprovalsPage /></PlanGuard>} />
            <Route path="/workspaces" element={<PlanGuard feature={((import.meta.env.VITE_LANGUAGE || 'pl') === 'en') ? 'Workspaces' : 'Przestrzenie robocze'}><WorkspacesPage /></PlanGuard>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  )
}

export default App
