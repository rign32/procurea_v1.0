import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TokensService {
    private readonly logger = new Logger(TokensService.name);
    private readonly ACCESS_TOKEN_EXPIRY = '8h'; // 8 hours - extended for better UX during work sessions
    private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 days
    private readonly jwtSecret: string;

    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error(
                'JWT_SECRET is required in environment variables. Generate one with: openssl rand -base64 64'
            );
        }
        this.jwtSecret = secret;
    }

    /**
     * Generate access token (short-lived)
     * @param userId - User ID
     * @param email - User email
     * @param role - User role
     * @returns JWT access token
     */
    generateAccessToken(userId: string, email: string, role: string): string {
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

    /**
     * Generate refresh token (long-lived) and store in database
     * @param userId - User ID
     * @returns Refresh token string
     */
    async generateRefreshToken(userId: string): Promise<string> {
        // Generate cryptographically secure random token
        const token = crypto.randomBytes(32).toString('base64url');

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

        // Store in database
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

    /**
     * Validate refresh token and return user ID
     * @param token - Refresh token
     * @returns User ID if valid
     * @throws UnauthorizedException if invalid
     */
    async validateRefreshToken(token: string): Promise<string> {
        const refreshToken = await this.prisma.refreshToken.findUnique({
            where: { token },
        });

        if (!refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (refreshToken.revoked) {
            this.logger.warn(`Attempt to use revoked refresh token: ${token.substring(0, 10)}...`);
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (refreshToken.expiresAt < new Date()) {
            this.logger.warn(`Attempt to use expired refresh token: ${token.substring(0, 10)}...`);
            // Clean up expired token
            await this.prisma.refreshToken.delete({ where: { id: refreshToken.id } });
            throw new UnauthorizedException('Refresh token has expired');
        }

        return refreshToken.userId;
    }

    /**
     * Rotate refresh token (invalidate old, create new)
     * @param oldToken - Old refresh token
     * @param userId - User ID
     * @returns New refresh token
     */
    async rotateRefreshToken(oldToken: string, userId: string): Promise<string> {
        // Revoke old token
        await this.prisma.refreshToken.updateMany({
            where: { token: oldToken },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });

        this.logger.debug(`Refresh token rotated for user ${userId}`);

        // Generate new token
        return this.generateRefreshToken(userId);
    }

    /**
     * Revoke all refresh tokens for a user (logout from all devices)
     * @param userId - User ID
     * @returns Number of tokens revoked
     */
    async revokeAllRefreshTokens(userId: string): Promise<number> {
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

    /**
     * Revoke single refresh token
     * @param token - Refresh token
     * @returns Success boolean
     */
    async revokeRefreshToken(token: string): Promise<boolean> {
        const result = await this.prisma.refreshToken.updateMany({
            where: { token },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });

        return result.count > 0;
    }

    /**
     * Clean up expired refresh tokens (call periodically)
     * @returns Number of tokens deleted
     */
    async cleanupExpiredTokens(): Promise<number> {
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

    /**
     * Get refresh token expiry in seconds (for cookie maxAge)
     */
    getRefreshTokenExpirySeconds(): number {
        return this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
    }

    /**
     * Get access token expiry in seconds (for cookie maxAge)
     */
    getAccessTokenExpirySeconds(): number {
        return 8 * 60 * 60; // 8 hours - matches ACCESS_TOKEN_EXPIRY
    }
}
