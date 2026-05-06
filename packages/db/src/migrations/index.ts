import { createTenantsMigration } from "./001-create-tenants";
import { createIndustriesMigration } from "./002-create-industries";
import { createCompaniesMigration } from "./003-create-companies";
import { createCommonLocationMigration } from "./004-create-common-location";
import { createContactsMigration } from "./005-create-contacts";
import { createProductsMigration } from "./006-create-products";
import { createEntriesMigration } from "./007-create-entries";
import { extendSalesIndustryFieldsMigration } from "./008-extend-sales-industry-fields";
import { createAuthRbacMigration } from "./009-create-auth-rbac";
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
  createContactsMigration,
  ...productCommonMigrations,
  ...ordersCommonMigrations,
  ...othersCommonMigrations,
  createProductsMigration,
  createEntriesMigration,
  extendSalesIndustryFieldsMigration,
  createAuthRbacMigration,
] as const;

export { createTenantsMigration };
export { createIndustriesMigration };
export { createCompaniesMigration };
export { createCommonLocationMigration };
export { createContactsMigration };
export { createProductsMigration };
export { createEntriesMigration };
export { extendSalesIndustryFieldsMigration };
export { createAuthRbacMigration };
export {
  contactsCommonMigrations,
  locationCommonMigrations,
  ordersCommonMigrations,
  othersCommonMigrations,
  productCommonMigrations,
};
