"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston_1 = require("winston");
let LoggerService = class LoggerService {
    logger;
    context = {};
    constructor() {
        this.logger = (0, winston_1.createLogger)({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
            defaultMeta: { service: 'procurea-backend' },
            transports: [
                new winston_1.transports.Console({
                    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ timestamp, level, message, context, ...meta }) => {
                        const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
                        return `${timestamp} [${context || 'App'}] ${level}: ${message} ${metaStr}`;
                    }))
                })
            ]
        });
    }
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    clearContext() {
        this.context = {};
    }
    log(message, meta) {
        this.logger.info(message, { ...this.context, ...meta });
    }
    error(message, trace, meta) {
        this.logger.error(message, { ...this.context, ...meta, trace });
    }
    warn(message, meta) {
        this.logger.warn(message, { ...this.context, ...meta });
    }
    debug(message, meta) {
        this.logger.debug(message, { ...this.context, ...meta });
    }
    verbose(message, meta) {
        this.logger.verbose(message, { ...this.context, ...meta });
    }
    logOAuthStart(provider, meta) {
        this.log(`OAuth flow started`, { action: 'oauth_start', provider, ...meta });
    }
    logOAuthCallback(provider, success, meta) {
        this.log(`OAuth callback received`, {
            action: 'oauth_callback',
            provider,
            success,
            ...meta
        });
    }
    logCookieSet(cookieOptions, meta) {
        this.log(`Cookie set`, {
            action: 'cookie_set',
            cookieOptions: JSON.stringify(cookieOptions),
            ...meta
        });
    }
    logAuthRequest(endpoint, authenticated, meta) {
        this.log(`Auth request to ${endpoint}`, {
            action: 'auth_request',
            endpoint,
            authenticated,
            ...meta
        });
    }
    logUserFetch(userId, success, meta) {
        this.log(`User profile fetch`, {
            action: 'user_fetch',
            userId,
            success,
            ...meta
        });
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);
//# sourceMappingURL=logger.service.js.map