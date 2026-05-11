import type { AuthPermissionRecord, AuthRoleRecord, AuthUserRecord } from "../../domain/auth-record";

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export interface AuthUserUpsertParams {
  readonly tenantId: string;
  readonly username: string;
  readonly email: string;
  readonly displayName: string;
  readonly password?: string | null;
  readonly isActive: boolean;
  readonly roleKeys: readonly string[];
}

export interface AuthRoleUpsertParams {
  readonly key: string;
  readonly name: string;
  readonly description?: string | null;
  readonly isActive: boolean;
}

export interface AuthSessionParams {
  readonly sessionId: string;
  readonly tokenId: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly expiresAt: Date;
}

export interface AuthRepository {
  findUserByLogin(login: string): Promise<(AuthUserRecord & { readonly passwordHash: string }) | null>;
  findUserById(userId: string): Promise<AuthUserRecord | null>;
  listUsers(): Promise<readonly AuthUserRecord[]>;
  createUser(params: AuthUserUpsertParams & { readonly passwordHash: string }): Promise<AuthUserRecord>;
  updateUser(userId: string, params: AuthUserUpsertParams & { readonly passwordHash?: string | null }): Promise<AuthUserRecord | null>;
  listRoles(): Promise<readonly AuthRoleRecord[]>;
  createRole(params: AuthRoleUpsertParams): Promise<AuthRoleRecord>;
  updateRole(roleId: string, params: AuthRoleUpsertParams): Promise<AuthRoleRecord | null>;
  deleteRole(roleId: string): Promise<boolean>;
  findActiveRoleKeys(roleKeys: readonly string[]): Promise<readonly string[]>;
  listPermissions(): Promise<readonly AuthPermissionRecord[]>;
  findActivePermissionKeys(permissionKeys: readonly string[]): Promise<readonly string[]>;
  createSession(params: AuthSessionParams): Promise<void>;
  revokeSession(sessionId: string): Promise<void>;
  findSession(tokenId: string): Promise<{ readonly sessionId: string; readonly userId: string; readonly revokedAt: Date | null; readonly expiresAt: Date } | null>;
  touchLogin(userId: string): Promise<void>;
}
