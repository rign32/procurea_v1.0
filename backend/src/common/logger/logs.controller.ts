import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthLogsService } from './auth-logs.service';

@Controller('logs')
export class LogsController {
    constructor(private authLogsService: AuthLogsService) {}

    @Get('auth')
    getAuthLogs(
        @Query('limit') limit?: string,
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('requestId') requestId?: string
    ) {
        const filters = { userId, action, requestId };
        return this.authLogsService.getRecentLogs(
            limit ? parseInt(limit) : 50,
            filters
        );
    }

    @Get('auth/flow')
    getOAuthFlow(@Query('requestId') requestId: string) {
        if (!requestId) {
            return { error: 'requestId query parameter is required' };
        }
        return this.authLogsService.getOAuthFlow(requestId);
    }
}
