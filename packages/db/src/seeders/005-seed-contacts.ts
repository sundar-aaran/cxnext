import type { Kysely } from "kysely";

import { defineDatabaseSeeder } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;

const timestamp = "2026-04-28 09:00:00";

const contactSeeds = [
  {
    uuid: "seed-contact-maya-rao",
    code: "C0001",
    contact_type_id: null,
    ledger_id: "ledger-sundry-debtors",
    ledger_name: "Sundry Debtors",
    name: "Sundar Kala Arunes Company Pvt Ltd",
    legal_name: "Sundar Kala Arunes Company Pvt Ltd",
    pan: null,
    gstin: null,
    msme_type: null,
    msme_no: null,
    opening_balance: 0,
    balance_type: null,
    credit_limit: 25000,
    website: null,
    description: "Company customer contact for starter contact workflows.",
    primary_email: "maya.rao@example.com",
    primary_phone: "+91 90000 01001",
    is_active: true,
    addresses: [
      {
        address_type_id: "address-type:primary-1",
        address_line1: "21 Lake View Road",
        address_line2: "Mylapore",
        city_id: null,
        district_id: null,
        state_id: null,
        country_id: null,
        pincode_id: null,
        latitude: null,
        longitude: null,
        is_default: true,
      },
    ],
    emails: [{ email: "maya.rao@example.com", email_type: "primary", is_primary: true }],
    phones: [{ phone_number: "+91 90000 01001", phone_type: "mobile", is_primary: true }],
    bankAccounts: [],
    gstDetails: [],
  },
  {
    uuid: "seed-contact-northwind-textiles",
    code: "C0002",
    contact_type_id: "contact-type:registered-customer-b2b",
    ledger_id: "ledger-sundry-debtors",
    ledger_name: "Sundry Debtors",
    name: "Northwind Textiles",
    legal_name: "Northwind Textiles Private Limited",
    pan: "AACCN1234K",
    gstin: "33AACCN1234K1Z5",
    msme_type: "small",
    msme_no: "UDYAM-TN-01-1234567",
    opening_balance: 12500,
    balance_type: "debit",
    credit_limit: 250000,
    website: "https://northwind.example.com",
    description: "B2B buyer contact with GST and banking details.",
    primary_email: "accounts@northwind.example.com",
    primary_phone: "+91 90000 01002",
    is_active: true,
    addresses: [
      {
        address_type_id: "address-type:billing",
        address_line1: "14 Textile Park Main Road",
        address_line2: "Tiruppur",
        city_id: null,
        district_id: null,
        state_id: null,
        country_id: null,
        pincode_id: null,
        latitude: null,
        longitude: null,
        is_default: true,
      },
    ],
    emails: [{ email: "accounts@northwind.example.com", email_type: "billing", is_primary: true }],
    phones: [{ phone_number: "+91 90000 01002", phone_type: "office", is_primary: true }],
    bankAccounts: [
      {
        bank_name: "HDFC Bank",
        account_number: "009876543211",
        account_holder_name: "Northwind Textiles Private Limited",
        ifsc: "HDFC0000456",
        branch: "Tiruppur",
        is_primary: true,
      },
    ],
    gstDetails: [{ gstin: "33AACCN1234K1Z5", state: "Tamil Nadu", is_default: true }],
  },
  {
    uuid: "seed-contact-swift-drop",
    code: "S0001",
    contact_type_id: "contact-type:supplier",
    ledger_id: "ledger-sundry-creditors",
    ledger_name: "Sundry Creditors",
    name: "Swift Drop Logistics",
    legal_name: "Swift Drop Logistics LLP",
    pan: "ABGFS9876P",
    gstin: "29ABGFS9876P1Z2",
    msme_type: "medium",
    msme_no: null,
    opening_balance: 0,
    balance_type: null,
    credit_limit: 100000,
    website: "https://swiftdrop.example.com",
    description: "Supplier contact for fulfilment and transport coordination.",
    primary_email: "dispatch@swiftdrop.example.com",
    primary_phone: "+91 90000 01003",
    is_active: true,
    addresses: [
      {
        address_type_id: "address-type:branch",
        address_line1: "8 Logistics Hub",
        address_line2: "Peenya",
        city_id: null,
        district_id: null,
        state_id: null,
        country_id: null,
        pincode_id: null,
        latitude: null,
        longitude: null,
        is_default: true,
      },
    ],
    emails: [{ email: "dispatch@swiftdrop.example.com", email_type: "support", is_primary: true }],
    phones: [{ phone_number: "+91 90000 01003", phone_type: "office", is_primary: true }],
    bankAccounts: [],
    gstDetails: [{ gstin: "29ABGFS9876P1Z2", state: "Karnataka", is_default: true }],
  },
] as const;

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

    for (const contact of contactSeeds) {
      const existingContact = await queryDatabase
        .selectFrom("contacts")
        .select("id")
        .where("code", "=", contact.code)
        .executeTakeFirst();

      if (existingContact) {
        continue;
      }

      const [result] = await queryDatabase
        .insertInto("contacts")
        .values({
          uuid: contact.uuid,
          code: contact.code,
          contact_type_id: contact.contact_type_id,
          ledger_id: contact.ledger_id,
          ledger_name: contact.ledger_name,
          name: contact.name,
          legal_name: contact.legal_name,
          pan: contact.pan,
          gstin: contact.gstin,
          msme_type: contact.msme_type,
          msme_no: contact.msme_no,
          opening_balance: contact.opening_balance,
          balance_type: contact.balance_type,
          credit_limit: contact.credit_limit,
          website: contact.website,
          description: contact.description,
          primary_email: contact.primary_email,
          primary_phone: contact.primary_phone,
          is_active: contact.is_active,
          created_at: timestamp,
          updated_at: timestamp,
          deleted_at: null,
        })
        .execute();
      const contactId = Number(result?.insertId);

      for (const address of contact.addresses) {
        await queryDatabase
          .insertInto("address_book")
          .values({
            owner_type: "contact",
            owner_id: contactId,
            ...address,
            is_active: true,
            created_at: timestamp,
            updated_at: timestamp,
          })
          .execute();
      }

      for (const email of contact.emails) {
        await queryDatabase
          .insertInto("contact_emails")
          .values({
            contact_id: contactId,
            ...email,
            is_active: true,
            created_at: timestamp,
            updated_at: timestamp,
          })
          .execute();
      }

      for (const phone of contact.phones) {
        await queryDatabase
          .insertInto("contact_phones")
          .values({
            contact_id: contactId,
            ...phone,
            is_active: true,
            created_at: timestamp,
            updated_at: timestamp,
          })
          .execute();
      }

      for (const bankAccount of contact.bankAccounts) {
        await queryDatabase
          .insertInto("contact_bank_accounts")
          .values({
            contact_id: contactId,
            ...bankAccount,
            is_active: true,
            created_at: timestamp,
            updated_at: timestamp,
          })
          .execute();
      }

      for (const gstDetail of contact.gstDetails) {
        await queryDatabase
          .insertInto("contact_gst_details")
          .values({
            contact_id: contactId,
            ...gstDetail,
            is_active: true,
            created_at: timestamp,
            updated_at: timestamp,
          })
          .execute();
      }
    }
  },
});
