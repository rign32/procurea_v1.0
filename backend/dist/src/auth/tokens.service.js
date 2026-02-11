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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokensService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let TokensService = TokensService_1 = class TokensService {
    jwtService;
    prisma;
    configService;
    logger = new common_1.Logger(TokensService_1.name);
    ACCESS_TOKEN_EXPIRY = '8h';
    REFRESH_TOKEN_EXPIRY_DAYS = 30;
    jwtSecret;
    constructor(jwtService, prisma, configService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.configService = configService;
        const secret = this.configService.get('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is required in environment variables. Generate one with: openssl rand -base64 64');
        }
        this.jwtSecret = secret;
    }
    generateAccessToken(userId, email, role) {
        const payload = {
            sub: userId,
            email,
            role,
            type: 'access',
        };
        return this.jwtService.sign(payload, {
            secret: this.jwtSecret,
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
        });
    }
    async generateRefreshToken(userId) {
        const token = crypto.randomBytes(32).toString('base64url');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);
        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
        this.logger.debug(`Refresh token generated for user ${userId}, expires at ${expiresAt.toISOString()}`);
        return token;
    }
    async validateRefreshToken(token) {
        const refreshToken = await this.prisma.refreshToken.findUnique({
            where: { token },
        });
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (refreshToken.revoked) {
            this.logger.warn(`Attempt to use revoked refresh token: ${token.substring(0, 10)}...`);
            throw new common_1.UnauthorizedException('Refresh token has been revoked');
        }
        if (refreshToken.expiresAt < new Date()) {
            this.logger.warn(`Attempt to use expired refresh token: ${token.substring(0, 10)}...`);
            await this.prisma.refreshToken.delete({ where: { id: refreshToken.id } });
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        return refreshToken.userId;
    }
    async rotateRefreshToken(oldToken, userId) {
        await this.prisma.refreshToken.updateMany({
            where: { token: oldToken },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });
        this.logger.debug(`Refresh token rotated for user ${userId}`);
        return this.generateRefreshToken(userId);
    }
    async revokeAllRefreshTokens(userId) {
        const result = await this.prisma.refreshToken.updateMany({
            where: {
                userId,
                revoked: false,
            },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });
        this.logger.log(`Revoked ${result.count} refresh tokens for user ${userId}`);
        return result.count;
    }
    async revokeRefreshToken(token) {
        const result = await this.prisma.refreshToken.updateMany({
            where: { token },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });
        return result.count > 0;
    }
    async cleanupExpiredTokens() {
        const result = await this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        if (result.count > 0) {
            this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);
        }
        return result.count;
    }
    getRefreshTokenExpirySeconds() {
        return this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
    }
    getAccessTokenExpirySeconds() {
        return 15 * 60;
    }
};
exports.TokensService = TokensService;
exports.TokensService = TokensService = TokensService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], TokensService);
//# sourceMappingURL=tokens.service.js.map