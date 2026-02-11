"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var QueryCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryCacheService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const CACHE_TTL_DAYS = 30;
let QueryCacheService = QueryCacheService_1 = class QueryCacheService {
    logger = new common_1.Logger(QueryCacheService_1.name);
    prisma = new client_1.PrismaClient();
    hashQuery(query) {
        const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
        return crypto.createHash('sha256').update(normalized).digest('hex');
    }
    isExpired(expiresAt) {
        return new Date() > expiresAt;
    }
    async getCachedResults(query) {
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
            await this.prisma.searchQueryCache.delete({ where: { id: cached.id } });
            return null;
        }
        this.logger.log(`Cache HIT for query: "${query.substring(0, 30)}..." (${JSON.parse(cached.results).length} results)`);
        return JSON.parse(cached.results);
    }
    async cacheResults(query, results) {
        const hash = this.hashQuery(query);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);
        await this.prisma.searchQueryCache.upsert({
            where: { queryHash: hash },
            update: {
                results: JSON.stringify(results),
                expiresAt: expiresAt,
                createdAt: new Date()
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
    async getStats() {
        const total = await this.prisma.searchQueryCache.count();
        const expired = await this.prisma.searchQueryCache.count({
            where: { expiresAt: { lt: new Date() } }
        });
        return { total, expired };
    }
};
exports.QueryCacheService = QueryCacheService;
exports.QueryCacheService = QueryCacheService = QueryCacheService_1 = __decorate([
    (0, common_1.Injectable)()
], QueryCacheService);
//# sourceMappingURL=query-cache.service.js.map