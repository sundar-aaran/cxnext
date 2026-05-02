import { randomBytes, scryptSync } from "node:crypto";
import type { Kysely } from "kysely";
import { authPolicyModuleList, authRoleBlueprints } from "@cxnext/types";

import { defineDatabaseSeeder } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;

function asQueryDatabase(database: Kysely<unknown>) {
  return database as unknown as Kysely<DynamicDatabase>;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 64).toString("base64url");

  return `scrypt$${salt}$${hash}`;
}

export const seedAuthRbacSeeder = defineDatabaseSeeder({
  id: "security:auth:001-seed-auth-rbac",
  appId: "security",
  moduleKey: "auth",
  name: "Seed auth roles, permissions, and default admin",
  order: 90,
  run: async ({ database }) => {
    const db = asQueryDatabase(database);
    const now = new Date();

    for (const moduleDefinition of authPolicyModuleList) {
      for (const action of moduleDefinition.actions) {
        const permissionKey = `${moduleDefinition.key}.${action}`;
        const existing = await db
          .selectFrom("auth_permissions")
          .select("id")
          .where("permission_key", "=", permissionKey)
          .executeTakeFirst();

        if (!existing) {
          await db
            .insertInto("auth_permissions")
            .values({
              permission_key: permissionKey,
              name: `${moduleDefinition.name} ${action}`,
              module_key: moduleDefinition.key,
              action,
              description: `Allows ${action} access for ${moduleDefinition.description}`,
              is_active: true,
              created_at: now,
              updated_at: now,
            })
            .execute();
        }
      }
    }

    for (const role of authRoleBlueprints) {
      const existing = await db
        .selectFrom("auth_roles")
        .select("id")
        .where("role_key", "=", role.key)
        .executeTakeFirst();

      if (!existing) {
        await db
          .insertInto("auth_roles")
          .values({
            role_key: role.key,
            name: role.name,
            description: role.description,
            is_system: role.isSystem,
            is_active: true,
            created_at: now,
            updated_at: now,
          })
          .execute();
      }
    }

    const seededRoles = (await db
      .selectFrom("auth_roles")
      .select(["id", "role_key"])
      .execute()) as Array<{ id: number | bigint; role_key: string }>;
    const seededPermissions = (await db
      .selectFrom("auth_permissions")
      .select(["id", "permission_key", "action"])
      .execute()) as Array<{ id: number | bigint; permission_key: string; action: string }>;
    const roleByKey = new Map(seededRoles.map((role) => [role.role_key, Number(role.id)]));

    const roleBlueprintByKey = new Map<string, (typeof authRoleBlueprints)[number]>(
      authRoleBlueprints.map((role) => [role.key, role]),
    );

    for (const permission of seededPermissions) {
      for (const [roleKey, roleId] of roleByKey) {
        const blueprint = roleBlueprintByKey.get(roleKey);
        if (!blueprint || !blueprint.permissionKeys.includes(permission.permission_key)) {
          continue;
        }

        const existing = await db
          .selectFrom("auth_role_permissions")
          .select("role_id")
          .where("role_id", "=", roleId)
          .where("permission_id", "=", Number(permission.id))
          .executeTakeFirst();

        if (!existing) {
          await db
            .insertInto("auth_role_permissions")
            .values({ role_id: roleId, permission_id: Number(permission.id), created_at: now })
            .execute();
        }
      }
    }

    const tenant = (await db
      .selectFrom("tenants")
      .select("id")
      .where("deleted_at", "is", null)
      .orderBy("id", "asc")
      .executeTakeFirst()) as { id: number | bigint } | undefined;

    if (!tenant) {
      throw new Error("Cannot seed auth user before at least one tenant exists.");
    }

    const existingAdmin = await db
      .selectFrom("auth_users")
      .select("id")
      .where("username", "=", "admin")
      .executeTakeFirst();

    if (!existingAdmin) {
      const result = await db
        .insertInto("auth_users")
        .values({
          tenant_id: Number(tenant.id),
          username: "admin",
          email: "admin@cxnext.local",
          display_name: "Platform Admin",
          password_hash: hashPassword(process.env.AUTH_DEFAULT_ADMIN_PASSWORD ?? "Admin@12345"),
          is_active: true,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        })
        .executeTakeFirstOrThrow();
      const adminRoleId = roleByKey.get("platform_admin");

      if (adminRoleId) {
        await db
          .insertInto("auth_user_roles")
          .values({
            user_id: Number(result.insertId),
            role_id: adminRoleId,
            created_at: now,
          })
          .execute();
      }
    }
  },
});
