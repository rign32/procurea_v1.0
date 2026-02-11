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
exports.AuthMeLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const auth_logs_service_1 = require("../logger/auth-logs.service");
let AuthMeLoggerMiddleware = class AuthMeLoggerMiddleware {
    authLogsService;
    constructor(authLogsService) {
        this.authLogsService = authLogsService;
    }
    async use(req, res, next) {
        const requestId = req.requestId || 'unknown';
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
};
exports.AuthMeLoggerMiddleware = AuthMeLoggerMiddleware;
exports.AuthMeLoggerMiddleware = AuthMeLoggerMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_logs_service_1.AuthLogsService])
], AuthMeLoggerMiddleware);
//# sourceMappingURL=auth-me-logger.middleware.js.map