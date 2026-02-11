import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthLogsService } from '../logger/auth-logs.service';

@Injectable()
export class AuthMeLoggerMiddleware implements NestMiddleware {
    constructor(private authLogsService: AuthLogsService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const requestId = (req as any).requestId || 'unknown';

        // Log BEFORE guard executes
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'auth_me_request_received',
            success: true,
            metadata: {
                method: req.method,
                url: req.url,
                hasCookie: !!(req.cookies && req.cookies.procurea_token),
                cookieLength: req.cookies?.procurea_token?.length || 0,
                hasAuthHeader: !!req.headers.authorization,
                origin: req.headers.origin,
                referer: req.headers.referer,
                userAgent: req.headers['user-agent'],
                allCookieNames: req.cookies ? Object.keys(req.cookies).join(', ') : 'none'
            }
        });

        next();
    }
}
