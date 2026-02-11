import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuthLogEntry {
    id?: string;
    timestamp: Date;
    requestId: string;
    action: string;
    provider?: string;
    userId?: string;
    email?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: any;
}

@Injectable()
export class AuthLogsService {
    private logs: AuthLogEntry[] = [];
    private maxLogs = 1000; // Keep last 1000 logs in memory

    constructor(private prisma: PrismaService) {}

    async logAuthEvent(entry: Omit<AuthLogEntry, 'id' | 'timestamp'>) {
        const logEntry: AuthLogEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            ...entry
        };

        // Add to in-memory array
        this.logs.unshift(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        // Optionally save to database for persistence
        // await this.prisma.authLog.create({ data: logEntry });

        console.log('[AUTH LOG]', JSON.stringify(logEntry, null, 2));

        return logEntry;
    }

    getRecentLogs(limit: number = 50, filters?: { userId?: string; action?: string; requestId?: string }) {
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

    getLogsByRequestId(requestId: string) {
        return this.logs.filter(log => log.requestId === requestId);
    }

    async getOAuthFlow(requestId: string) {
        const logs = this.getLogsByRequestId(requestId);
        return {
            requestId,
            totalSteps: logs.length,
            success: logs.every(log => log.success),
            steps: logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
            errors: logs.filter(log => !log.success)
        };
    }
}
