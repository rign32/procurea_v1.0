import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Get()
    findAll() {
        return this.requestsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.requestsService.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.requestsService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.requestsService.update(id, body);
    }

    @Post('offers')
    createOffer(@Body() body: any) {
        return this.requestsService.createOffer(body);
    }

    @Post('offers/:offerId/accept')
    acceptOffer(@Param('offerId') offerId: string) {
        return this.requestsService.acceptOffer(offerId);
    }
}
