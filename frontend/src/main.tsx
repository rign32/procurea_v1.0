import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

// PWA service worker was removed — previous implementation (cache-first in
// public/sw.js) trapped users on stale builds by never revalidating cached
// assets. The replacement public/sw.js now self-destructs and unregisters on
// activation for any browser that still has the old SW installed.
// We explicitly unregister here too, in case the browser loaded a cached copy
// of this module bundle that predates the SW removal but still happens to run.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.unregister());
  }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div style={{ padding: '20px', fontFamily: 'sans-serif' }}><h2>Wystąpił błąd aplikacji</h2><p>Nasz zespół inżynierów został już powiadomiony o problemie.</p><button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Odśwież stronę</button></div>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
