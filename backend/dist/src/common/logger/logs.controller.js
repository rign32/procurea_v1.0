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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsController = void 0;
const common_1 = require("@nestjs/common");
const auth_logs_service_1 = require("./auth-logs.service");
let LogsController = class LogsController {
    authLogsService;
    constructor(authLogsService) {
        this.authLogsService = authLogsService;
    }
    getAuthLogs(limit, userId, action, requestId) {
        const filters = { userId, action, requestId };
        return this.authLogsService.getRecentLogs(limit ? parseInt(limit) : 50, filters);
    }
    getOAuthFlow(requestId) {
        if (!requestId) {
            return { error: 'requestId query parameter is required' };
        }
        return this.authLogsService.getOAuthFlow(requestId);
    }
};
exports.LogsController = LogsController;
__decorate([
    (0, common_1.Get)('auth'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], LogsController.prototype, "getAuthLogs", null);
__decorate([
    (0, common_1.Get)('auth/flow'),
    __param(0, (0, common_1.Query)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogsController.prototype, "getOAuthFlow", null);
exports.LogsController = LogsController = __decorate([
    (0, common_1.Controller)('logs'),
    __metadata("design:paramtypes", [auth_logs_service_1.AuthLogsService])
], LogsController);
//# sourceMappingURL=logs.controller.js.map