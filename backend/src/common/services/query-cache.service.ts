import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const CACHE_TTL_DAYS = 30;

export interface CachedSearchResult {
    title: string;
    link: string;
    snippet: string;
}

@Injectable()
export class QueryCacheService {
    private readonly logger = new Logger(QueryCacheService.name);
    private readonly prisma = new PrismaClient();

    /**
     * Normalize query and generate a consistent hash.
     */
    private hashQuery(query: string): string {
        const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
        return crypto.createHash('sha256').update(normalized).digest('hex');
    }

    /**
     * Check if a cached entry has expired.
     */
    isExpired(expiresAt: Date): boolean {
        return new Date() > expiresAt;
    }

    /**
     * Get cached results for a query if they exist and are not expired.
     */
    async getCachedResults(query: string): Promise<CachedSearchResult[] | null> {
        const hash = this.hashQuery(query);

        const cached = await this.prisma.searchQueryCache.findUnique({
            where: { queryHash: hash }
        });

        if (!cached) {
            this.logger.debug(`Cache MISS for query: "${query.substring(0, 30)}..."`);
            return null;
        }

        if (this.isExpired(cached.expiresAt)) {
            this.logger.debug(`Cache STALE for query: "${query.substring(0, 30)}..." (expired ${cached.expiresAt.toISOString()})`);
            // Optionally delete stale entry
            await this.prisma.searchQueryCache.delete({ where: { id: cached.id } });
            return null;
        }

        this.logger.log(`Cache HIT for query: "${query.substring(0, 30)}..." (${JSON.parse(cached.results).length} results)`);
        return JSON.parse(cached.results) as CachedSearchResult[];
    }

    /**
     * Cache the results of a query with a 30-day expiry.
     */
    async cacheResults(query: string, results: CachedSearchResult[]): Promise<void> {
        const hash = this.hashQuery(query);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

        await this.prisma.searchQueryCache.upsert({
            where: { queryHash: hash },
            update: {
                results: JSON.stringify(results),
                expiresAt: expiresAt,
                createdAt: new Date() // Reset timestamp on refresh
            },
            create: {
                queryHash: hash,
                queryText: query,
                results: JSON.stringify(results),
                expiresAt: expiresAt
            }
        });

        this.logger.log(`Cached ${results.length} results for query: "${query.substring(0, 30)}..." (expires ${expiresAt.toISOString()})`);
    }

    /**
     * Get cache statistics (for monitoring/debugging).
     */
    async getStats(): Promise<{ total: number; expired: number }> {
        const total = await this.prisma.searchQueryCache.count();
        const expired = await this.prisma.searchQueryCache.count({
            where: { expiresAt: { lt: new Date() } }
        });
        return { total, expired };
    }
}
