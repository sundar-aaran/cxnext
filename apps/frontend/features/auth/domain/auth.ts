export interface AuthPermission {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly moduleKey: string;
  readonly action: string;
  readonly description: string | null;
}

export interface AuthRole {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
  readonly permissions: readonly AuthPermission[];
}

export interface AuthTenant {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface AuthUser {
  readonly id: string;
  readonly tenant: AuthTenant;
  readonly username: string;
  readonly email: string;
  readonly displayName: string;
  readonly isActive: boolean;
  readonly roles: readonly AuthRole[];
  readonly permissions: readonly AuthPermission[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly sessionId: string;
  readonly tenant: AuthTenant;
  readonly user: AuthUser;
  readonly permissions: readonly string[];
}

export interface AuthUserInput {
  readonly tenantId: string;
  readonly username: string;
  readonly email: string;
  readonly displayName: string;
  readonly password?: string | null;
  readonly isActive: boolean;
  readonly roleKeys: readonly string[];
}
