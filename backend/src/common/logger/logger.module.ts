import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { AuthLogsService } from './auth-logs.service';
import { LogsController } from './logs.controller';

@Global()
@Module({
    controllers: [LogsController],
    providers: [LoggerService, AuthLogsService],
    exports: [LoggerService, AuthLogsService],
})
export class LoggerModule {}
