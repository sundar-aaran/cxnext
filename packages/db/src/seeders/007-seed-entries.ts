import { defineDatabaseSeeder } from "../process/types";

export const seedEntriesSeeder = defineDatabaseSeeder({
  id: "billing:entries:001-seed-basic-billing",
  appId: "billing",
  moduleKey: "entries",
  name: "Seed basic billing entries",
  order: 110,
  run: async () => {
    // Entry and report-facing seed data are intentionally empty.
  },
});
