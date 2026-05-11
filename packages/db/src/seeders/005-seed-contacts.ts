import type { Kysely } from "kysely";

import { defineDatabaseSeeder } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;

function asQueryDatabase(database: Kysely<unknown>) {
  return database as unknown as Kysely<DynamicDatabase>;
}

export const seedContactsSeeder = defineDatabaseSeeder({
  id: "crm:contacts:001-seed-contacts",
  appId: "crm",
  moduleKey: "contacts",
  name: "Seed default contacts",
  order: 65,
  run: async ({ database }) => {
    const queryDatabase = asQueryDatabase(database);
    const existingContact = await queryDatabase
      .selectFrom("contacts")
      .select("id")
      .where("code", "=", "-")
      .executeTakeFirst();

    if (existingContact) {
      return;
    }

    await queryDatabase
      .insertInto("contacts")
      .values({
        uuid: "seed-contact-default",
        code: "-",
        contact_type_id: null,
        ledger_id: null,
        ledger_name: null,
        name: "-",
        legal_name: "-",
        pan: null,
        gstin: null,
        msme_type: null,
        msme_no: null,
        tan: null,
        tds_available: false,
        tcs_available: false,
        opening_balance: 0,
        balance_type: null,
        credit_limit: 0,
        website: null,
        description: "Default empty contact.",
        primary_email: null,
        primary_phone: null,
        is_active: true,
        created_at: "2026-04-28 09:00:00",
        updated_at: "2026-04-28 09:00:00",
        deleted_at: null,
      })
      .execute();
  },
});
