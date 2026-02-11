import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleDestroy {
    private configService;
    private readonly logger;
    private client;
    private isEnabled;
    constructor(configService: ConfigService);
    private initializeRedis;
    onModuleDestroy(): Promise<void>;
    setOAuthState(state: string, data: any, ttlSeconds?: number): Promise<void>;
    getAndDeleteOAuthState(state: string): Promise<any | null>;
    setExchangeToken(exchangeToken: string, userId: string, ttlSeconds?: number): Promise<void>;
    getAndDeleteExchangeToken(exchangeToken: string): Promise<string | null>;
    blacklistAccessToken(token: string, ttlSeconds: number): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
    isAvailable(): boolean;
    setMagicCode(email: string, code: string, userId: string, ttlSeconds?: number): Promise<void>;
    verifyAndDeleteMagicCode(email: string, code: string): Promise<string | null>;
}
