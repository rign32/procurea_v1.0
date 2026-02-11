import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // =====================
    // Dashboard
    // =====================

    @Get('dashboard')
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }

    // =====================
    // User Management
    // =====================

    @Get('users')
    async getUsers(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('isBlocked') isBlocked?: string,
        @Query('organizationId') organizationId?: string,
    ) {
        return this.adminService.getUsers({
            skip: skip ? parseInt(skip, 10) : undefined,
            take: take ? parseInt(take, 10) : undefined,
            search,
            role,
            isBlocked: isBlocked !== undefined ? isBlocked === 'true' : undefined,
            organizationId,
        });
    }

    @Get('users/:id')
    async getUserById(@Param('id') id: string) {
        return this.adminService.getUserById(id);
    }

    @Post('users/:id/block')
    async blockUser(
        @Param('id') id: string,
        @Body() body: { reason?: string },
    ) {
        return this.adminService.blockUser(id, body.reason);
    }

    @Post('users/:id/unblock')
    async unblockUser(@Param('id') id: string) {
        return this.adminService.unblockUser(id);
    }

    @Post('users/:id/reset-password')
    async initiatePasswordReset(@Param('id') id: string) {
        return this.adminService.initiatePasswordReset(id);
    }

    @Patch('users/:id/role')
    async updateUserRole(
        @Param('id') id: string,
        @Body() body: { role: string },
    ) {
        return this.adminService.updateUserRole(id, body.role);
    }

    // =====================
    // Organization Management
    // =====================

    @Get('organizations')
    async getOrganizations(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('search') search?: string,
    ) {
        return this.adminService.getOrganizations({
            skip: skip ? parseInt(skip, 10) : undefined,
            take: take ? parseInt(take, 10) : undefined,
            search,
        });
    }

    @Get('organizations/:id')
    async getOrganizationById(@Param('id') id: string) {
        return this.adminService.getOrganizationById(id);
    }

    // =====================
    // API Usage
    // =====================

    @Get('api-usage/stats')
    async getApiUsageStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('service') service?: string,
        @Query('userId') userId?: string,
    ) {
        return this.adminService.getApiUsageStats({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            service,
            userId,
        });
    }

    @Get('api-usage/logs')
    async getApiUsageLogs(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('service') service?: string,
        @Query('status') status?: string,
        @Query('userId') userId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.adminService.getApiUsageLogs({
            skip: skip ? parseInt(skip, 10) : undefined,
            take: take ? parseInt(take, 10) : undefined,
            service,
            status,
            userId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }

    // =====================
    // Setup & Security
    // =====================

}
