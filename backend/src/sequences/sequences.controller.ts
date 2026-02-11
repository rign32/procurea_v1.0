import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { SequencesService } from './sequences.service';

@Controller('sequences')
export class SequencesController {
    constructor(private readonly sequencesService: SequencesService) { }

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

    @Patch('steps/:id')
    updateStep(@Param('id') id: string, @Body() body: { subject?: string; body?: string }) {
        return this.sequencesService.updateStep(id, body);
    }
}
