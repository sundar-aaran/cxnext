import { seedTenantsSeeder } from "./001-seed-tenants";
import { seedIndustriesSeeder } from "./002-seed-industries";
import { seedCompaniesSeeder } from "./003-seed-companies";
import { seedCommonLocationSeeder } from "./004-seed-common-location";
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
export {
  contactsCommonSeeders,
  locationCommonSeeders,
  ordersCommonSeeders,
  othersCommonSeeders,
  productCommonSeeders,
};
