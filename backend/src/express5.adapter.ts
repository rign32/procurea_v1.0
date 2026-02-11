import { ExpressAdapter } from '@nestjs/platform-express';
import type { Application } from 'express';

/**
 * Custom Express Adapter for Express 5.x compatibility
 * 
 * Express 5.x removed the deprecated `app.router` property, which causes
 * NestJS's ExpressAdapter to throw an error when checking if middleware
 * is already applied. This custom adapter patches the problematic method.
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
