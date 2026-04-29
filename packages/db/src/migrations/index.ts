import { createTenantsMigration } from "./001-create-tenants";
import { createIndustriesMigration } from "./002-create-industries";
import { createCompaniesMigration } from "./003-create-companies";
import { createCommonLocationMigration } from "./004-create-common-location";
import {
  contactsCommonMigrations,
  locationCommonMigrations,
  ordersCommonMigrations,
  othersCommonMigrations,
  productCommonMigrations,
} from "./common";

export const databaseMigrations = [
  createTenantsMigration,
  createIndustriesMigration,
  createCompaniesMigration,
  createCommonLocationMigration,
  ...locationCommonMigrations,
  ...contactsCommonMigrations,
  ...productCommonMigrations,
  ...ordersCommonMigrations,
  ...othersCommonMigrations,
] as const;

export { createTenantsMigration };
export { createIndustriesMigration };
export { createCompaniesMigration };
export { createCommonLocationMigration };
export {
  contactsCommonMigrations,
  locationCommonMigrations,
  ordersCommonMigrations,
  othersCommonMigrations,
  productCommonMigrations,
};
