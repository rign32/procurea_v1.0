import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Generate or use existing request ID
        const requestId = req.headers['x-request-id'] as string || randomUUID();

        // Attach to request object
        (req as any).requestId = requestId;

        // Add to response headers
        res.setHeader('x-request-id', requestId);

        next();
    }
}
