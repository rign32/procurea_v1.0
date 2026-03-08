import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Express5Adapter } from './express5.adapter';
import { AppModule } from './app.module';
import { onRequest } from 'firebase-functions/v2/https';
import cookieParser from 'cookie-parser';
import express from 'express';

const expressApp = express();
let app: NestExpressApplication;

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
                'https://project-c64b9be9-1d92-4bc6-be7.web.app',
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

        // Memory: 1GiB for NestJS + sourcing pipeline (AI calls, concurrent scraping)
        memory: '1GiB',

        // Timeout: 540s (max for 2nd Gen) — sourcing pipeline can run 3-15 min
        // Regular API endpoints return fast; sourcing runs in background within the same request lifecycle
        timeoutSeconds: 540,

        // Concurrency: Handle multiple requests per instance (HUGE cost savings!)
        // Default is 1, meaning 1 request = 1 instance
        // With 80, each instance handles up to 80 concurrent requests
        concurrency: 80,

        // Min instances: Keep 1 warm to avoid cold starts (costs ~$5/month but eliminates 2-3s cold starts)
        // Set to 0 if you want to optimize for cost over latency
        // Currently set to 0 for cost optimization - change to 1 and deploy with --force if cold starts become an issue
        minInstances: 0,

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
            'SERP_API_KEY',
            'RESEND_API_KEY',
            'CRON_SECRET',
            'GOOGLE_CLIENT_SECRET',
            'TWILIO_ACCOUNT_SID',
            'TWILIO_AUTH_TOKEN',
            'TWILIO_VERIFY_SERVICE_SID',
            'FIREBASE_STORAGE_BUCKET',
            'STAGING_SECRET',
        ],
    },
    expressApp
);

// Initialize NestJS on cold start
createNestServer().catch(err => console.error('NestJS init failed:', err));
