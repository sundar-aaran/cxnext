import { seedTenantsSeeder } from "./001-seed-tenants";

export const databaseSeeders = [seedTenantsSeeder] as const;

export { seedTenantsSeeder };
