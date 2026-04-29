import { createTenantsMigration } from "./001-create-tenants";

export const databaseMigrations = [createTenantsMigration] as const;

export { createTenantsMigration };
