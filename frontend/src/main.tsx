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

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div style={{ padding: '20px', fontFamily: 'sans-serif' }}><h2>Wystąpił błąd aplikacji</h2><p>Nasz zespół inżynierów został już powiadomiony o problemie.</p><button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Odśwież stronę</button></div>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
