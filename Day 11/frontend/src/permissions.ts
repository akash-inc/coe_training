export type UserRole = 'admin' | 'editor' | 'viewer'

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'tasks:read'
  | 'tasks:write'
  | 'tasks:delete'

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  admin: new Set([
    'users:read',
    'users:write',
    'users:delete',
    'tasks:read',
    'tasks:write',
    'tasks:delete',
  ]),
  editor: new Set(['tasks:read', 'tasks:write', 'tasks:delete', 'users:read']),
  viewer: new Set(['tasks:read', 'users:read']),
}

export function getPermissions(role: string): Set<Permission> {
  return new Set(ROLE_PERMISSIONS[role as UserRole] ?? [])
}

export function hasPermission(role: string, permission: Permission): boolean {
  return getPermissions(role).has(permission)
}

export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function isAdmin(role: string): boolean {
  return role === 'admin'
}
