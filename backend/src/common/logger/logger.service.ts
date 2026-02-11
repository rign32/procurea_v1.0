import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

export interface LogContext {
    requestId?: string;
    userId?: string;
    email?: string;
    action?: string;
    provider?: string;
    [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
    private logger: WinstonLogger;
    private context: LogContext = {};

    constructor() {
        this.logger = createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.errors({ stack: true }),
                format.splat(),
                format.json()
            ),
            defaultMeta: { service: 'procurea-backend' },
            transports: [
                // Console for development and Cloud Logging
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.printf(({ timestamp, level, message, context, ...meta }) => {
                            const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
                            return `${timestamp} [${context || 'App'}] ${level}: ${message} ${metaStr}`;
                        })
                    )
                })
            ]
        });
    }

    setContext(context: LogContext) {
        this.context = { ...this.context, ...context };
    }

    clearContext() {
        this.context = {};
    }

    log(message: string, meta?: LogContext) {
        this.logger.info(message, { ...this.context, ...meta });
    }

    error(message: string, trace?: string, meta?: LogContext) {
        this.logger.error(message, { ...this.context, ...meta, trace });
    }

    warn(message: string, meta?: LogContext) {
        this.logger.warn(message, { ...this.context, ...meta });
    }

    debug(message: string, meta?: LogContext) {
        this.logger.debug(message, { ...this.context, ...meta });
    }

    verbose(message: string, meta?: LogContext) {
        this.logger.verbose(message, { ...this.context, ...meta });
    }

    // OAuth specific logging
    logOAuthStart(provider: string, meta?: LogContext) {
        this.log(`OAuth flow started`, { action: 'oauth_start', provider, ...meta });
    }

    logOAuthCallback(provider: string, success: boolean, meta?: LogContext) {
        this.log(`OAuth callback received`, {
            action: 'oauth_callback',
            provider,
            success,
            ...meta
        });
    }

    logCookieSet(cookieOptions: any, meta?: LogContext) {
        this.log(`Cookie set`, {
            action: 'cookie_set',
            cookieOptions: JSON.stringify(cookieOptions),
            ...meta
        });
    }

    logAuthRequest(endpoint: string, authenticated: boolean, meta?: LogContext) {
        this.log(`Auth request to ${endpoint}`, {
            action: 'auth_request',
            endpoint,
            authenticated,
            ...meta
        });
    }

    logUserFetch(userId: string, success: boolean, meta?: LogContext) {
        this.log(`User profile fetch`, {
            action: 'user_fetch',
            userId,
            success,
            ...meta
        });
    }
}
