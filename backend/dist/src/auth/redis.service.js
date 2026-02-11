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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    client = null;
    isEnabled = false;
    constructor(configService) {
        this.configService = configService;
        this.initializeRedis();
    }
    initializeRedis() {
        const redisUrl = this.configService.get('REDIS_URL');
        if (!redisUrl) {
            this.logger.warn('REDIS_URL not configured. Redis features disabled. ' +
                'OAuth state and exchange tokens will use in-memory fallback (not suitable for production).');
            this.isEnabled = false;
            return;
        }
        try {
            this.client = new ioredis_1.default(redisUrl, {
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
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis:', error);
            this.isEnabled = false;
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
    async setOAuthState(state, data, ttlSeconds = 600) {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, OAuth state not persisted');
            return;
        }
        const key = `oauth:state:${state}`;
        await this.client.setex(key, ttlSeconds, JSON.stringify(data));
        this.logger.debug(`OAuth state stored: ${state} (TTL: ${ttlSeconds}s)`);
    }
    async getAndDeleteOAuthState(state) {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, cannot retrieve OAuth state');
            return null;
        }
        const key = `oauth:state:${state}`;
        const data = await this.client.get(key);
        if (!data) {
            return null;
        }
        await this.client.del(key);
        this.logger.debug(`OAuth state retrieved and deleted: ${state}`);
        return JSON.parse(data);
    }
    async setExchangeToken(exchangeToken, userId, ttlSeconds = 30) {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, exchange token not persisted');
            return;
        }
        const key = `auth:exchange:${exchangeToken}`;
        await this.client.setex(key, ttlSeconds, userId);
        this.logger.debug(`Exchange token stored: ${exchangeToken} (TTL: ${ttlSeconds}s)`);
    }
    async getAndDeleteExchangeToken(exchangeToken) {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, cannot retrieve exchange token');
            return null;
        }
        const key = `auth:exchange:${exchangeToken}`;
        const userId = await this.client.get(key);
        if (!userId) {
            return null;
        }
        await this.client.del(key);
        this.logger.debug(`Exchange token retrieved and deleted: ${exchangeToken}`);
        return userId;
    }
    async blacklistAccessToken(token, ttlSeconds) {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, token not blacklisted');
            return;
        }
        const key = `auth:blacklist:${token}`;
        await this.client.setex(key, ttlSeconds, '1');
        this.logger.debug(`Access token blacklisted (TTL: ${ttlSeconds}s)`);
    }
    async isTokenBlacklisted(token) {
        if (!this.isEnabled || !this.client) {
            return false;
        }
        const key = `auth:blacklist:${token}`;
        const exists = await this.client.exists(key);
        return exists === 1;
    }
    isAvailable() {
        return this.isEnabled && this.client !== null;
    }
    async setMagicCode(email, code, userId, ttlSeconds = 600) {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, magic code not persisted');
            return;
        }
        const key = `auth:magic:${email.toLowerCase()}`;
        const data = JSON.stringify({ code, userId, createdAt: Date.now() });
        await this.client.setex(key, ttlSeconds, data);
        this.logger.debug(`Magic code stored for ${email} (TTL: ${ttlSeconds}s)`);
    }
    async verifyAndDeleteMagicCode(email, code) {
        if (!this.isEnabled || !this.client) {
            this.logger.warn('Redis not available, cannot verify magic code');
            return null;
        }
        const key = `auth:magic:${email.toLowerCase()}`;
        const data = await this.client.get(key);
        if (!data) {
            this.logger.debug(`Magic code not found for ${email}`);
            return null;
        }
        const parsed = JSON.parse(data);
        if (parsed.code !== code) {
            this.logger.debug(`Magic code mismatch for ${email}`);
            return null;
        }
        await this.client.del(key);
        this.logger.debug(`Magic code verified and deleted for ${email}`);
        return parsed.userId;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map