import { Module, Global } from '@nestjs/common';
import { PostHogService } from './posthog.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [PostHogService],
    exports: [PostHogService],
})
export class PostHogModule { }
