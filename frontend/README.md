# Procurea Frontend

React 19 SaaS application for supplier sourcing, RFQ management, and email sequence automation.

## Setup

```bash
npm install
npm run dev    # Starts on port 5173, proxies /api to backend (port 3010)
```

## Build Modes

| Command | Mode | Output | Used for |
|---------|------|--------|----------|
| `npm run build` | Production PL | `dist/` | app.procurea.pl |
| `npm run build:en` | Production EN | `dist-en/` | app.procurea.io |
| `npm run build:staging` | Staging PL | `dist/` | staging.procurea.pl |
| `npm run build:staging-en` | Staging EN | `dist-en/` | staging.procurea.io |

Language is selected at build time via `VITE_LANGUAGE` env variable (`pl` or `en`).

## Tech Stack

- **React 19** with TypeScript
- **Vite** for bundling
- **Tailwind CSS** + **shadcn/ui** for styling
- **Zustand** for client state (auth, campaigns)
- **@tanstack/react-query** for server state (API data fetching)
- **react-hook-form** + **zod** for form validation
- **socket.io-client** for real-time campaign monitoring
- **framer-motion** for animations
- **lucide-react** for icons

## Project Structure

```
src/
├── components/           # UI and feature components
│   ├── ui/              # shadcn/ui base components (Button, Card, Dialog, etc.)
│   ├── campaigns/       # Campaign monitoring components
│   ├── settings/        # Settings page tabs
│   ├── suppliers/       # Supplier list components
│   └── email/           # Email-related components
├── pages/               # Route page components
├── services/            # API client and service modules
│   ├── api.client.ts    # Axios instance with auth interceptors
│   ├── campaigns.service.ts
│   ├── suppliers.service.ts
│   ├── rfqs.service.ts
│   ├── billing.service.ts
│   └── websocket.service.ts
├── hooks/               # Custom React hooks
│   ├── useCampaigns.ts  # Campaign CRUD with React Query
│   ├── useRealTimeMonitor.ts  # WebSocket + polling fallback
│   ├── useSuppliers.ts  # Infinite scroll pagination
│   └── ...
├── stores/              # Zustand stores
│   ├── auth.store.ts    # User session (persisted)
│   └── campaigns.store.ts  # Active campaign + real-time data
├── types/               # TypeScript type definitions
│   ├── campaign.types.ts
│   └── api.types.ts
├── i18n/                # Internationalization
│   ├── index.ts         # Language selector (build-time)
│   ├── pl.ts            # Polish translations
│   ├── en.ts            # English translations
│   └── portal-translations.ts  # Public portal translations
├── utils/               # Utility functions
└── lib/                 # Library configs (analytics)
```

## i18n

Build-time language selection (not runtime switchable):

```typescript
// i18n/index.ts
const LANGUAGE = import.meta.env.VITE_LANGUAGE || 'pl';
export const t = isEN ? EN : PL;
```

All translations are type-safe — `en.ts` implements the `Translations` interface defined by `pl.ts`.

To add a new translatable string:
1. Add key to `pl.ts`
2. Add corresponding key to `en.ts`
3. Use `t.section.key` in components

## API Client

Located in `services/api.client.ts`:
- Base URL: `/api` (proxied by Vite in dev, rewritten by Firebase Hosting in prod)
- Auth: httpOnly cookies + Authorization header (Firebase Hosting workaround)
- Auto token refresh on 401
- Request queuing during token refresh

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_LANGUAGE` | `pl` or `en` (default: `pl`) |
| `VITE_STAGING_SECRET` | Staging auto-login secret |
| `VITE_POSTHOG_KEY` | PostHog analytics key |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with HMR (port 5173) |
| `npm run build` | Production build (Polish) |
| `npm run build:en` | Production build (English) |
| `npm run build:staging` | Staging build (Polish) |
| `npm run lint` | ESLint check |
