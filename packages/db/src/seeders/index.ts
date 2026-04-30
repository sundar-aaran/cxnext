import { seedTenantsSeeder } from "./001-seed-tenants";
import { seedIndustriesSeeder } from "./002-seed-industries";
import { seedCompaniesSeeder } from "./003-seed-companies";
import { seedCommonLocationSeeder } from "./004-seed-common-location";
import { seedContactsSeeder } from "./005-seed-contacts";
import { seedProductsSeeder } from "./006-seed-products";
import { seedEntriesSeeder } from "./007-seed-entries";
import {
  contactsCommonSeeders,
  locationCommonSeeders,
  ordersCommonSeeders,
  othersCommonSeeders,
  productCommonSeeders,
} from "./common";

export const databaseSeeders = [
  seedTenantsSeeder,
  seedIndustriesSeeder,
  seedCompaniesSeeder,
  seedCommonLocationSeeder,
  seedContactsSeeder,
  seedProductsSeeder,
  seedEntriesSeeder,
  ...locationCommonSeeders,
  ...contactsCommonSeeders,
  ...productCommonSeeders,
  ...ordersCommonSeeders,
  ...othersCommonSeeders,
] as const;

export { seedTenantsSeeder };
export { seedIndustriesSeeder };
export { seedCompaniesSeeder };
export { seedCommonLocationSeeder };
export { seedContactsSeeder };
export { seedProductsSeeder };
export { seedEntriesSeeder };
export {
  contactsCommonSeeders,
  locationCommonSeeders,
  ordersCommonSeeders,
  othersCommonSeeders,
  productCommonSeeders,
};
