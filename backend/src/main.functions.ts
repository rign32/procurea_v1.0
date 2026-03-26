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

// Capture raw body for Stripe webhook signature verification
// Must be BEFORE prefix stripping AND before NestJS body parsing
const webhookRawParser = express.raw({ type: 'application/json' });
expressApp.use('/api/billing/webhook', webhookRawParser);
expressApp.use('/billing/webhook', webhookRawParser);

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
            credentials: true,
        });

        await app.init();
        console.log('NestJS initialized for Cloud Functions (2nd Gen)');
    }
    return app;
};

// Export as 2nd Gen Cloud Function
// Optimized configuration for cost and performance
export const api = onRequest(
    {
        region: 'europe-west1',

        // Memory: 4GiB for NestJS + sourcing pipeline (AI calls, concurrent scraping, 2000+ URLs in batch)
        memory: '4GiB',

        // Timeout: 1800s (30 min) — two-phase pipeline: search collection ~60s + batch processing ~10-15 min
        timeoutSeconds: 1800,

        // Concurrency: Handle multiple requests per instance (HUGE cost savings!)
        // Default is 1, meaning 1 request = 1 instance
        // With 80, each instance handles up to 80 concurrent requests
        concurrency: 80,

        // Min instances: Keep 1 warm to avoid cold starts (costs ~$5/month but eliminates 2-3s cold starts)
        minInstances: 1,

        // Max instances: Limit to prevent runaway costs
        maxInstances: 10,

        // CPU: Use 1 CPU for better performance (default is 0.166)
        // Only needed if you have CPU-intensive operations
        // cpu: 1,

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
        ],
    },
    expressApp
);

// Staging Cloud Function — separate Cloud Run service with its own database
export const apiStaging = onRequest(
    {
        region: 'europe-west1',
        memory: '4GiB',
        timeoutSeconds: 1800,
        concurrency: 80,
        minInstances: 0,
        maxInstances: 3,
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
        ],
    },
    expressApp
);

// Initialize NestJS on cold start
createNestServer().catch(err => console.error('NestJS init failed:', err));
