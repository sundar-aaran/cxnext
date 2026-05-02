import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { createDatabaseConnection, loadDatabaseEnv, type DatabaseConnection } from "@cxnext/db";
import type {
  AuthRepository,
  AuthSessionParams,
  AuthUserUpsertParams,
} from "../../application/services/auth.repository";
import type { AuthPermissionRecord, AuthRoleRecord, AuthUserRecord } from "../../domain/auth-record";

type DynamicDatabase = Record<string, Record<string, unknown>>;

interface UserRow {
  readonly id: number | bigint;
  readonly tenant_id: number | bigint;
  readonly tenant_name: string;
  readonly tenant_slug: string;
  readonly username: string;
  readonly email: string;
  readonly display_name: string;
  readonly password_hash?: string;
  readonly is_active: boolean | number;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

@Injectable()
export class KyselyAuthRepository implements AuthRepository, OnModuleDestroy {
  private readonly connection: DatabaseConnection;

  public constructor() {
    this.connection = createDatabaseConnection(loadDatabaseEnv().env);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.connection.destroy();
  }

  public async findUserByLogin(login: string) {
    const normalized = login.trim().toLowerCase();
    const row = (await this.db()
      .selectFrom("auth_users as users")
      .innerJoin("tenants", "tenants.id", "users.tenant_id")
      .select([
        "users.id",
        "users.tenant_id",
        "tenants.name as tenant_name",
        "tenants.slug as tenant_slug",
        "users.username",
        "users.email",
        "users.display_name",
        "users.password_hash",
        "users.is_active",
        "users.created_at",
        "users.updated_at",
      ])
      .where("users.deleted_at", "is", null)
      .where((builder) =>
        builder.or([
          builder("users.username", "=", normalized),
          builder("users.email", "=", normalized),
        ]),
      )
      .executeTakeFirst()) as UserRow | undefined;

    return row ? { ...(await this.hydrateUser(row)), passwordHash: String(row.password_hash) } : null;
  }

  public async findUserById(userId: string): Promise<AuthUserRecord | null> {
    const row = await this.readUserRow(userId);
    return row ? this.hydrateUser(row) : null;
  }

  public async listUsers(): Promise<readonly AuthUserRecord[]> {
    const rows = (await this.db()
      .selectFrom("auth_users as users")
      .innerJoin("tenants", "tenants.id", "users.tenant_id")
      .select([
        "users.id",
        "users.tenant_id",
        "tenants.name as tenant_name",
        "tenants.slug as tenant_slug",
        "users.username",
        "users.email",
        "users.display_name",
        "users.is_active",
        "users.created_at",
        "users.updated_at",
      ])
      .where("users.deleted_at", "is", null)
      .orderBy("users.id", "asc")
      .execute()) as UserRow[];

    return Promise.all(rows.map((row) => this.hydrateUser(row)));
  }

  public async createUser(
    params: AuthUserUpsertParams & { readonly passwordHash: string },
  ): Promise<AuthUserRecord> {
    const now = new Date();
    const result = await this.db()
      .insertInto("auth_users")
      .values({
        tenant_id: Number(params.tenantId),
        username: params.username.trim().toLowerCase(),
        email: params.email.trim().toLowerCase(),
        display_name: params.displayName.trim(),
        password_hash: params.passwordHash,
        is_active: params.isActive,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })
      .executeTakeFirstOrThrow();

    await this.replaceUserRoles(String(result.insertId), params.roleKeys);
    const user = await this.findUserById(String(result.insertId));
    if (!user) throw new Error("User was created but could not be read back.");
    return user;
  }

  public async updateUser(
    userId: string,
    params: AuthUserUpsertParams & { readonly passwordHash?: string | null },
  ): Promise<AuthUserRecord | null> {
    const values: Record<string, unknown> = {
      tenant_id: Number(params.tenantId),
      username: params.username.trim().toLowerCase(),
      email: params.email.trim().toLowerCase(),
      display_name: params.displayName.trim(),
      is_active: params.isActive,
      updated_at: new Date(),
    };

    if (params.passwordHash) {
      values.password_hash = params.passwordHash;
    }

    await this.db()
      .updateTable("auth_users")
      .set(values)
      .where("id", "=", Number(userId))
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    await this.replaceUserRoles(userId, params.roleKeys);

    return this.findUserById(userId);
  }

  public async listRoles(): Promise<readonly AuthRoleRecord[]> {
    const rows = (await this.db()
      .selectFrom("auth_roles")
      .selectAll()
      .where("is_active", "=", true)
      .orderBy("id", "asc")
      .execute()) as Array<Record<string, unknown>>;

    return Promise.all(rows.map((row) => this.hydrateRole(row)));
  }

  public async findActiveRoleKeys(roleKeys: readonly string[]): Promise<readonly string[]> {
    if (roleKeys.length === 0) {
      return [];
    }

    const rows = (await this.db()
      .selectFrom("auth_roles")
      .select(["role_key"])
      .where("is_active", "=", true)
      .where("role_key", "in", [...new Set(roleKeys)])
      .execute()) as Array<{ role_key: string }>;

    return rows.map((row) => row.role_key);
  }

  public async listPermissions(): Promise<readonly AuthPermissionRecord[]> {
    const rows = (await this.db()
      .selectFrom("auth_permissions")
      .selectAll()
      .where("is_active", "=", true)
      .orderBy("module_key", "asc")
      .orderBy("action", "asc")
      .execute()) as Array<Record<string, unknown>>;

    return rows.map(toPermission);
  }

  public async createSession(params: AuthSessionParams): Promise<void> {
    await this.db()
      .insertInto("auth_sessions")
      .values({
        id: params.sessionId,
        user_id: Number(params.userId),
        tenant_id: Number(params.tenantId),
        token_id: params.tokenId,
        issued_at: new Date(),
        expires_at: params.expiresAt,
        revoked_at: null,
      })
      .execute();
  }

  public async revokeSession(sessionId: string): Promise<void> {
    await this.db()
      .updateTable("auth_sessions")
      .set({ revoked_at: new Date() })
      .where("id", "=", sessionId)
      .where("revoked_at", "is", null)
      .executeTakeFirst();
  }

  public async findSession(tokenId: string) {
    const row = (await this.db()
      .selectFrom("auth_sessions")
      .select(["id", "user_id", "revoked_at", "expires_at"])
      .where("token_id", "=", tokenId)
      .executeTakeFirst()) as
      | { id: string; user_id: number | bigint; revoked_at: Date | string | null; expires_at: Date | string }
      | undefined;

    return row
      ? {
          sessionId: row.id,
          userId: String(row.user_id),
          revokedAt: row.revoked_at ? toDate(row.revoked_at) : null,
          expiresAt: toDate(row.expires_at),
        }
      : null;
  }

  public async touchLogin(userId: string): Promise<void> {
    await this.db()
      .updateTable("auth_users")
      .set({ last_login_at: new Date(), updated_at: new Date() })
      .where("id", "=", Number(userId))
      .executeTakeFirst();
  }

  private async readUserRow(userId: string) {
    return (await this.db()
      .selectFrom("auth_users as users")
      .innerJoin("tenants", "tenants.id", "users.tenant_id")
      .select([
        "users.id",
        "users.tenant_id",
        "tenants.name as tenant_name",
        "tenants.slug as tenant_slug",
        "users.username",
        "users.email",
        "users.display_name",
        "users.is_active",
        "users.created_at",
        "users.updated_at",
      ])
      .where("users.id", "=", Number(userId))
      .where("users.deleted_at", "is", null)
      .executeTakeFirst()) as UserRow | undefined;
  }

  private async hydrateUser(row: UserRow): Promise<AuthUserRecord> {
    const roles = await this.readUserRoles(String(row.id));
    const permissionMap = new Map<string, AuthPermissionRecord>();
    for (const role of roles) {
      for (const permission of role.permissions) {
        permissionMap.set(permission.key, permission);
      }
    }

    return {
      id: String(row.id),
      tenant: {
        id: String(row.tenant_id),
        name: row.tenant_name,
        slug: row.tenant_slug,
      },
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      isActive: Boolean(row.is_active),
      roles,
      permissions: [...permissionMap.values()].sort((a, b) => a.key.localeCompare(b.key)),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    };
  }

  private async readUserRoles(userId: string) {
    const rows = (await this.db()
      .selectFrom("auth_roles as roles")
      .innerJoin("auth_user_roles as user_roles", "user_roles.role_id", "roles.id")
      .selectAll("roles")
      .where("user_roles.user_id", "=", Number(userId))
      .where("roles.is_active", "=", true)
      .execute()) as Array<Record<string, unknown>>;

    return Promise.all(rows.map((row) => this.hydrateRole(row)));
  }

  private async hydrateRole(row: Record<string, unknown>): Promise<AuthRoleRecord> {
    const permissions = (await this.db()
      .selectFrom("auth_permissions as permissions")
      .innerJoin(
        "auth_role_permissions as role_permissions",
        "role_permissions.permission_id",
        "permissions.id",
      )
      .selectAll("permissions")
      .where("role_permissions.role_id", "=", Number(row.id))
      .where("permissions.is_active", "=", true)
      .orderBy("permissions.permission_key", "asc")
      .execute()) as Array<Record<string, unknown>>;

    return {
      id: String(row.id),
      key: String(row.role_key),
      name: String(row.name),
      description: row.description ? String(row.description) : null,
      isSystem: Boolean(row.is_system),
      permissions: permissions.map(toPermission),
    };
  }

  private async replaceUserRoles(userId: string, roleKeys: readonly string[]) {
    const roles = (await this.db()
      .selectFrom("auth_roles")
      .select(["id", "role_key"])
      .where("is_active", "=", true)
      .where("role_key", "in", [...roleKeys])
      .execute()) as Array<{ id: number | bigint; role_key: string }>;

    await this.db().deleteFrom("auth_user_roles").where("user_id", "=", Number(userId)).execute();

    if (roles.length > 0) {
      await this.db()
        .insertInto("auth_user_roles")
        .values(
          roles.map((role) => ({
            user_id: Number(userId),
            role_id: Number(role.id),
            created_at: new Date(),
          })),
        )
        .execute();
    }
  }

  private db() {
    return this.connection.db as unknown as import("kysely").Kysely<DynamicDatabase>;
  }
}

function toPermission(row: Record<string, unknown>): AuthPermissionRecord {
  return {
    id: String(row.id),
    key: String(row.permission_key),
    name: String(row.name),
    moduleKey: String(row.module_key),
    action: String(row.action),
    description: row.description ? String(row.description) : null,
  };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}
