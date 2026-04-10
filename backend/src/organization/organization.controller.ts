import { Controller, Get, Body, Patch, Post, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('organization')
@UseGuards(AuthGuard('jwt'))
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    // --- Audit Logs (must be before :id routes to avoid param collision) ---

    @Get('audit-logs/list')
    async getAuditLogs(
        @Req() req: any,
        @Query('entityType') entityType?: string,
        @Query('userId') userId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        const requestingUserId = req.user?.userId || req.user?.sub;
        return this.organizationService.getAuditLogs(requestingUserId, {
            entityType: entityType || undefined,
            userId: userId || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
    }

    @Get(':id')
    async getOrganization(@Param('id') id: string) {
        return this.organizationService.getOrganization(id);
    }

    @Patch(':id')
    async updateOrganization(@Param('id') id: string, @Body() body: {
        name?: string;
        footerText?: string;
        footerEnabled?: boolean;
        footerFirstName?: string;
        footerLastName?: string;
        footerCompany?: string;
        footerPosition?: string;
        footerEmail?: string;
        footerPhone?: string;
        logoUrl?: string;
        primaryColor?: string;
        accentColor?: string;
        portalWelcomeText?: string;
    }) {
        return this.organizationService.updateOrganization(id, body);
    }

    @Get(':id/users')
    async getOrganizationUsers(@Param('id') id: string) {
        return this.organizationService.getOrganizationUsers(id);
    }

    @Post(':id/users')
    async addUserToOrganization(
        @Param('id') id: string,
        @Body() body: { email: string; name?: string; role?: string; campaignAccess?: string },
        @Req() req: any,
    ) {
        const requestingUserId = req.user?.userId || req.user?.sub;
        return this.organizationService.addUserToOrganization(id, body, requestingUserId);
    }

    @Patch(':id/users/:userId')
    async updateUserAccess(
        @Param('id') orgId: string,
        @Param('userId') userId: string,
        @Body() body: { role?: string; campaignAccess?: string },
        @Req() req: any,
    ) {
        const requestingUserId = req.user?.userId || req.user?.sub;
        return this.organizationService.updateUserAccess(orgId, userId, body, requestingUserId);
    }

    @Delete(':id/users/:userId')
    async removeUserFromOrganization(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Req() req: any,
    ) {
        const requestingUserId = req.user?.userId || req.user?.sub;
        return this.organizationService.removeUserFromOrganization(id, userId, requestingUserId);
    }

    // --- Democratic Sharing Endpoints ---

    @Get(':id/sharing')
    async getSharingPreferences(@Param('id') orgId: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.organizationService.getSharingPreferences(userId, orgId);
    }

    @Patch(':id/sharing/:targetUserId')
    async updateSharingPreference(
        @Param('id') orgId: string,
        @Param('targetUserId') targetUserId: string,
        @Body() body: { enabled: boolean },
        @Req() req: any,
    ) {
        const userId = req.user?.userId || req.user?.sub;
        return this.organizationService.updateSharingPreference(userId, targetUserId, body.enabled);
    }

    @Post(':id/leave')
    async leaveOrganization(@Param('id') orgId: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.organizationService.leaveOrganization(userId, orgId);
    }

    @Post(':id/locations')
    async addLocation(
        @Param('id') id: string,
        @Body() body: { name: string; address: string; isDefault?: boolean }
    ) {
        return this.organizationService.addLocation(id, body);
    }

    @Patch(':id/locations/:locId')
    async updateLocation(
        @Param('id') orgId: string,
        @Param('locId') locId: string,
        @Body() body: { name?: string; address?: string; isDefault?: boolean }
    ) {
        return this.organizationService.updateLocation(locId, orgId, body);
    }

    @Delete(':id/locations/:locId')
    async removeLocation(@Param('id') orgId: string, @Param('locId') locId: string) {
        return this.organizationService.removeLocation(locId, orgId);
    }
}
