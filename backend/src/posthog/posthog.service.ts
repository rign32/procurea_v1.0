import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PostHog } from 'posthog-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostHogService implements OnModuleInit, OnModuleDestroy {
    public client: PostHog;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const apiKey = this.configService.get<string>('POSTHOG_API_KEY');
        const host = this.configService.get<string>('POSTHOG_HOST');

        if (apiKey) {
            this.client = new PostHog(apiKey, { host });
        } else {
            console.warn('POSTHOG_API_KEY NOT FOUND - PostHog will not be initialized');
        }
    }

    async isFeatureEnabled(featureKey: string, distinctId: string): Promise<boolean | undefined> {
        if (!this.client) return false;
        return await this.client.isFeatureEnabled(featureKey, distinctId);
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.shutdown();
        }
    }
}
