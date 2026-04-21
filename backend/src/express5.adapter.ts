import { ExpressAdapter } from '@nestjs/platform-express';
import type { Application } from 'express';

/**
 * Custom Express Adapter for Express 5.x compatibility.
 *
 * Express 5.x removed the deprecated `app.router` property, which causes
 * NestJS's ExpressAdapter to throw an error when checking if middleware
 * is already applied. This custom adapter patches the problematic method.
 *
 * Known limitation (2026-04-21): body-parser errors (malformed JSON,
 * entity.too.large) from Nest's internal body parser return HTTP 500
 * plain text instead of a structured 400/413 JSON response. Three
 * approaches attempted — outer expressApp error middleware, wrapped
 * express.json() before app.init, SyntaxError catch in
 * AllExceptionsFilter — all bypassed by the Express 5 + Nest 11 runtime
 * on Cloud Functions 2nd gen. Requires Cloud Run log access to diagnose
 * further. See docs/qa-findings-2026-04-21.md.
 */
export class Express5Adapter extends ExpressAdapter {
    constructor(instance?: Application) {
        super(instance);

        // Patch the isMiddlewareApplied method to work with Express 5.x
        // We override the private method by accessing it through the prototype
        const originalRegisterParserMiddleware = (this as any).registerParserMiddleware;

        (this as any).registerParserMiddleware = function (prefix?: string, rawBody?: boolean) {
            // Temporarily override isMiddlewareApplied to always return false
            const originalIsMiddlewareApplied = (this as any).isMiddlewareApplied;
            (this as any).isMiddlewareApplied = () => false;

            try {
                // Call the original method
                originalRegisterParserMiddleware.call(this, prefix, rawBody);
            } finally {
                // Restore the original method
                (this as any).isMiddlewareApplied = originalIsMiddlewareApplied;
            }
        };
    }
}
