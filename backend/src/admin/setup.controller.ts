import { Controller, Get, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
export class SetupController {
    constructor(private readonly adminService: AdminService) { }

    @Get('setup')
    @UseGuards(AuthGuard('jwt'))
    async setupAdmin(
        @Query('key') key: string,
        @Request() req,
    ) {
        const setupKey = process.env.ADMIN_SETUP_KEY;
        if (!setupKey || key !== setupKey) {
            throw new ForbiddenException('Invalid setup key');
        }

        const ip = req.ip || req.connection.remoteAddress;
        return this.adminService.promoteToAdmin(req.user.id, ip);
    }
}
