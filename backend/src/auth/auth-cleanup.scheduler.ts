import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthService } from './auth.service';

/**
 * Daily cleanup of stale unverified-email users.
 * See AuthService.cleanupUnverifiedUsers for rationale.
 */
@Injectable()
export class AuthCleanupScheduler {
    private readonly logger = new Logger(AuthCleanupScheduler.name);

    constructor(private readonly authService: AuthService) {}

    // 03:15 UTC daily — off-peak for EU traffic, stagger with other cleanups
    // (demo-session cleanup runs at 03:00 UTC via separate cron endpoint).
    @Cron('15 3 * * *')
    async runDailyCleanup(): Promise<void> {
        try {
            const result = await this.authService.cleanupUnverifiedUsers();
            if (result.deleted > 0) {
                this.logger.log(`Unverified user cleanup: deleted ${result.deleted} user(s)`);
            }
        } catch (err) {
            this.logger.error('Unverified user cleanup failed', err instanceof Error ? err.stack : err);
        }
    }
}
