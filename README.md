# Procurea

AI-powered supplier sourcing platform. Automatically discovers, screens, and qualifies suppliers using Google Search + Gemini AI, then manages RFQ processes and email outreach sequences.

## Architecture

```
procurea/
├── backend/          # NestJS API + Firebase Cloud Functions
├── frontend/         # React 19 + Vite (main SaaS app)
├── landing/          # Marketing landing page
├── admin-frontend/   # Admin panel
└── .github/workflows/ # CI/CD (GitHub Actions)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 (Docker for dev, Cloud SQL for prod) |
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| State | Zustand (client), @tanstack/react-query (server) |
| AI | Google Gemini 2.0 Flash (AI Studio + Vertex AI fallback) |
| Search | Serper.dev ($0.001/query) |
| Email | Resend |
| Auth | httpOnly cookies, Google/Microsoft OAuth, SMS (Twilio) |
| Hosting | Firebase Hosting + Cloud Functions |
| Payments | Stripe |
| Monitoring | Sentry, PostHog |

### AI Sourcing Pipeline

```
Strategy Agent → Google Search → Scrape URLs
  → Screener Agent (qualify + analyze in 1 Gemini call)
  → Enrichment Agent (email discovery + company details)
  → Auditor Agent (data validation)
```

Cost controls: disk cache (90-day TTL), query cache (30-day), per-campaign search budget.

## Prerequisites

- **Node.js 20** (required by Firebase Functions)
- **Docker** (for PostgreSQL)
- **npm** (package manager)

## Quick Start

### 1. Database

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 with default dev credentials.

### 2. Backend

```bash
cd backend
cp .env.example .env    # Edit with your API keys
npm install
npx prisma migrate dev  # Apply database migrations
npm run start:dev        # Starts on port 3010
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # Starts on port 5173, proxies /api to backend
```

### Environment Variables

See [backend/.env.example](backend/.env.example) for all required and optional variables with descriptions.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `GEMINI_API_KEY` — Google AI Studio API key
- `SERPER_API_KEY` — Serper.dev search API key
- `RESEND_API_KEY` — Email service
- `STRIPE_SECRET_KEY` — Payments (production only)

## Deployment

### Environments

| Environment | URL | Branch | Cloud Function |
|------------|-----|--------|---------------|
| Staging | staging.procurea.pl | `staging` | `apiStaging` |
| Production | app.procurea.pl | `main` | `api` |

### CI/CD Flow

1. Develop on `main` branch locally
2. Push to `staging` branch → GitHub Actions deploys to staging
3. Test on staging.procurea.pl
4. Merge `staging` to `main` → GitHub Actions deploys to production

Environments are **fully isolated** — separate Cloud Functions, separate databases.

### Manual Deploy (staging)

```bash
# Frontend only
cd frontend && npm run build:staging
npx firebase deploy --only hosting:app-staging

# Backend
cd backend && npm run build
npx firebase deploy --only functions:apiStaging
```

## Database

PostgreSQL via Prisma ORM. Migrations in `backend/prisma/migrations/`.

```bash
# Create new migration
cd backend && npx prisma migrate dev --name describe-change

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Direct PostgreSQL access (Docker)
docker exec procurea-db psql -U procurea -d procurea
```

## Testing

```bash
# Backend unit tests
cd backend && npm test

# Backend with coverage
npm run test:cov

# Backend E2E
npm run test:e2e
```

## Project Structure

### Backend (`backend/src/`)

```
├── auth/              # Authentication (OAuth, SMS, cookies)
├── sourcing/          # AI sourcing pipeline
│   ├── agents/        # Strategy, Screener, Enrichment, Auditor
│   └── sourcing.service.ts  # Pipeline orchestrator
├── campaigns/         # Campaign CRUD
├── billing/           # Stripe integration
├── email/             # Resend email service + sequences
├── portal/            # Public supplier portal
├── admin/             # Admin panel API
├── common/            # Shared services (Gemini, Google Search, etc.)
└── prisma/            # Prisma service
```

### Frontend (`frontend/src/`)

```
├── components/        # UI + feature components
│   ├── ui/           # shadcn/ui base components
│   ├── campaigns/    # Campaign-related components
│   └── settings/     # Settings tabs
├── pages/            # Route page components
├── services/         # API client + service modules
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores (auth, campaigns)
├── types/            # TypeScript type definitions
├── i18n/             # Internationalization (PL + EN)
└── utils/            # Utility functions
```

## i18n

Build-time language selection:
- `npm run build` — Polish (procurea.pl)
- `npm run build:en` — English (procurea.io)

Translations: `frontend/src/i18n/pl.ts` and `frontend/src/i18n/en.ts`.
