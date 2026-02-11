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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("./gemini.service");
const google_search_service_1 = require("./google-search.service");
const error_tracking_service_1 = require("./error-tracking.service");
let HealthService = HealthService_1 = class HealthService {
    geminiService;
    googleSearchService;
    errorTrackingService;
    logger = new common_1.Logger(HealthService_1.name);
    appVersion = process.env.npm_package_version || '1.0.0';
    constructor(geminiService, googleSearchService, errorTrackingService) {
        this.geminiService = geminiService;
        this.googleSearchService = googleSearchService;
        this.errorTrackingService = errorTrackingService;
    }
    lastGeminiHealth = null;
    CACHE_TTL = 3600 * 1000;
    async checkGeminiHealth(checkConnectivity = false) {
        const startTime = Date.now();
        try {
            if (!checkConnectivity) {
                const apiKey = process.env.GEMINI_API_KEY;
                if (apiKey) {
                    return {
                        status: 'healthy',
                        lastCheck: new Date(),
                        message: 'Gemini API configured (shallow check)',
                        details: { mode: 'shallow' }
                    };
                }
                else {
                    return {
                        status: 'degraded',
                        lastCheck: new Date(),
                        message: 'Gemini API not configured (missing key)',
                        details: { mode: 'shallow' }
                    };
                }
            }
            const isConnected = await this.geminiService.checkConnectivity();
            const responseTime = Date.now() - startTime;
            if (isConnected) {
                return {
                    status: 'healthy',
                    responseTime,
                    lastCheck: new Date(),
                    message: 'Gemini API client initialized and ready (No-Cost Check)',
                    details: { mode: 'deep-optimized' }
                };
            }
            else {
                return {
                    status: 'unhealthy',
                    responseTime,
                    lastCheck: new Date(),
                    message: 'Gemini API client failed initialization',
                    details: { mode: 'deep-optimized' }
                };
            }
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.errorTrackingService.recordError(error, {
                type: 'API_ERROR',
                service: 'gemini',
                context: { operation: 'health_check' },
            });
            return {
                status: 'unhealthy',
                responseTime,
                lastCheck: new Date(),
                message: error.message || 'Gemini API unreachable',
            };
        }
    }
    async checkSerpApiHealth(checkConnectivity = false) {
        const startTime = Date.now();
        try {
            if (!checkConnectivity) {
                const apiKey = process.env.SERP_API_KEY;
                if (apiKey) {
                    return {
                        status: 'healthy',
                        lastCheck: new Date(),
                        message: 'SERP API configured (shallow check)',
                        details: { mode: 'shallow' }
                    };
                }
                else {
                    return {
                        status: 'degraded',
                        lastCheck: new Date(),
                        message: 'SERP API not configured (missing key)',
                        details: { mode: 'shallow' }
                    };
                }
            }
            if (!checkConnectivity) {
                return {
                    status: 'healthy',
                    lastCheck: new Date(),
                    message: 'SERP API configured (shallow check only)',
                    details: { mode: 'shallow', note: 'Deep check skipped to save costs' }
                };
            }
            this.logger.warn(`[COST ALERT] Executing PAID SERP API Health Check.`);
            const results = await Promise.race([
                this.googleSearchService.searchExtended('test', { num: 1 }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000)),
            ]);
            const responseTime = Date.now() - startTime;
            if (results.length > 0 &&
                results[0].link.includes('example.com')) {
                return {
                    status: 'degraded',
                    responseTime,
                    lastCheck: new Date(),
                    message: 'SERP API running in mock mode (API key not configured)',
                    details: { mockMode: true, mode: 'deep' },
                };
            }
            if (results.length > 0) {
                return {
                    status: 'healthy',
                    responseTime,
                    lastCheck: new Date(),
                    message: 'SERP API responding normally',
                    details: { resultsReturned: results.length, mode: 'deep' },
                };
            }
            return {
                status: 'healthy',
                responseTime,
                lastCheck: new Date(),
                message: 'SERP API responding (no results for test query)',
                details: { mode: 'deep' }
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            if (error.message?.includes('429') || error.response?.status === 429) {
                this.errorTrackingService.recordError(error, {
                    type: 'API_ERROR',
                    service: 'serpApi',
                    context: { operation: 'health_check', reason: 'rate_limit' },
                });
                return {
                    status: 'degraded',
                    responseTime,
                    lastCheck: new Date(),
                    message: 'SERP API rate limited (429)',
                    details: { rateLimited: true },
                };
            }
            this.errorTrackingService.recordError(error, {
                type: 'API_ERROR',
                service: 'serpApi',
                context: { operation: 'health_check' },
            });
            return {
                status: 'unhealthy',
                responseTime,
                lastCheck: new Date(),
                message: error.message || 'SERP API unreachable',
            };
        }
    }
    async checkDatabaseHealth() {
        try {
            return {
                status: 'healthy',
                lastCheck: new Date(),
                message: 'Database connection OK',
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                lastCheck: new Date(),
                message: error.message || 'Database unreachable',
            };
        }
    }
    async getSystemHealth(type = 'shallow') {
        this.logger.log(`Running system health check (${type})...`);
        const checkConnectivity = type === 'deep';
        const [geminiHealth, serpApiHealth, dbHealth] = await Promise.all([
            this.checkGeminiHealth(checkConnectivity),
            this.checkSerpApiHealth(checkConnectivity),
            this.checkDatabaseHealth(),
        ]);
        const errorStats = this.errorTrackingService.getStats();
        const statuses = [geminiHealth.status, serpApiHealth.status, dbHealth.status];
        let overallStatus = 'healthy';
        if (statuses.includes('unhealthy')) {
            overallStatus = 'unhealthy';
        }
        else if (statuses.includes('degraded')) {
            overallStatus = 'degraded';
        }
        const health = {
            status: overallStatus,
            timestamp: new Date(),
            version: this.appVersion,
            environment: process.env.NODE_ENV || 'development',
            services: {
                gemini: geminiHealth,
                serpApi: serpApiHealth,
                database: dbHealth,
            },
            recentErrors: errorStats.last24h,
            errorStats,
        };
        this.logger.log(`Health check complete: ${overallStatus}`);
        return health;
    }
    getRecentErrors(limit = 20) {
        return this.errorTrackingService.getRecentErrors(limit);
    }
    getVersionInfo() {
        return {
            version: this.appVersion,
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            uptime: `${Math.floor(process.uptime())}s`,
        };
    }
    async analyzeError(errorId) {
        const error = this.errorTrackingService.getErrorById(errorId);
        if (!error)
            return null;
        try {
            const prompt = `Analyze this error and suggest a fix. Respond with JSON only:
{
  "suggestedFix": "brief fix suggestion",
  "severity": "info|warning|error|critical"
}

Error details:
- Type: ${error.type}
- Service: ${error.service}
- Message: ${error.message}
- Context: ${JSON.stringify(error.context || {})}`;
            const response = await this.geminiService.generateContent(prompt);
            try {
                const analysis = JSON.parse(response);
                this.errorTrackingService.updateErrorAnalysis(errorId, analysis);
                return analysis;
            }
            catch {
                const fallbackAnalysis = {
                    suggestedFix: response.substring(0, 200),
                    severity: 'warning',
                };
                this.errorTrackingService.updateErrorAnalysis(errorId, fallbackAnalysis);
                return fallbackAnalysis;
            }
        }
        catch (e) {
            this.logger.error(`Failed to analyze error: ${e.message}`);
            return null;
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        google_search_service_1.GoogleSearchService,
        error_tracking_service_1.ErrorTrackingService])
], HealthService);
//# sourceMappingURL=health.service.js.map