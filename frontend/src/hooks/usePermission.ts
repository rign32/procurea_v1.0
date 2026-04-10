import { useMemo } from 'react';
import { useAuthStore } from '../stores/auth.store';

/**
 * RBAC permission constants (mirrors backend PERMISSIONS).
 * Import these instead of hardcoding strings.
 */
export const PERMISSIONS = {
  CAMPAIGNS_CREATE: 'campaigns.create',
  CAMPAIGNS_VIEW_ALL: 'campaigns.view_all',
  CAMPAIGNS_DELETE: 'campaigns.delete',
  RFQS_CREATE: 'rfqs.create',
  RFQS_APPROVE: 'rfqs.approve',
  RFQS_SEND: 'rfqs.send',
  SUPPLIERS_EXPORT: 'suppliers.export',
  SUPPLIERS_BLACKLIST: 'suppliers.blacklist',
  BILLING_MANAGE: 'billing.manage',
  BILLING_VIEW: 'billing.view',
  TEAM_MANAGE: 'team.manage',
  TEAM_INVITE: 'team.invite',
  SETTINGS_MANAGE: 'settings.manage',
  REPORTS_VIEW: 'reports.view',
  REPORTS_SCHEDULE: 'reports.schedule',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Check if the current user has a specific permission.
 *
 * @param permission - Permission string to check (e.g. PERMISSIONS.CAMPAIGNS_CREATE)
 * @returns true if user has the permission, false otherwise
 *
 * @example
 * const canCreate = usePermission(PERMISSIONS.CAMPAIGNS_CREATE);
 * if (!canCreate) return <AccessDenied />;
 */
export function usePermission(permission: Permission): boolean {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    if (!user) return false;

    const permissions = user.permissions ?? [];
    return permissions.includes(permission);
  }, [user, permission]);
}

/**
 * Check if the current user has ALL of the specified permissions.
 *
 * @param permissions - Array of permission strings
 * @returns true if user has all permissions
 */
export function usePermissions(permissions: Permission[]): boolean {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    if (!user) return false;

    const userPerms = user.permissions ?? [];
    return permissions.every((p) => userPerms.includes(p));
  }, [user, permissions]);
}

/**
 * Check if the current user has ANY of the specified permissions.
 *
 * @param permissions - Array of permission strings
 * @returns true if user has at least one of the permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    if (!user) return false;

    const userPerms = user.permissions ?? [];
    return permissions.some((p) => userPerms.includes(p));
  }, [user, permissions]);
}
