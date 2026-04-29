import type { Kysely } from "kysely";

import { defineDatabaseSeeder } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;

interface IndustrySeed {
  readonly name: string;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

const industrySeeds: readonly IndustrySeed[] = [
  "Garments",
  "Garments - Ecommerce",
  "Offset Printing",
  "Upvc",
  "Computer",
  "Computer - Ecommerce",
  "Auditor office",
].map((name, index) => ({
  name,
  is_active: true,
  created_at: `2026-04-28 ${String(9 + index).padStart(2, "0")}:00:00`,
  updated_at: `2026-04-28 ${String(9 + index).padStart(2, "0")}:00:00`,
  deleted_at: null,
}));

function asQueryDatabase(database: Kysely<unknown>) {
  return database as unknown as Kysely<DynamicDatabase>;
}

export const seedIndustriesSeeder = defineDatabaseSeeder({
  id: "organisation:industries:001-seed-industries",
  appId: "organisation",
  moduleKey: "industries",
  name: "Seed default industries",
  order: 20,
  run: async ({ database }) => {
    const queryDatabase = asQueryDatabase(database);

    for (const industry of industrySeeds) {
      const existingIndustry = await queryDatabase
        .selectFrom("industries")
        .select("name")
        .where("name", "=", industry.name)
        .executeTakeFirst();

      if (existingIndustry) {
        continue;
      }

      await queryDatabase
        .insertInto("industries")
        .values({ ...industry })
        .execute();
    }
  },
});
