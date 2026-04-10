/**
 * RBAC Permission Scopes
 *
 * Granular permission strings used by the PermissionsGuard
 * and stored in Role.permissions JSON array.
 */
export const PERMISSIONS = {
  // Campaign management
  CAMPAIGNS_CREATE: 'campaigns.create',
  CAMPAIGNS_VIEW_ALL: 'campaigns.view_all',
  CAMPAIGNS_DELETE: 'campaigns.delete',

  // RFQ workflow
  RFQS_CREATE: 'rfqs.create',
  RFQS_APPROVE: 'rfqs.approve',
  RFQS_SEND: 'rfqs.send',

  // Supplier operations
  SUPPLIERS_EXPORT: 'suppliers.export',
  SUPPLIERS_BLACKLIST: 'suppliers.blacklist',

  // Billing
  BILLING_MANAGE: 'billing.manage',
  BILLING_VIEW: 'billing.view',

  // Team management
  TEAM_MANAGE: 'team.manage',
  TEAM_INVITE: 'team.invite',

  // Settings
  SETTINGS_MANAGE: 'settings.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_SCHEDULE: 'reports.schedule',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * System roles created on application startup.
 * System roles cannot be deleted by users.
 */
export const SYSTEM_ROLES = {
  OWNER: {
    name: 'owner',
    displayName: 'Owner',
    permissions: Object.values(PERMISSIONS),
  },
  ADMIN: {
    name: 'admin',
    displayName: 'Admin',
    permissions: Object.values(PERMISSIONS).filter(
      (p) => p !== PERMISSIONS.BILLING_MANAGE,
    ),
  },
  MANAGER: {
    name: 'manager',
    displayName: 'Manager',
    permissions: [
      PERMISSIONS.CAMPAIGNS_CREATE,
      PERMISSIONS.CAMPAIGNS_VIEW_ALL,
      PERMISSIONS.RFQS_CREATE,
      PERMISSIONS.RFQS_APPROVE,
      PERMISSIONS.RFQS_SEND,
      PERMISSIONS.SUPPLIERS_EXPORT,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_SCHEDULE,
    ],
  },
  MEMBER: {
    name: 'member',
    displayName: 'Member',
    permissions: [
      PERMISSIONS.CAMPAIGNS_CREATE,
      PERMISSIONS.RFQS_CREATE,
      PERMISSIONS.RFQS_SEND,
      PERMISSIONS.SUPPLIERS_EXPORT,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  VIEWER: {
    name: 'viewer',
    displayName: 'Viewer',
    permissions: [PERMISSIONS.REPORTS_VIEW],
  },
} as const;

/**
 * Get default permissions for a legacy role string.
 * Used for backward compatibility when a user has no RBAC Role assigned.
 */
export function getPermissionsForLegacyRole(
  legacyRole: string,
): string[] {
  switch (legacyRole?.toUpperCase()) {
    case 'ADMIN':
      return [...SYSTEM_ROLES.ADMIN.permissions];
    case 'USER':
    default:
      return [...SYSTEM_ROLES.MEMBER.permissions];
  }
}
