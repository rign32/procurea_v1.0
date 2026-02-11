import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Express5Adapter } from './express5.adapter';
import { AppModule } from './app.module';
import { onRequest } from 'firebase-functions/v2/https';
import cookieParser from 'cookie-parser';
import express from 'express';

const expressApp = express();
let app: NestExpressApplication;

const createNestServer = async () => {
    if (!app) {
        // Use Express5Adapter for Express 5.x compatibility
        app = await NestFactory.create<NestExpressApplication>(
            AppModule,
            new Express5Adapter(expressApp),
            { logger: ['error', 'warn', 'log'] }
        );

        app.use(cookieParser());

        // CORS configuration
        app.enableCors({
            origin: [
                'https://procurea.pl',
                'https://www.procurea.pl',
                'https://app.procurea.pl',
                'https://admin.procurea.pl',
                'https://vendor.procurea.pl',
                'https://blog.procurea.pl',
                'https://api.procurea.pl',
                'https://procurea-app.web.app',
                'https://procurea-admin-panel.web.app',
                'https://procurea-vendor.web.app',
                'https://procurea-landing.web.app',
                'https://procurea-blog-portal.web.app',
                'http://localhost:3015',
                'http://localhost:3016',
                'http://localhost:3017'
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

        // Memory: 512MB recommended for NestJS (default 256MB is often too low)
        // Higher memory = faster CPU, better cold start times
        memory: '512MiB',

        // Timeout: 60s is usually enough, can reduce to 30s if all endpoints are fast
        timeoutSeconds: 60,

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

        // Secrets: Access to secure environment variables
        secrets: [
            'TWILIO_ACCOUNT_SID',
            'TWILIO_AUTH_TOKEN',
            'TWILIO_VERIFY_SERVICE_SID',
            'TWILIO_PHONE_NUMBER',
            'GEMINI_API_KEY',
            'SERP_API_KEY'
        ]
    },
    expressApp
);

// Initialize NestJS on cold start
createNestServer().catch(err => console.error('NestJS init failed:', err));
