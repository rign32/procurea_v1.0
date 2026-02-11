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
exports.AuthLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthLogsService = class AuthLogsService {
    prisma;
    logs = [];
    maxLogs = 1000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAuthEvent(entry) {
        const logEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            ...entry
        };
        this.logs.unshift(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }
        console.log('[AUTH LOG]', JSON.stringify(logEntry, null, 2));
        return logEntry;
    }
    getRecentLogs(limit = 50, filters) {
        let filtered = this.logs;
        if (filters?.userId) {
            filtered = filtered.filter(log => log.userId === filters.userId);
        }
        if (filters?.action) {
            filtered = filtered.filter(log => log.action === filters.action);
        }
        if (filters?.requestId) {
            filtered = filtered.filter(log => log.requestId === filters.requestId);
        }
        return filtered.slice(0, limit);
    }
    getLogsByRequestId(requestId) {
        return this.logs.filter(log => log.requestId === requestId);
    }
    async getOAuthFlow(requestId) {
        const logs = this.getLogsByRequestId(requestId);
        return {
            requestId,
            totalSteps: logs.length,
            success: logs.every(log => log.success),
            steps: logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
            errors: logs.filter(log => !log.success)
        };
    }
};
exports.AuthLogsService = AuthLogsService;
exports.AuthLogsService = AuthLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthLogsService);
//# sourceMappingURL=auth-logs.service.js.map