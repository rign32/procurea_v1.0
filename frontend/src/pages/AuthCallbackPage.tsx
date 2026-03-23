import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { t } from '../i18n';
import { analytics } from '../lib/analytics';

/**
 * OAuth callback handler.
 * After OAuth redirect, the backend sets an exchange token in an httpOnly cookie
 * and redirects here. This page exchanges the token for access/refresh tokens.
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const exchangeToken = async () => {
            try {
                const res = await fetch('/api/auth/exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'Token exchange failed');
                }

                const data = await res.json();

                if (data.success && data.user) {
                    analytics.oauthCallback(true);
                    // Store tokens for Authorization header (Firebase Hosting strips cookies except __session)
                    if (data.accessToken) localStorage.setItem('procurea_token', data.accessToken);
                    if (data.refreshToken) localStorage.setItem('procurea_refresh', data.refreshToken);
                    setUser(data.user);

                    if (!data.user.onboardingCompleted) {
                        navigate('/onboarding', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                } else {
                    throw new Error('Authentication failed');
                }
            } catch (err: unknown) {
                analytics.oauthCallback(false);
                const errMsg = err instanceof Error ? err.message : String(err);
                console.error('[AuthCallback] Error:', err);

                // If user is blocked, redirect immediately with blocked param
                if (errMsg === 'ACCOUNT_BLOCKED') {
                    navigate('/login?blocked=true', { replace: true });
                    return;
                }

                setError(errMsg || t.errors.generic);
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        };

        exchangeToken();
    }, [navigate, setUser]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="text-destructive text-lg font-medium">{t.auth.loginError}</div>
                    <p className="text-muted-foreground text-sm">{error}</p>
                    <p className="text-xs text-muted-foreground">{t.auth.redirectingToLogin}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">{t.auth.loggingIn}</p>
            </div>
        </div>
    );
}
