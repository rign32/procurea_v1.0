import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { getPermissionsForLegacyRole } from '../permissions';

/**
 * Guard that checks whether the authenticated user holds a specific permission.
 *
 * Resolution order:
 * 1. If user has an RBAC Role assigned (rbacRoleId) => use role.permissions
 * 2. Else fall back to legacy `role` field ("ADMIN"/"USER") and map to default permissions
 *
 * If no @RequirePermission decorator is present, the guard passes (backward compat).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<
      string | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    // No permission required => allow (backward compat)
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new ForbiddenException('Account is blocked');
    }

    const permissions = await this.resolvePermissions(
      user.userId || user.sub,
      user.role,
    );

    if (!permissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        `Missing permission: ${requiredPermission}`,
      );
    }

    return true;
  }

  /**
   * Resolve the effective permissions array for a user.
   * Checks RBAC role first, then falls back to legacy role mapping.
   */
  private async resolvePermissions(
    userId: string,
    legacyRole?: string,
  ): Promise<string[]> {
    // Try RBAC role first
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        rbacRole: {
          select: { permissions: true },
        },
      },
    });

    if (userWithRole?.rbacRole?.permissions) {
      const perms = userWithRole.rbacRole.permissions;
      if (Array.isArray(perms)) {
        return perms as string[];
      }
    }

    // Fall back to legacy role
    const effectiveLegacy = userWithRole?.role || legacyRole || 'USER';
    return getPermissionsForLegacyRole(effectiveLegacy);
  }
}
