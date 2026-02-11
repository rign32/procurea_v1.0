import { LoggerService as NestLoggerService } from '@nestjs/common';
export interface LogContext {
    requestId?: string;
    userId?: string;
    email?: string;
    action?: string;
    provider?: string;
    [key: string]: any;
}
export declare class LoggerService implements NestLoggerService {
    private logger;
    private context;
    constructor();
    setContext(context: LogContext): void;
    clearContext(): void;
    log(message: string, meta?: LogContext): void;
    error(message: string, trace?: string, meta?: LogContext): void;
    warn(message: string, meta?: LogContext): void;
    debug(message: string, meta?: LogContext): void;
    verbose(message: string, meta?: LogContext): void;
    logOAuthStart(provider: string, meta?: LogContext): void;
    logOAuthCallback(provider: string, success: boolean, meta?: LogContext): void;
    logCookieSet(cookieOptions: any, meta?: LogContext): void;
    logAuthRequest(endpoint: string, authenticated: boolean, meta?: LogContext): void;
    logUserFetch(userId: string, success: boolean, meta?: LogContext): void;
}
