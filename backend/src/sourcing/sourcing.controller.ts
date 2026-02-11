import { Controller, Post, Body, Get, Param, Patch, Query } from '@nestjs/common';
import { SourcingService } from './sourcing.service';

export interface CreateCampaignDto {
    name: string;
    searchCriteria: {
        region: string;
        industry?: string;
        category?: string;
        material?: string;
        eau?: number;
        quantity?: number;
        keywords?: string[];
        description?: string;
        deliveryLocationId?: string;
    };
}

@Controller('campaigns')
export class SourcingController {
    constructor(private readonly sourcingService: SourcingService) { }

    @Post()
    create(@Body() createCampaignDto: CreateCampaignDto) {
        return this.sourcingService.create(createCampaignDto);
    }

    @Get()
    findAll() {
        return this.sourcingService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sourcingService.findOne(id);
    }

    @Get(':id/logs')
    async getLogs(@Param('id') id: string, @Query('since') since?: string) {
        return this.sourcingService.getLogs(id, since);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.sourcingService.updateStatus(id, status);
    }
}
