import {
  Injectable,
  OnModuleInit,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SYSTEM_ROLES,
  PERMISSIONS,
  getPermissionsForLegacyRole,
} from '../common/permissions';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * On application startup, ensure all system roles exist (global, no org).
   */
  async onModuleInit() {
    await this.seedSystemRoles();
  }

  /**
   * Create system roles if they don't already exist.
   * Uses upsert to be idempotent.
   */
  async seedSystemRoles(): Promise<void> {
    const allPermissionValues = Object.values(PERMISSIONS);

    for (const [, roleDef] of Object.entries(SYSTEM_ROLES)) {
      try {
        await this.prisma.role.upsert({
          where: {
            name_organizationId: {
              name: roleDef.name,
              organizationId: '', // Prisma needs a value; but for global we handle below
            },
          },
          update: {
            displayName: roleDef.displayName,
            permissions: [...roleDef.permissions] as string[],
          },
          create: {
            name: roleDef.name,
            displayName: roleDef.displayName,
            permissions: [...roleDef.permissions] as string[],
            isSystem: true,
            organizationId: null,
          },
        });
      } catch {
        // The unique constraint for (name, null orgId) may not work with upsert.
        // Fallback: check existence then create.
        const existing = await this.prisma.role.findFirst({
          where: { name: roleDef.name, organizationId: null },
        });
        if (existing) {
          await this.prisma.role.update({
            where: { id: existing.id },
            data: {
              displayName: roleDef.displayName,
              permissions: [...roleDef.permissions] as string[],
            },
          });
          this.logger.log(`System role "${roleDef.name}" updated`);
        } else {
          await this.prisma.role.create({
            data: {
              name: roleDef.name,
              displayName: roleDef.displayName,
              permissions: [...roleDef.permissions] as string[],
              isSystem: true,
              organizationId: null,
            },
          });
          this.logger.log(`System role "${roleDef.name}" created`);
        }
      }
    }

    this.logger.log('System roles seeded successfully');
  }

  /**
   * List roles visible to a user's organization:
   * - Global system roles (organizationId IS NULL)
   * - Custom roles belonging to the user's organization
   */
  async listRoles(organizationId: string | null): Promise<any[]> {
    return this.prisma.role.findMany({
      where: {
        OR: [
          { organizationId: null, isSystem: true },
          ...(organizationId
            ? [{ organizationId }]
            : []),
        ],
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        displayName: true,
        permissions: true,
        isSystem: true,
        organizationId: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
    });
  }

  /**
   * Create a custom role for an organization.
   */
  async createRole(
    organizationId: string,
    data: { name: string; displayName: string; permissions: string[] },
    requestingUserId: string,
  ): Promise<any> {
    // Verify user belongs to org and has TEAM_MANAGE permission
    await this.verifyOrgAdmin(requestingUserId, organizationId);

    // Validate permissions
    const validPermissions = Object.values(PERMISSIONS) as string[];
    const invalidPerms = data.permissions.filter(
      (p) => !validPermissions.includes(p),
    );
    if (invalidPerms.length > 0) {
      throw new BadRequestException(
        `Invalid permissions: ${invalidPerms.join(', ')}`,
      );
    }

    // Disallow naming a custom role same as system role
    const systemRoleNames = Object.values(SYSTEM_ROLES).map((r) => r.name);
    if (systemRoleNames.includes(data.name as any)) {
      throw new BadRequestException(
        `Role name "${data.name}" is reserved for system roles`,
      );
    }

    return this.prisma.role.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        permissions: data.permissions,
        isSystem: false,
        organizationId,
      },
    });
  }

  /**
   * Update permissions for a role.
   * System roles can only be updated at global level (not per-org).
   */
  async updateRole(
    roleId: string,
    data: { displayName?: string; permissions?: string[] },
    requestingUserId: string,
  ): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be modified');
    }

    if (role.organizationId) {
      await this.verifyOrgAdmin(requestingUserId, role.organizationId);
    }

    // Validate permissions if provided
    if (data.permissions) {
      const validPermissions = Object.values(PERMISSIONS) as string[];
      const invalidPerms = data.permissions.filter(
        (p) => !validPermissions.includes(p),
      );
      if (invalidPerms.length > 0) {
        throw new BadRequestException(
          `Invalid permissions: ${invalidPerms.join(', ')}`,
        );
      }
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        ...(data.displayName !== undefined
          ? { displayName: data.displayName }
          : {}),
        ...(data.permissions !== undefined
          ? { permissions: data.permissions }
          : {}),
      },
    });
  }

  /**
   * Delete a custom role. System roles cannot be deleted.
   * Users assigned to this role will have their rbacRoleId set to null.
   */
  async deleteRole(
    roleId: string,
    requestingUserId: string,
  ): Promise<{ deleted: boolean }> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    if (role.organizationId) {
      await this.verifyOrgAdmin(requestingUserId, role.organizationId);
    }

    // Unassign all users from this role
    await this.prisma.user.updateMany({
      where: { rbacRoleId: roleId },
      data: { rbacRoleId: null },
    });

    await this.prisma.role.delete({ where: { id: roleId } });

    return { deleted: true };
  }

  /**
   * Assign an RBAC role to a user.
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    requestingUserId: string,
  ): Promise<any> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.organizationId) {
      await this.verifyOrgAdmin(requestingUserId, targetUser.organizationId);
    }

    // Validate role exists and is accessible
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Role must be either global system role or belong to same org
    if (
      role.organizationId &&
      role.organizationId !== targetUser.organizationId
    ) {
      throw new ForbiddenException(
        'Cannot assign a role from a different organization',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { rbacRoleId: roleId },
      select: {
        id: true,
        email: true,
        name: true,
        rbacRoleId: true,
        rbacRole: { select: { name: true, displayName: true, permissions: true } },
      },
    });
  }

  /**
   * Get effective permissions for a user (RBAC role > legacy role fallback).
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        rbacRole: { select: { permissions: true } },
      },
    });

    if (!user) return [];

    if (user.rbacRole?.permissions) {
      const perms = user.rbacRole.permissions;
      if (Array.isArray(perms)) {
        return perms as string[];
      }
    }

    return getPermissionsForLegacyRole(user.role);
  }

  /**
   * Verify that requesting user has TEAM_MANAGE permission in the organization.
   */
  private async verifyOrgAdmin(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        role: true,
        rbacRole: { select: { permissions: true } },
      },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenException('Not a member of this organization');
    }

    // Check permissions
    let permissions: string[];
    if (user.rbacRole?.permissions && Array.isArray(user.rbacRole.permissions)) {
      permissions = user.rbacRole.permissions as string[];
    } else {
      permissions = getPermissionsForLegacyRole(user.role);
    }

    if (!permissions.includes(PERMISSIONS.TEAM_MANAGE)) {
      // Legacy: ADMIN role always has team manage
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'You need TEAM_MANAGE permission to manage roles',
        );
      }
    }
  }
}
