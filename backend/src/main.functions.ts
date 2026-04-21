import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Express5Adapter } from './express5.adapter';
import { AppModule } from './app.module';
import { onRequest } from 'firebase-functions/v2/https';
import cookieParser from 'cookie-parser';
import express from 'express';

// Staging env remapping: Cloud Run injects DATABASE_URL_STAGING for apiStaging service.
// PrismaService reads DATABASE_URL, so remap before NestJS initializes.
// Safe: each exported function = separate Cloud Run service, no cross-contamination.
if (process.env.DATABASE_URL_STAGING && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_STAGING;
}

const expressApp = express();
let app: NestExpressApplication;

// Security headers applied at Express layer so every response (including ones from
// Express error middleware that bypasses NestJS filters) carries them. Added
// 2026-04-21 during QA hardening pass.
expressApp.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    );
    // CSP tuned for a JSON API. Swagger UI needs a looser policy so skip /api/docs.
    if (!req.url.startsWith('/api/docs') && !req.url.startsWith('/docs')) {
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
        );
    }
    next();
});

// Capture raw body for Stripe + Resend Inbound webhook signature verification
// Must be BEFORE prefix stripping AND before NestJS body parsing
const webhookRawParser = express.raw({ type: 'application/json' });
expressApp.use('/api/billing/webhook', webhookRawParser);
expressApp.use('/billing/webhook', webhookRawParser);
expressApp.use('/api/webhooks/resend/inbound', webhookRawParser);
expressApp.use('/webhooks/resend/inbound', webhookRawParser);

// Strip /api prefix from incoming requests
// Firebase Hosting rewrites /api/** → Cloud Function with full path
// NestJS controllers are defined without /api prefix (e.g., @Controller('auth'))
// This mirrors what Vite proxy does in development
expressApp.use((req, _res, next) => {
    if (req.url.startsWith('/api/')) {
        req.url = req.url.replace(/^\/api/, '');
    } else if (req.url === '/api') {
        req.url = '/';
    }
    next();
});

// Parse JSON before NestJS so we can own the error path. Body-parser errors
// (malformed JSON, body too large) were leaking as HTTP 500 + plain text
// because they fire before the request reaches NestJS AllExceptionsFilter.
// Added 2026-04-21 during QA hardening pass.
expressApp.use(express.json({ limit: '10mb' }));
expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }));
expressApp.use((err: any, req: any, res: any, next: any) => {
    if (res.headersSent) return next(err);
    const isJsonParse = err?.type === 'entity.parse.failed' || err instanceof SyntaxError;
    const isTooLarge = err?.type === 'entity.too.large';
    if (isJsonParse || isTooLarge) {
        const status = isTooLarge ? 413 : 400;
        return res.status(status).json({
            statusCode: status,
            error: isTooLarge ? 'Payload Too Large' : 'Bad Request',
            message: isTooLarge ? 'Request body exceeds size limit' : 'Invalid JSON body',
            timestamp: new Date().toISOString(),
            path: req.url,
        });
    }
    return next(err);
});

const createNestServer = async () => {
    if (!app) {
        // Use Express5Adapter for Express 5.x compatibility
        app = await NestFactory.create<NestExpressApplication>(
            AppModule,
            new Express5Adapter(expressApp),
            { logger: ['error', 'warn', 'log'] }
        );

        app.use(cookieParser());

        // Global exception filter: sanitize errors, catch Prisma exceptions
        app.useGlobalFilters(new AllExceptionsFilter());

        // Input validation: strip unknown properties, transform types
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }));

        // CORS configuration
        // Production-only CORS — Cloud Functions never serve localhost
        app.enableCors({
            origin: [
                'https://procurea.pl',
                'https://www.procurea.pl',
                'https://app.procurea.pl',
                'https://admin.procurea.pl',
                'https://vendor.procurea.pl',
                'https://staging.procurea.pl',
                'https://procurea-app-staging.web.app',
                'https://procurea-app-staging-en.web.app',
                'https://project-c64b9be9-1d92-4bc6-be7.web.app',
                // EN domains (procurea.io)
                'https://procurea.io',
                'https://www.procurea.io',
                'https://app.procurea.io',
                'https://staging.procurea.io',
            ],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            // Authorization is needed because EN frontend (app.procurea.io) sends
            // bearer tokens in addition to httpOnly cookies; without this Safari
            // rejects every preflight with "access control checks" error.
            allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept',
            credentials: true,
        });

        await app.init();
        console.log('NestJS initialized for Cloud Functions (2nd Gen)');
    }
    return app;
};

// Export as 2nd Gen Cloud Function
// 2026-04-20: resized 4GiB→2GiB, maxInstances 10→5 for cost optimization (~$13/mo).
// If pipeline sourcing OOMs at 500+ suppliers, bump memory back to 4GiB.
export const api = onRequest(
    {
        region: 'europe-west1',
        memory: '2GiB',
        timeoutSeconds: 1800,
        concurrency: 80,
        minInstances: 1,
        maxInstances: 5,

        // Secrets from GCP Secret Manager — automatically injected as env vars
        secrets: [
            'DATABASE_URL',
            'JWT_SECRET',
            'GEMINI_API_KEY',
            'SERPER_API_KEY',
            'RESEND_API_KEY',
            'CRON_SECRET',
            'GOOGLE_CLIENT_SECRET',
            'TWILIO_ACCOUNT_SID',
            'TWILIO_AUTH_TOKEN',
            'TWILIO_VERIFY_SERVICE_SID',
            'FIREBASE_STORAGE_BUCKET',
            'STAGING_SECRET',
            'SCRAPING_API_KEY',
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'STRIPE_LIVE_SECRET_KEY',
            'STRIPE_LIVE_WEBHOOK_SECRET',
            'STRIPE_LIVE_PRICE_ID',
            'STRIPE_LIVE_PRICE_ID_USD',
            'ATTIO_API_KEY',
            'SLACK_BOT_TOKEN',
            'SLACK_CHANNEL_ID',
            'SLACK_ALERTS_CHANNEL_ID',
            'APOLLO_WEBHOOK_SECRET',
            'APOLLO_API_KEY',
            'RESEND_INBOUND_WEBHOOK_SECRET',
        ],
    },
    expressApp
);

// Staging Cloud Function — separate Cloud Run service with its own database.
// 2026-04-20: staging sized smaller than prod (1GiB vs 2GiB) — no prod load here.
// 2026-04-21: cold-start 500s on first request after hibernation are caused by
// minInstances: 0. Bumping to 1 costs ~$5/mo and fixes the UX issue, BUT Firebase
// CLI refuses to deploy the increase without an initial manual approval — see
// docs/qa-findings-2026-04-21.md §P1. To enable: run once locally from repo root:
//   npx firebase deploy --only functions:apiStaging --project project-c64b9be9-1d92-4bc6-be7 --force
// with minInstances: 1 set here, then subsequent CI deploys will work.
// Kept at 0 for now so CI passes.
export const apiStaging = onRequest(
    {
        region: 'europe-west1',
        memory: '1GiB',
        timeoutSeconds: 1800,
        concurrency: 80,
        minInstances: 0,
        maxInstances: 2,
        secrets: [
            'DATABASE_URL_STAGING',
            'JWT_SECRET',
            'GEMINI_API_KEY',
            'SERPER_API_KEY',
            'RESEND_API_KEY',
            'CRON_SECRET',
            'GOOGLE_CLIENT_SECRET',
            'TWILIO_ACCOUNT_SID',
            'TWILIO_AUTH_TOKEN',
            'TWILIO_VERIFY_SERVICE_SID',
            'FIREBASE_STORAGE_BUCKET',
            'STAGING_SECRET',
            'SCRAPING_API_KEY',
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'ATTIO_API_KEY',
            'SLACK_BOT_TOKEN',
            'SLACK_CHANNEL_ID',
            'SLACK_ALERTS_CHANNEL_ID',
            'APOLLO_WEBHOOK_SECRET',
            'APOLLO_API_KEY',
            'RESEND_INBOUND_WEBHOOK_SECRET',
        ],
    },
    expressApp
);

// Initialize NestJS on cold start
createNestServer().catch(err => console.error('NestJS init failed:', err));
