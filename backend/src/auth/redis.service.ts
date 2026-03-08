import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis | null = null;
    private isEnabled: boolean = false;

    constructor(private configService: ConfigService) {
        this.initializeRedis();
    }

    private initializeRedis() {
        const redisUrl = this.configService.get<string>('REDIS_URL');

        if (!redisUrl) {
            this.logger.warn(
                'REDIS_URL not configured. Redis features disabled. ' +
                'OAuth state and exchange tokens will use in-memory fallback (not suitable for production).'
            );
            this.isEnabled = false;
            return;
        }

        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
            });

            this.client.on('connect', () => {
                this.logger.log('Redis connected successfully');
                this.isEnabled = true;
            });

            this.client.on('error', (error) => {
                this.logger.error('Redis connection error:', error);
                this.isEnabled = false;
            });
        } catch (error) {
            this.logger.error('Failed to initialize Redis:', error);
            this.isEnabled = false;
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }

    /**
     * Store OAuth state with associated user info
     * @param state - OAuth state parameter
     * @param data - Data to associate with state (e.g., authMode)
     * @param ttlSeconds - Time to live in seconds (default: 600 = 10 minutes)
     */
    async setOAuthState(state: string, data: any, ttlSeconds: number = 600): Promise<void> {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, OAuth state not persisted');
            return;
        }

        const key = `oauth:state:${state}`;
        await this.client.setex(key, ttlSeconds, JSON.stringify(data));
        this.logger.debug(`OAuth state stored: ${state} (TTL: ${ttlSeconds}s)`);
    }

    /**
     * Retrieve and delete OAuth state (one-time use)
     * @param state - OAuth state parameter
     * @returns Associated data or null if not found
     */
    async getAndDeleteOAuthState(state: string): Promise<any | null> {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, cannot retrieve OAuth state');
            return null;
        }

        const key = `oauth:state:${state}`;
        const data = await this.client.get(key);

        if (!data) {
            return null;
        }

        // Delete after retrieval (one-time use)
        await this.client.del(key);
        this.logger.debug(`OAuth state retrieved and deleted: ${state}`);

        return JSON.parse(data);
    }

    /**
     * Store exchange token for OAuth callback
     * @param exchangeToken - Short-lived exchange token
     * @param userId - User ID to associate with token
     * @param ttlSeconds - Time to live in seconds (default: 30)
     */
    async setExchangeToken(exchangeToken: string, userId: string, ttlSeconds: number = 30): Promise<void> {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, exchange token not persisted');
            return;
        }

        const key = `auth:exchange:${exchangeToken}`;
        await this.client.setex(key, ttlSeconds, userId);
        this.logger.debug(`Exchange token stored: ${exchangeToken} (TTL: ${ttlSeconds}s)`);
    }

    /**
     * Retrieve and delete exchange token (one-time use)
     * @param exchangeToken - Exchange token
     * @returns User ID or null if not found/expired
     */
    async getAndDeleteExchangeToken(exchangeToken: string): Promise<string | null> {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, cannot retrieve exchange token');
            return null;
        }

        const key = `auth:exchange:${exchangeToken}`;
        const userId = await this.client.get(key);

        if (!userId) {
            return null;
        }

        // Delete after retrieval (one-time use)
        await this.client.del(key);
        this.logger.debug(`Exchange token retrieved and deleted: ${exchangeToken}`);

        return userId;
    }

    /**
     * Blacklist an access token (for logout)
     * @param token - JWT access token
     * @param ttlSeconds - Time to live (should match token expiry)
     */
    async blacklistAccessToken(token: string, ttlSeconds: number): Promise<void> {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, token not blacklisted');
            return;
        }

        const key = `auth:blacklist:${token}`;
        await this.client.setex(key, ttlSeconds, '1');
        this.logger.debug(`Access token blacklisted (TTL: ${ttlSeconds}s)`);
    }

    /**
     * Check if an access token is blacklisted
     * @param token - JWT access token
     * @returns true if blacklisted, false otherwise
     */
    async isTokenBlacklisted(token: string): Promise<boolean> {
        if (!this.isEnabled || !this.client) {
            return false; // If Redis unavailable, don't block requests
        }

        const key = `auth:blacklist:${token}`;
        const exists = await this.client.exists(key);
        return exists === 1;
    }

    /**
     * Check if Redis is available
     */
    isAvailable(): boolean {
        return this.isEnabled && this.client !== null;
    }

    // In-memory fallback for magic codes and attempt counters
    private magicCodes = new Map<string, { code: string; userId: string; expiresAt: number }>();
    private verifyAttempts = new Map<string, { count: number; blockedUntil: number }>();

    private readonly MAX_VERIFY_ATTEMPTS = 5;
    private readonly BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

    /**
     * Store email magic code for verification
     * @param email - User's email address
     * @param code - 6-digit magic code
     * @param userId - User ID to associate with code
     * @param ttlSeconds - Time to live in seconds (default: 600 = 10 minutes)
     */
    async setMagicCode(email: string, code: string, userId: string, ttlSeconds: number = 600): Promise<void> {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, using in-memory fallback for magic code');
            this.magicCodes.set(email.toLowerCase(), {
                code,
                userId,
                expiresAt: Date.now() + ttlSeconds * 1000
            });
            return;
        }

        const key = `auth:magic:${email.toLowerCase()}`;
        const data = JSON.stringify({ code, userId, createdAt: Date.now() });
        await this.client.setex(key, ttlSeconds, data);
        this.logger.debug(`Magic code stored for ${email} (TTL: ${ttlSeconds}s)`);
    }

    /**
     * Verify and consume magic code (one-time use)
     * @param email - User's email address
     * @param code - Code to verify
     * @returns User ID if valid, null otherwise
     */
    /**
     * Check if verification attempts are blocked for this email
     */
    private isBlocked(email: string): boolean {
        const attemptKey = email.toLowerCase();

        if (this.verifyAttempts.has(attemptKey)) {
            const entry = this.verifyAttempts.get(attemptKey)!;
            if (entry.blockedUntil > Date.now()) {
                return true;
            }
            if (entry.blockedUntil > 0 && Date.now() > entry.blockedUntil) {
                this.verifyAttempts.delete(attemptKey);
            }
        }
        return false;
    }

    /**
     * Record a failed verification attempt
     */
    private recordFailedAttempt(email: string): void {
        const attemptKey = email.toLowerCase();
        const entry = this.verifyAttempts.get(attemptKey) || { count: 0, blockedUntil: 0 };
        entry.count++;

        if (entry.count >= this.MAX_VERIFY_ATTEMPTS) {
            entry.blockedUntil = Date.now() + this.BLOCK_DURATION_MS;
            this.logger.warn(`Verification blocked for ${email} after ${entry.count} failed attempts`);
        }

        this.verifyAttempts.set(attemptKey, entry);
    }

    async verifyAndDeleteMagicCode(email: string, code: string): Promise<string | null> {
        // Brute-force protection: block after MAX_VERIFY_ATTEMPTS
        if (this.isBlocked(email)) {
            this.logger.warn(`Verification attempt blocked for ${email} (too many failed attempts)`);
            return null;
        }

        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, checking in-memory magic code');
            const entry = this.magicCodes.get(email.toLowerCase());

            if (!entry) {
                this.logger.debug(`Magic code not found (in-memory) for ${email}`);
                return null;
            }

            if (Date.now() > entry.expiresAt) {
                this.logger.debug(`Magic code expired (in-memory) for ${email}`);
                this.magicCodes.delete(email.toLowerCase());
                return null;
            }

            if (entry.code !== code) {
                this.recordFailedAttempt(email);
                this.logger.debug(`Magic code mismatch (in-memory) for ${email}`);
                return null;
            }

            this.magicCodes.delete(email.toLowerCase());
            this.verifyAttempts.delete(email.toLowerCase());
            this.logger.debug(`Magic code verified and deleted (in-memory) for ${email}`);
            return entry.userId;
        }

        const key = `auth:magic:${email.toLowerCase()}`;
        const data = await this.client.get(key);

        if (!data) {
            this.logger.debug(`Magic code not found for ${email}`);
            return null;
        }

        const parsed = JSON.parse(data);

        if (parsed.code !== code) {
            this.recordFailedAttempt(email);
            this.logger.debug(`Magic code mismatch for ${email}`);
            return null;
        }

        // Delete after successful verification (one-time use)
        await this.client.del(key);
        this.verifyAttempts.delete(email.toLowerCase());
        this.logger.debug(`Magic code verified and deleted for ${email}`);

        return parsed.userId;
    }
}
