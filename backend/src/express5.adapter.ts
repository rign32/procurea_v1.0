import { ExpressAdapter } from '@nestjs/platform-express';
import type { Application } from 'express';
import express from 'express';

/**
 * Custom Express Adapter for Express 5.x compatibility.
 *
 * Does two things:
 *
 * 1. Patches `isMiddlewareApplied` (removed in Express 5) so NestJS doesn't
 *    crash while checking whether its parser middleware is already attached.
 *
 * 2. Overrides `registerParserMiddleware` to install body parsers with a
 *    wrapper that converts body-parser errors (malformed JSON, payload too
 *    large) into structured JSON responses. Without this, Express falls
 *    back to its default handler which emits "Internal Server Error" as
 *    HTTP 500 plain text — bypassing both CORS headers and NestJS
 *    AllExceptionsFilter.
 */
export class Express5Adapter extends ExpressAdapter {
    constructor(instance?: Application) {
        super(instance);

        // 1. Patch isMiddlewareApplied for Express 5.x (removed app.router).
        const originalRegisterParserMiddleware = (this as any).registerParserMiddleware;

        (this as any).registerParserMiddleware = function (prefix?: string, rawBody?: boolean) {
            const app = this.instance as Application;

            // 2. Install body parsers wrapped so malformed JSON → 400 JSON, not 500.
            // We register these ourselves and skip Nest's default registration to
            // avoid double-parsing. Raw-body capture (for Stripe webhooks etc.) is
            // already done at the outer Express layer before this runs.
            const jsonParser = express.json({ limit: '10mb' });
            const urlencodedParser = express.urlencoded({ extended: true, limit: '10mb' });

            const safeParse = (parser: express.RequestHandler, kind: 'json' | 'urlencoded') =>
                (req: any, res: any, next: any) => {
                    parser(req, res, (err: any) => {
                        if (!err) return next();
                        const isParse = err?.type === 'entity.parse.failed' || err instanceof SyntaxError;
                        const isTooLarge = err?.type === 'entity.too.large';
                        if (!isParse && !isTooLarge) return next(err);
                        if (res.headersSent) return;
                        const status = isTooLarge ? 413 : 400;
                        res.status(status).json({
                            statusCode: status,
                            error: isTooLarge ? 'Payload Too Large' : 'Bad Request',
                            message: isTooLarge
                                ? 'Request body exceeds size limit'
                                : `Invalid ${kind === 'json' ? 'JSON' : 'URL-encoded'} body`,
                            timestamp: new Date().toISOString(),
                            path: req.url,
                        });
                    });
                };

            app.use(safeParse(jsonParser, 'json'));
            app.use(safeParse(urlencodedParser, 'urlencoded'));

            // Preserve the original call path for any other side effects (though
            // in current Nest it only registers json/urlencoded, which we've now
            // replaced). Guard against re-registering by temporarily telling Nest
            // the middleware is already applied.
            const originalIsMiddlewareApplied = (this as any).isMiddlewareApplied;
            (this as any).isMiddlewareApplied = () => true;
            try {
                originalRegisterParserMiddleware.call(this, prefix, rawBody);
            } finally {
                (this as any).isMiddlewareApplied = originalIsMiddlewareApplied;
            }
        };
    }
}
