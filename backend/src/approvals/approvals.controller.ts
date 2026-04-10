import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApprovalsService } from './approvals.service';

class CreateApprovalDto {
    @IsString() entityType: string;
    @IsString() entityId: string;
    @IsString() approverId: string;
    @IsOptional() @IsString() @MaxLength(1000) reason?: string;
}

class ApprovalActionDto {
    @IsOptional() @IsString() @MaxLength(1000) comments?: string;
}

class RejectDto {
    @IsOptional() @IsString() @MaxLength(1000) reason?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('approvals')
export class ApprovalsController {
    constructor(private readonly service: ApprovalsService) {}

    @Get()
    findAll(@Req() req: any, @Query('status') status?: string) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.findPending(userId, status);
    }

    @Post()
    create(
        @Req() req: any,
        @Body() body: CreateApprovalDto,
    ) {
        const requesterId = req.user?.userId || req.user?.sub;
        return this.service.create(requesterId, body);
    }

    @Patch(':id/approve')
    approve(@Param('id') id: string, @Req() req: any, @Body() body?: ApprovalActionDto) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.approve(id, userId, body?.comments);
    }

    @Patch(':id/reject')
    reject(@Param('id') id: string, @Req() req: any, @Body() body?: RejectDto) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.reject(id, userId, body?.reason);
    }
}
