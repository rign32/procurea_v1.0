import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class TokensService {
    private jwtService;
    private prisma;
    private configService;
    private readonly logger;
    private readonly ACCESS_TOKEN_EXPIRY;
    private readonly REFRESH_TOKEN_EXPIRY_DAYS;
    private readonly jwtSecret;
    constructor(jwtService: JwtService, prisma: PrismaService, configService: ConfigService);
    generateAccessToken(userId: string, email: string, role: string): string;
    generateRefreshToken(userId: string): Promise<string>;
    validateRefreshToken(token: string): Promise<string>;
    rotateRefreshToken(oldToken: string, userId: string): Promise<string>;
    revokeAllRefreshTokens(userId: string): Promise<number>;
    revokeRefreshToken(token: string): Promise<boolean>;
    cleanupExpiredTokens(): Promise<number>;
    getRefreshTokenExpirySeconds(): number;
    getAccessTokenExpirySeconds(): number;
}
