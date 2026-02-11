import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthLogsService } from '../logger/auth-logs.service';
export declare class AuthMeLoggerMiddleware implements NestMiddleware {
    private authLogsService;
    constructor(authLogsService: AuthLogsService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
