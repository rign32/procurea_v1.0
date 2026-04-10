import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * GET /roles — list roles visible to the current user's organization.
   */
  @Get()
  async listRoles(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;

    // Get user's org
    const user = await this.rolesService['prisma'].user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    return this.rolesService.listRoles(user?.organizationId || null);
  }

  /**
   * POST /roles — create a custom role for the user's organization.
   * Body: { name, displayName, permissions: string[] }
   */
  @Post()
  async createRole(
    @Req() req: any,
    @Body()
    body: { name: string; displayName: string; permissions: string[] },
  ) {
    const userId = req.user?.userId || req.user?.sub;

    const user = await this.rolesService['prisma'].user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return { error: 'Organization required to create custom roles' };
    }

    return this.rolesService.createRole(user.organizationId, body, userId);
  }

  /**
   * PATCH /roles/:id — update role permissions or displayName.
   * Body: { displayName?, permissions?: string[] }
   */
  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { displayName?: string; permissions?: string[] },
  ) {
    const userId = req.user?.userId || req.user?.sub;
    return this.rolesService.updateRole(id, body, userId);
  }

  /**
   * DELETE /roles/:id — delete a custom role (system roles cannot be deleted).
   */
  @Delete(':id')
  async deleteRole(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    return this.rolesService.deleteRole(id, userId);
  }

  /**
   * PATCH /roles/assign/:userId — assign a role to a user.
   * Body: { roleId: string }
   */
  @Patch('assign/:userId')
  async assignRole(
    @Param('userId') targetUserId: string,
    @Req() req: any,
    @Body() body: { roleId: string },
  ) {
    const requestingUserId = req.user?.userId || req.user?.sub;
    return this.rolesService.assignRoleToUser(
      targetUserId,
      body.roleId,
      requestingUserId,
    );
  }

  /**
   * GET /roles/permissions — list all available permission scopes.
   */
  @Get('permissions')
  async listPermissions() {
    const { PERMISSIONS } = await import('../common/permissions.js');
    return {
      permissions: Object.entries(PERMISSIONS).map(([key, value]) => ({
        key,
        value,
      })),
    };
  }

  /**
   * GET /roles/my-permissions — get the current user's effective permissions.
   */
  @Get('my-permissions')
  async getMyPermissions(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    const permissions = await this.rolesService.getUserPermissions(userId);
    return { permissions };
  }
}
