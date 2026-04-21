import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n';
import { Sparkles, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { analytics, startHesitationTracker, captureUtmParams, fireGoogleAdsConversion } from '@/lib/analytics';
import type { User } from '@/types/campaign.types';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const MicrosoftIcon = () => (
    <svg viewBox="0 0 21 21" className="h-5 w-5" aria-hidden="true">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
);

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
    const { user, isAuthenticated } = useAuthStore();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState('');
    const [resendCountdown, setResendCountdown] = useState(0);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const codeInputRef = useRef<HTMLInputElement>(null);

    // Detect ?blocked=true URL param (set by OAuth redirect or API interceptor)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('blocked') === 'true') {
            setBlockedMessage(t.auth.accountBlocked);
            // Clean URL to prevent showing message on manual refresh
            window.history.replaceState({}, '', '/login');
        }
    }, []);

    useEffect(() => {
        captureUtmParams();
        // Write UTM data as cookie so backend can read it during SSO/email auth flows
        const utmRaw = sessionStorage.getItem('procurea_utm');
        if (utmRaw) {
            document.cookie = `procurea_utm=${encodeURIComponent(utmRaw)}; path=/; max-age=600; SameSite=Lax`;
        }
        analytics.loginPageView();
        return startHesitationTracker('login', 30000);
    }, []);

    useEffect(() => {
        // Handle corrupted or incomplete state
        if (isAuthenticated && (!user || !user.id)) {
            useAuthStore.getState().logout();
            setStep('email');
        }
    }, [isAuthenticated, user]);

    // Autofocus the active input when step changes so the user can type
    // immediately after landing on the page or after a send-code redirect.
    useEffect(() => {
        if (step === 'email') emailInputRef.current?.focus();
        else codeInputRef.current?.focus();
    }, [step]);

    // Resend-code cooldown ticker (prevents hammering the endpoint and
    // surfaces the wait to the user).
    useEffect(() => {
        if (resendCountdown <= 0) return;
        const timer = setTimeout(() => setResendCountdown((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    const handleSSOLogin = async (provider: 'google' | 'microsoft') => {
        analytics.methodSelected(provider);
        document.cookie = 'procurea_auth_mode=login; path=/; max-age=600; SameSite=Lax';
        const origin = import.meta.env.VITE_LANGUAGE === 'en' ? 'app-en' : 'app';
        document.cookie = `procurea_auth_origin=${origin}; path=/; max-age=600; SameSite=Lax`;
        await fireGoogleAdsConversion();
        window.location.href = `/api/auth/${provider}?origin=${origin}`;
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            analytics.methodSelected('email');
            analytics.emailSubmitted();
            const res = await fetch('/api/auth/email/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, language: import.meta.env.VITE_LANGUAGE || 'pl' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || t.errors.generic);
            analytics.codeSent();
            fireGoogleAdsConversion();
            setStep('code');
            setMessage(t.auth.codeSent);
            setResendCountdown(30);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            analytics.codeFailed(errMsg);
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.message === 'ACCOUNT_BLOCKED') {
                    setBlockedMessage(t.auth.accountBlocked);
                    setStep('email');
                    setLoading(false);
                    return;
                }
                throw new Error(data.message || t.errors.generic);
            }
            analytics.codeVerified();
            fireGoogleAdsConversion();
            // Store tokens for Authorization header (Firebase Hosting strips cookies)
            if (data.accessToken) localStorage.setItem('procurea_token', data.accessToken);
            if (data.refreshToken) localStorage.setItem('procurea_refresh', data.refreshToken);
            onLogin(data.user);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            analytics.codeFailed(errMsg);
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic title/subtitle based on step
    let title = t.auth.loginTitle;
    let subtitle = t.auth.loginSubtitle;
    if (step === 'code') {
        title = t.auth.code;
        subtitle = `${t.auth.codeSentTo} ${email}`;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo & Brand */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                            <span className="text-2xl font-bold">P</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Procurea</h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm">AI-Powered Sourcing Platform</span>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">{title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {blockedMessage && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
                                {blockedMessage}
                            </div>
                        )}
                        {error && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                                {message}
                            </div>
                        )}

                        {step === 'email' && (
                            <>
                                {/* SSO Buttons */}
                                <div className="space-y-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-11 gap-3 font-medium"
                                        onClick={() => handleSSOLogin('google')}
                                        disabled={loading}
                                    >
                                        <GoogleIcon />
                                        {t.auth.continueWithGoogle}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-11 gap-3 font-medium"
                                        onClick={() => handleSSOLogin('microsoft')}
                                        disabled={loading}
                                    >
                                        <MicrosoftIcon />
                                        {t.auth.continueWithMicrosoft}
                                    </Button>
                                </div>

                                {/* Separator */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">
                                            {t.auth.orSeparator}
                                        </span>
                                    </div>
                                </div>

                                {/* Email Form */}
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium" htmlFor="email">
                                            {t.auth.email}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                ref={emailInputRef}
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                autoComplete="email"
                                                autoFocus
                                                placeholder={t.auth.emailPlaceholder}
                                                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading || !email}>
                                        {loading ? t.auth.sending : t.auth.sendCode}
                                    </Button>
                                </form>
                            </>
                        )}

                        {step === 'code' && (
                            <form onSubmit={handleCodeSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor="code">
                                        {t.auth.code}
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            ref={codeInputRef}
                                            id="code"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            pattern="\d{6}"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                            required
                                            autoFocus
                                            placeholder={t.auth.codePlaceholder}
                                            className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono tracking-[0.3em]"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
                                    {loading ? t.auth.verifying : t.auth.verify}
                                </Button>

                                {/* Resend — 30s cooldown prevents hammering the endpoint */}
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <span>{t.auth.didNotReceive}</span>
                                    <button
                                        type="button"
                                        disabled={resendCountdown > 0 || loading}
                                        onClick={(e) => { e.preventDefault(); void handleEmailSubmit(e as unknown as React.FormEvent); }}
                                        className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                                    >
                                        {resendCountdown > 0
                                            ? t.auth.resendCodeIn.replace('{seconds}', String(resendCountdown))
                                            : t.auth.resendCode}
                                    </button>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => { setStep('email'); setMessage(''); setError(''); setCode(''); }}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t.common.back}
                                </Button>
                            </form>
                        )}


                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    {t.auth.footerTagline}
                </p>
            </div>
        </div>
    );
}
