import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  /** Optional fallback — override the default UI. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time exceptions and shows a recovery screen instead of a
 * blank white page. Sentry is initialised at app boot so exceptions still
 * reach the issue tracker; this boundary is purely a UX safety net.
 *
 * React error boundaries can only catch errors in descendant components —
 * not in async handlers, event callbacks, or setTimeout. Those are handled
 * by the React Query error states / toast.error pattern in hooks.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console; any attached observability (Sentry) hooks auto-capture too.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    // Fallback is deliberately locale-agnostic (English) — it renders when
    // React has failed, so depending on a working i18n bundle is risky.
    const isDev = import.meta.env.DEV;
    return (
      <div className="min-h-screen bg-bg text-ink flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-[12px] border border-rule bg-surface p-6 shadow-ds-sm">
            <div className="w-12 h-12 rounded-[10px] bg-bad-soft text-bad grid place-items-center mb-4">
              <AlertTriangle className="h-6 w-6" strokeWidth={1.5} />
            </div>

            <h1 className="text-[22px] leading-[1.2] tracking-[-0.02em] font-bold mb-2">
              Something went wrong
            </h1>
            <p className="text-[14px] text-muted-ink leading-[1.5] mb-5">
              The page hit an unexpected error. Your work up to this point is safe
              — nothing was sent to the server. Try reloading; if it happens
              again, let us know and we&apos;ll fix it.
            </p>

            <div className="space-y-2.5 mb-5">
              <Button
                type="button"
                variant="cta"
                className="w-full justify-center"
                onClick={this.reset}
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  window.location.assign('/');
                }}
              >
                <Home className="h-4 w-4" />
                Back to dashboard
              </Button>
            </div>

            {isDev && error.message && (
              <details className="border-t border-rule pt-4 text-xs font-mono text-muted-ink-2">
                <summary className="cursor-pointer">Error detail (dev only)</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all text-bad">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }
}
