import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Login from './Login'
import AuthCallbackPage from './pages/AuthCallbackPage'
import OnboardingPage from './pages/OnboardingPage'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import RfqWizardPage from './pages/RfqWizardPage'
import SuppliersPage from './pages/SuppliersPage'
import SupplierDetailPage from './pages/SupplierDetailPage'
import RfqsPage from './pages/RfqsPage'
import RfqDetailPage from './pages/RfqDetailPage'
import SupplierPortalPage from './pages/SupplierPortalPage'
import SequencesPage from './pages/SequencesPage'
import SettingsPage from './pages/SettingsPage'
import BlacklistPage from './pages/BlacklistPage'
import { useAuthStore } from './stores/auth.store'
import apiClient from './services/api.client'

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

function PlanGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user?.plan !== 'full') return <Navigate to="/" />;
  return <>{children}</>;
}

function App() {
  const { user, isAuthenticated, isImpersonated, setUser, setImpersonated, logout, sessionValidated, markSessionValidated } = useAuthStore()

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
  const [stagingRefreshed, setStagingRefreshed] = useState(false);
  useEffect(() => {
    if (!hydrated || impersonating || stagingRefreshed) return;
    if (import.meta.env.VITE_STAGING_MODE !== 'true') return;

    const stagingAutoLogin = async () => {
      try {
        console.log('[Staging] Auto-login initiated...');
        const res = await fetch('/api/auth/staging/auto-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Staging-Secret': import.meta.env.VITE_STAGING_SECRET || '',
          },
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`Staging auto-login failed: ${res.status}`);

        const data = await res.json();
        if (data.success && data.user) {
          if (data.accessToken) localStorage.setItem('procurea_token', data.accessToken);
          if (data.refreshToken) localStorage.setItem('procurea_refresh', data.refreshToken);
          setUser(data.user);
          markSessionValidated();
          console.log('[Staging] Auto-login successful:', data.user.email);
        }
      } catch (err: any) {
        console.error('[Staging] Auto-login failed:', err.message);
      } finally {
        setStagingRefreshed(true);
      }
    };

    stagingAutoLogin();
  }, [hydrated, impersonating, stagingRefreshed, setUser, markSessionValidated]);

  // Validate persisted session against backend on mount (stale session detection only)
  useEffect(() => {
    if (!hydrated || impersonating || !isAuthenticated || !user?.id || sessionValidated) return;

    markSessionValidated();

    // Retry logic: only logout on 401/403, not on network errors
    const validateSession = async (retryCount = 0) => {
      try {
        const res = await apiClient.get('/auth/me');
        // Refresh user data (picks up new fields like plan)
        if (res.data?.id) setUser(res.data);
      } catch (err: any) {
        // Only logout on authentication errors (401, 403)
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('[App] Stale session detected (401/403), logging out');
          logout();
        } else if (retryCount < 2) {
          // Retry network errors or other 5xx errors
          console.log(`[App] Session validation failed (${err.message}), retrying... (${retryCount + 1}/2)`);
          setTimeout(() => validateSession(retryCount + 1), 1000);
        } else {
          // After 2 retries, assume network issue and stay logged in
          console.log('[App] Session validation failed after retries, assuming temporary network issue');
        }
      }
    };

    validateSession();
  }, [hydrated, impersonating, isAuthenticated, user?.id, sessionValidated, markSessionValidated, logout]);

  const handleLogin = (loggedInUser: any) => {
    setUser(loggedInUser)
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
    logout()
  }

  // Admin impersonation bypasses phone verification and onboarding — normal users unaffected
  const needsPhoneVerification = isAuthenticated && !isImpersonated && user?.isPhoneVerified === false;
  const needsOnboarding = isAuthenticated && !isImpersonated && !needsPhoneVerification && user?.onboardingCompleted === false && !user?.organizationId;

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
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated || needsPhoneVerification ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* OAuth callback — public, handles token exchange */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Public Routes — Supplier Portal (no auth required) */}
          <Route path="/offers/:accessToken" element={<SupplierPortalPage />} />

          {/* Onboarding — authenticated and phone verified but not yet onboarded */}
          <Route
            path="/onboarding"
            element={
              isAuthenticated && !needsPhoneVerification
                ? (user?.onboardingCompleted ? <Navigate to="/" /> : <OnboardingPage />)
                : <Navigate to="/login" />
            }
          />

          {/* Protected Routes */}
          <Route element={
            isAuthenticated && !needsPhoneVerification
              ? (needsOnboarding ? <Navigate to="/onboarding" /> : <AppLayout onLogout={handleLogout} />)
              : <Navigate to="/login" />
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<RfqWizardPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/rfqs" element={<PlanGuard><RfqsPage /></PlanGuard>} />
            <Route path="/rfqs/:id" element={<PlanGuard><RfqDetailPage /></PlanGuard>} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="/blacklist" element={<BlacklistPage />} />
            <Route path="/sequences" element={<PlanGuard><SequencesPage /></PlanGuard>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
