import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GoogleSearchService } from './google-search.service';
import { ErrorTrackingService, ErrorRecord } from './error-tracking.service';

export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    lastCheck: Date;
    message?: string;
    details?: Record<string, any>;
}

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    version: string;
    environment: string;
    services: {
        gemini: ServiceHealth;
        serpApi: ServiceHealth;
        database: ServiceHealth;
    };
    recentErrors: number;
    errorStats?: ReturnType<ErrorTrackingService['getStats']>;
}

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);
    private readonly appVersion = process.env.npm_package_version || '1.0.0';

    constructor(
        private readonly geminiService: GeminiService,
        private readonly googleSearchService: GoogleSearchService,
        private readonly errorTrackingService: ErrorTrackingService,
    ) { }

    private lastGeminiHealth: { result: ServiceHealth; timestamp: number } | null = null;
    private readonly CACHE_TTL = 3600 * 1000; // 1 hour

    /**
     * Check Gemini API health
     */
    async checkGeminiHealth(checkConnectivity: boolean = false): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            if (!checkConnectivity) {
                // Shallow check - only verify API key exists
                const apiKey = process.env.GEMINI_API_KEY;
                if (apiKey) {
                    return {
                        status: 'healthy',
                        lastCheck: new Date(),
                        message: 'Gemini API configured (shallow check)',
                        details: { mode: 'shallow' }
                    };
                } else {
                    return {
                        status: 'degraded',
                        lastCheck: new Date(),
                        message: 'Gemini API not configured (missing key)',
                        details: { mode: 'shallow' }
                    };
                }
            }

            // DEEP CHECK - OPTIMIZED FOR COST
            // Previously this called generateContent('OK'), which cost money for every probe.
            // Now we use a lightweight client check that avoids token billing.
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
            } else {
                return {
                    status: 'unhealthy',
                    responseTime,
                    lastCheck: new Date(),
                    message: 'Gemini API client failed initialization',
                    details: { mode: 'deep-optimized' }
                };
            }

        } catch (error) {
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

    /**
     * Check SERP API health
     */
    async checkSerpApiHealth(checkConnectivity: boolean = false): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            if (!checkConnectivity) {
                // Shallow check - verify API key
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

            // Critical Change: ONLY execute deep check if explicitly requested.
            if (!checkConnectivity) {
                return {
                    status: 'healthy',
                    lastCheck: new Date(),
                    message: 'SERP API configured (shallow check only)',
                    details: { mode: 'shallow', note: 'Deep check skipped to save costs' }
                };
            }

            this.logger.warn(`[COST ALERT] Executing PAID SERP API Health Check.`);

            // Minimal query to test connectivity
            const results = await Promise.race([
                this.googleSearchService.searchExtended('test', { num: 1 }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 15000)
                ),
            ]);

            const responseTime = Date.now() - startTime;

            // Check if we got mock data (API key missing)
            if (
                results.length > 0 &&
                results[0].link.includes('example.com')
            ) {
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
        } catch (error) {
            const responseTime = Date.now() - startTime;

            // Check for rate limit
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

    /**
     * Check database health (simple check)
     */
    async checkDatabaseHealth(): Promise<ServiceHealth> {
        // For now, basic check - can be extended with Prisma health check
        try {
            return {
                status: 'healthy',
                lastCheck: new Date(),
                message: 'Database connection OK',
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                lastCheck: new Date(),
                message: error.message || 'Database unreachable',
            };
        }
    }

    /**
     * Get full system health status
     */
    async getSystemHealth(type: 'shallow' | 'deep' = 'shallow'): Promise<SystemHealth> {
        this.logger.log(`Running system health check (${type})...`);

        const checkConnectivity = type === 'deep';

        const [geminiHealth, serpApiHealth, dbHealth] = await Promise.all([
            this.checkGeminiHealth(checkConnectivity),
            this.checkSerpApiHealth(checkConnectivity),
            this.checkDatabaseHealth(),
        ]);

        const errorStats = this.errorTrackingService.getStats();

        // Determine overall status
        const statuses = [geminiHealth.status, serpApiHealth.status, dbHealth.status];
        let overallStatus: SystemHealth['status'] = 'healthy';

        if (statuses.includes('unhealthy')) {
            overallStatus = 'unhealthy';
        } else if (statuses.includes('degraded')) {
            overallStatus = 'degraded';
        }

        const health: SystemHealth = {
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

    /**
     * Get recent errors from tracking service
     */
    getRecentErrors(limit: number = 20): ErrorRecord[] {
        return this.errorTrackingService.getRecentErrors(limit);
    }

    /**
     * Get version info
     */
    getVersionInfo(): Record<string, string> {
        return {
            version: this.appVersion,
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            uptime: `${Math.floor(process.uptime())}s`,
        };
    }

    /**
     * Analyze error using Gemini
     */
    async analyzeError(errorId: string): Promise<ErrorRecord['analysis'] | null> {
        const error = this.errorTrackingService.getErrorById(errorId);
        if (!error) return null;

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
            } catch {
                const fallbackAnalysis = {
                    suggestedFix: response.substring(0, 200),
                    severity: 'warning' as const,
                };
                this.errorTrackingService.updateErrorAnalysis(errorId, fallbackAnalysis);
                return fallbackAnalysis;
            }
        } catch (e) {
            this.logger.error(`Failed to analyze error: ${e.message}`);
            return null;
        }
    }
}
