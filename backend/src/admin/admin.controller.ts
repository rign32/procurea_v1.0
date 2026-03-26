import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { ObservabilityService } from '../observability/observability.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly observability: ObservabilityService,
    ) { }

    // =====================
    // Admin Auth (no JWT guard - entry point)
    // =====================

    @Post('auth/login')
    @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 per minute
    async adminLogin(
        @Body() body: { username: string; password: string },
    ) {
        return this.adminService.adminLogin(body.username, body.password);
    }

    // =====================
    // Dashboard
    // =====================

    @Get('dashboard')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }

    // =====================
    // User Management
    // =====================

    @Get('users')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
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
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getUserById(@Param('id') id: string) {
        return this.adminService.getUserById(id);
    }

    @Get('users/:id/billing')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getUserBilling(@Param('id') id: string) {
        return this.adminService.getUserBilling(id);
    }

    @Post('users/:id/block')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async blockUser(
        @Param('id') id: string,
        @Body() body: { reason?: string },
    ) {
        return this.adminService.blockUser(id, body.reason);
    }

    @Post('users/:id/unblock')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async unblockUser(@Param('id') id: string) {
        return this.adminService.unblockUser(id);
    }

    @Delete('users/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async deleteUser(@Param('id') id: string, @Request() req) {
        return this.adminService.deleteUser(id, req.user.id);
    }

    @Post('users/:id/reset-password')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async initiatePasswordReset(@Param('id') id: string) {
        return this.adminService.initiatePasswordReset(id);
    }

    @Patch('users/:id/role')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async updateUserRole(
        @Param('id') id: string,
        @Body() body: { role: string },
    ) {
        return this.adminService.updateUserRole(id, body.role);
    }

    @Patch('users/:id/language')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async updateUserLanguage(
        @Param('id') id: string,
        @Body() body: { language: string },
    ) {
        return this.adminService.updateUserLanguage(id, body.language);
    }

    // =====================
    // User Impersonation
    // =====================

    @Post('users/:id/impersonate')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async impersonateUser(@Param('id') id: string) {
        return this.adminService.impersonateUser(id);
    }

    // =====================
    // Organization Management
    // =====================

    @Get('organizations')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
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
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getOrganizationById(@Param('id') id: string) {
        return this.adminService.getOrganizationById(id);
    }

    @Patch('organizations/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async updateOrganization(
        @Param('id') id: string,
        @Body() body: { domain?: string; name?: string },
    ) {
        return this.adminService.updateOrganization(id, body);
    }

    @Patch('users/:id/organization')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async moveUserToOrganization(
        @Param('id') userId: string,
        @Body() body: { organizationId: string },
    ) {
        return this.adminService.moveUserToOrganization(userId, body.organizationId);
    }

    // =====================
    // Error Logs
    // =====================

    @Get('errors')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getErrorLogs(
        @Query('category') category?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getErrorLogs(
            category,
            limit ? parseInt(limit, 10) : 50,
        );
    }

    // =====================
    // Integrations Status
    // =====================

    @Get('integrations/status')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getIntegrationStatus(
        @Query('deep') deep?: string,
    ) {
        return this.adminService.getIntegrationStatus(deep === 'true');
    }

    // =====================
    // Cost Tracking
    // =====================

    @Get('costs/summary')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getCostSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.adminService.getCostSummary(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    @Get('costs/per-request')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getSourcingCostPerRequest() {
        return this.adminService.getSourcingCostPerRequest();
    }

    // =====================
    // API Usage
    // =====================

    @Get('api-usage/stats')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
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

    @Get('events')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getObservabilityEvents(
        @Query('category') category?: string,
        @Query('severity') severity?: string,
        @Query('type') type?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.observability.getEvents({
            category,
            severity,
            type,
            limit: Math.min(parseInt(limit || '50', 10), 200),
            offset: parseInt(offset || '0', 10),
        });
    }

    @Get('api-usage/logs')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
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
}
