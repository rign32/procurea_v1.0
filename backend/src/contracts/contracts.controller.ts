import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ContractsService } from './contracts.service';
import { GenerateFromOfferDto } from './dto/generate-from-offer.dto';

class CreateContractDto {
    @IsString() offerId: string;
    @IsString() @MaxLength(200) title: string;
    @IsOptional() @IsString() @MaxLength(5000) terms?: string;
    @IsOptional() @IsDateString() startDate?: string;
    @IsOptional() @IsDateString() endDate?: string;
}

class UpdateContractStatusDto {
    @IsString() status: string;
    @IsOptional() @IsString() @MaxLength(1000) comments?: string;
}

class UpdateContractDto {
    @IsOptional() @IsString() @MaxLength(200) title?: string;
    @IsOptional() @IsString() @MaxLength(5000) terms?: string;
    @IsOptional() @IsDateString() startDate?: string;
    @IsOptional() @IsDateString() endDate?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('contracts')
export class ContractsController {
    constructor(private readonly service: ContractsService) {}

    @Get()
    findAll(@Req() req: any, @Query('status') status?: string) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.findAll(userId, status);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.findOne(id, userId);
    }

    @Post()
    create(
        @Req() req: any,
        @Body() body: CreateContractDto,
    ) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.create(userId, body);
    }

    @Post('generate-from-offer')
    generateFromOffer(
        @Req() req: any,
        @Body() body: GenerateFromOfferDto,
    ) {
        if (!body?.offerId) throw new BadRequestException('offerId is required');
        const userId = req.user?.userId || req.user?.sub;
        return this.service.generateFromOffer(userId, body.offerId);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: UpdateContractStatusDto,
        @Req() req: any,
    ) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.updateStatus(id, userId, body.status, body.comments);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdateContractDto,
        @Req() req: any,
    ) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.update(id, userId, body);
    }
}
