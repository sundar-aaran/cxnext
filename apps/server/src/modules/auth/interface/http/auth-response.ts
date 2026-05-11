import type {
  AuthGateRecord,
  AuthPermissionRecord,
  AuthPolicyRecord,
  AuthRoleRecord,
  AuthUserRecord,
} from "../../domain/auth-record";

export function toAuthPermissionResponse(permission: AuthPermissionRecord) {
  return {
    id: permission.id,
    key: permission.key,
    name: permission.name,
    moduleKey: permission.moduleKey,
    action: permission.action,
    description: permission.description,
  };
}

export function toAuthRoleResponse(role: AuthRoleRecord) {
  return {
    id: role.id,
    key: role.key,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    isActive: role.isActive,
    permissions: role.permissions.map(toAuthPermissionResponse),
  };
}

export function toAuthPolicyResponse(policy: AuthPolicyRecord) {
  return {
    key: policy.key,
    name: policy.name,
    boundedContext: policy.boundedContext,
    actions: policy.actions,
    description: policy.description,
    permissionKeys: policy.permissionKeys,
  };
}

export function toAuthGateResponse(gate: AuthGateRecord) {
  return {
    userId: gate.userId,
    tenant: gate.tenant,
    username: gate.username,
    displayName: gate.displayName,
    email: gate.email,
    isActive: gate.isActive,
    roleKeys: gate.roleKeys,
    permissionKeys: gate.permissionKeys,
    permissions: gate.permissions.map(toAuthPermissionResponse),
  };
}

export function toAuthUserResponse(user: AuthUserRecord) {
  return {
    id: user.id,
    tenant: user.tenant,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    isActive: user.isActive,
    roles: user.roles.map(toAuthRoleResponse),
    permissions: user.permissions.map(toAuthPermissionResponse),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
