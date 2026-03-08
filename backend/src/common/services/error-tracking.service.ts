import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface ErrorRecord {
    id: string;
    timestamp: Date;
    type: 'API_ERROR' | 'VALIDATION_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'UNKNOWN';
    service: string;
    message: string;
    stack?: string;
    context?: Record<string, any>;
    screenshotPath?: string;
    analysis?: {
        suggestedFix?: string;
        severity: 'info' | 'warning' | 'error' | 'critical';
    };
}

@Injectable()
export class ErrorTrackingService {
    private readonly logger = new Logger(ErrorTrackingService.name);
    private errors: ErrorRecord[] = [];
    private readonly maxErrors = 100; // Keep last 100 errors in memory
    // Cloud Functions have read-only filesystem except /tmp
    private readonly logFilePath = path.join(
        process.env.K_SERVICE ? os.tmpdir() : process.cwd(),
        'error-logs.json'
    );

    constructor() {
        this.loadErrors();
    }

    /**
     * Record a new error with context
     */
    recordError(
        error: Error | string,
        options: {
            type?: ErrorRecord['type'];
            service: string;
            context?: Record<string, any>;
            screenshotPath?: string;
        }
    ): ErrorRecord {
        const errorRecord: ErrorRecord = {
            id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            type: options.type || 'UNKNOWN',
            service: options.service,
            message: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'string' ? undefined : error.stack,
            context: options.context,
            screenshotPath: options.screenshotPath,
        };

        this.logger.warn(`[ERROR TRACKED] Service: ${options.service} - ${errorRecord.message}`);

        this.errors.unshift(errorRecord);

        // Trim to max size
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        this.saveErrors();

        return errorRecord;
    }

    /**
     * Get recent errors
     */
    getRecentErrors(limit: number = 20): ErrorRecord[] {
        return this.errors.slice(0, limit);
    }

    /**
     * Get error by ID
     */
    getErrorById(id: string): ErrorRecord | undefined {
        return this.errors.find(e => e.id === id);
    }

    /**
     * Get error statistics
     */
    getStats(): {
        total: number;
        byService: Record<string, number>;
        byType: Record<string, number>;
        last24h: number;
    } {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const byService: Record<string, number> = {};
        const byType: Record<string, number> = {};
        let last24h = 0;

        for (const err of this.errors) {
            byService[err.service] = (byService[err.service] || 0) + 1;
            byType[err.type] = (byType[err.type] || 0) + 1;

            if (new Date(err.timestamp) > oneDayAgo) {
                last24h++;
            }
        }

        return {
            total: this.errors.length,
            byService,
            byType,
            last24h,
        };
    }

    /**
     * Update error with analysis
     */
    updateErrorAnalysis(
        errorId: string,
        analysis: ErrorRecord['analysis']
    ): boolean {
        const error = this.getErrorById(errorId);
        if (error) {
            error.analysis = analysis;
            this.saveErrors();
            return true;
        }
        return false;
    }

    /**
     * Clear all errors
     */
    clearErrors(): void {
        this.errors = [];
        this.saveErrors();
    }

    private loadErrors(): void {
        try {
            if (fs.existsSync(this.logFilePath)) {
                const data = fs.readFileSync(this.logFilePath, 'utf-8');
                this.errors = JSON.parse(data);
                this.logger.log(`Loaded ${this.errors.length} error records from disk`);
            }
        } catch (e) {
            this.logger.warn(`Could not load error logs: ${e.message}`);
            this.errors = [];
        }
    }

    private saveErrors(): void {
        try {
            fs.writeFileSync(this.logFilePath, JSON.stringify(this.errors, null, 2));
        } catch (e) {
            this.logger.error(`Could not save error logs: ${e.message}`);
        }
    }
}
