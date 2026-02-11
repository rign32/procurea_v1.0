import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PostHog } from 'posthog-node';
import { ConfigService } from '@nestjs/config';
export declare class PostHogService implements OnModuleInit, OnModuleDestroy {
    private configService;
    client: PostHog;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    isFeatureEnabled(featureKey: string, distinctId: string): Promise<boolean | undefined>;
    onModuleDestroy(): Promise<void>;
}
