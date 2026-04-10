import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../permissions';

export const PERMISSION_KEY = 'required_permission';

/**
 * Decorator to mark a controller method as requiring a specific permission.
 *
 * Usage:
 *   @RequirePermission(PERMISSIONS.CAMPAIGNS_CREATE)
 *   @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 *   async createCampaign() { ... }
 */
export const RequirePermission = (permission: Permission) =>
  SetMetadata(PERMISSION_KEY, permission);
