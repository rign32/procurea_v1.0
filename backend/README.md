# Procurea Backend

NestJS API powering the Procurea supplier sourcing platform. Deployed as Firebase Cloud Functions.

## Setup

### Prerequisites

- Node.js 20
- Docker (for PostgreSQL)

### Installation

```bash
# Start database
docker compose -f ../docker-compose.yml up -d

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys (see .env.example for descriptions)

# Run database migrations
npx prisma migrate dev

# Start development server (port 3010)
npm run start:dev
```

### Environment Variables

All variables are documented in [.env.example](.env.example). Key groups:

| Group | Variables | Required |
|-------|----------|----------|
| Database | `DATABASE_URL` | Yes |
| Auth | `JWT_SECRET` | Yes |
| AI | `GEMINI_API_KEY` | Yes (or `USE_MOCK_AI=true`) |
| Search | `SERPER_API_KEY` | Yes (for sourcing) |
| Email | `RESEND_API_KEY`, `FROM_EMAIL` | Yes (for sequences) |
| SMS | `TWILIO_*` | Production only |
| Payments | `STRIPE_*` | Production only |
| Cost control | `MAX_SEARCHES_PER_CAMPAIGN` | Optional (default: 20) |

## Architecture

### Modules

| Module | Purpose |
|--------|---------|
| `auth/` | Authentication — Google/Microsoft OAuth, SMS OTP, httpOnly cookies |
| `sourcing/` | AI sourcing pipeline — agents, orchestration, company registry |
| `campaigns/` | Campaign CRUD and management |
| `billing/` | Stripe subscriptions and usage tracking |
| `email/` | Resend integration, email sequences with scheduling |
| `portal/` | Public supplier portal (offer submission) |
| `admin/` | Admin panel API (user management, diagnostics) |
| `common/` | Shared services — Gemini client, Google Search, API usage tracking |
| `prisma/` | Prisma service with connection pooling |

### AI Sourcing Pipeline

Located in `src/sourcing/agents/`:

1. **Strategy Agent** (`strategy.agent.ts`) — Generates search queries per country/language
2. **Screener Agent** (`screener.agent.ts`) — Scrapes URL, qualifies + analyzes supplier (1 Gemini call)
3. **Enrichment Agent** (`enrichment.agent.ts`) — Discovers emails, enriches company data
4. **Auditor Agent** (`auditor.agent.ts`) — Validates all collected data

Orchestrated by `sourcing.service.ts` with parallel processing, rate limiting, and budget controls.

### Key Services

| Service | Location | Purpose |
|---------|----------|---------|
| `GeminiService` | `common/services/gemini.service.ts` | Gemini API client with 90-day disk cache |
| `GoogleSearchService` | `common/services/google-search.service.ts` | Serper.dev with rate limiting and per-campaign budget |
| `PrismaService` | `prisma/prisma.service.ts` | Database with connection pooling (limit=15) |

## Database

PostgreSQL via Prisma ORM.

```bash
# Create a new migration
npx prisma migrate dev --name describe-your-change

# Apply migrations (production/staging)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Open Prisma Studio (visual database browser)
npx prisma studio

# Direct database access
docker exec procurea-db psql -U procurea -d procurea
```

Schema: `prisma/schema.prisma`

## Testing

```bash
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
```

## Building & Deployment

```bash
# Build (generates Prisma client + compiles NestJS)
npm run build

# Deploy as Cloud Function (via CI/CD — don't run manually)
# Staging: push to `staging` branch
# Production: push to `main` branch
```

Entry point for Cloud Functions: `src/main.functions.ts` (exports `api` + `apiStaging`).

## API Documentation

Swagger UI is available at `/api/docs` when running in development mode.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start with hot reload (port 3010) |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run test:cov` | Test coverage report |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier formatting |
| `npx prisma studio` | Visual database browser |
