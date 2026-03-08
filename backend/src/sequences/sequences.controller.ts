import { Controller, Get, Post, Body, Param, Patch, Delete, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequenceSchedulerService } from './sequence-scheduler.service';

@Controller('sequences')
export class SequencesController {
    private readonly logger = new Logger(SequencesController.name);

    constructor(
        private readonly sequencesService: SequencesService,
        private readonly sequenceSchedulerService: SequenceSchedulerService,
    ) { }

    @Get()
    findAll() {
        return this.sequencesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sequencesService.findOne(id);
    }

    @Post()
    create(@Body('name') name: string) {
        return this.sequencesService.create(name);
    }

    @Delete(':id')
    deleteTemplate(@Param('id') id: string) {
        return this.sequencesService.deleteTemplate(id);
    }

    @Post(':id/clone')
    cloneTemplate(@Param('id') id: string, @Body('name') name: string) {
        return this.sequencesService.cloneTemplate(id, name);
    }

    @Post(':id/steps')
    addStep(
        @Param('id') templateId: string,
        @Body() body: { dayOffset: number; type: string; subject: string; bodySnippet: string },
    ) {
        return this.sequencesService.addStep(templateId, body);
    }

    @Patch('steps/:id')
    updateStep(@Param('id') id: string, @Body() body: { subject?: string; body?: string }) {
        return this.sequencesService.updateStep(id, body);
    }

    @Delete('steps/:id')
    deleteStep(@Param('id') id: string) {
        return this.sequencesService.deleteStep(id);
    }
}

/**
 * Internal controller for Cloud Scheduler cron triggers.
 * Protected by X-Cron-Secret header — not exposed to regular users.
 */
@Controller('internal/cron')
export class CronController {
    private readonly logger = new Logger(CronController.name);

    constructor(private readonly schedulerService: SequenceSchedulerService) { }

    @Post('sequences')
    async triggerSequenceProcessing(@Headers('x-cron-secret') secret: string) {
        const expected = process.env.CRON_SECRET;
        if (!expected || secret !== expected) {
            throw new UnauthorizedException('Invalid cron secret');
        }

        this.logger.log('[CRON] Cloud Scheduler triggered sequence processing');
        await this.schedulerService.processSequences();
        return { ok: true, timestamp: new Date().toISOString() };
    }
}
