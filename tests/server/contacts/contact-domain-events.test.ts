import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateContactUseCase } from "../../../apps/server/src/modules/contacts/application/use-cases/create-contact.use-case";
import { DeleteContactUseCase } from "../../../apps/server/src/modules/contacts/application/use-cases/delete-contact.use-case";
import { UpdateContactUseCase } from "../../../apps/server/src/modules/contacts/application/use-cases/update-contact.use-case";
import type { ContactRepository } from "../../../apps/server/src/modules/contacts/application/services/contact.repository";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/contacts/application/services/domain-event-publisher";
import type { ContactRecord } from "../../../apps/server/src/modules/contacts/domain/contact-record";

const contactRecord: ContactRecord = {
  id: "1",
  uuid: "contact-uuid",
  code: "C0001",
  contactTypeId: null,
  ledgerId: null,
  ledgerName: null,
  name: "Acme Contact",
  legalName: null,
  pan: null,
  gstin: null,
  msmeType: null,
  msmeNo: null,
  openingBalance: 0,
  balanceType: null,
  creditLimit: 0,
  website: null,
  description: null,
  primaryEmail: null,
  primaryPhone: null,
  isActive: true,
  createdAt: new Date("2026-04-30T00:00:00.000Z"),
  updatedAt: new Date("2026-04-30T00:00:00.000Z"),
  deletedAt: null,
  addresses: [],
  emails: [],
  phones: [],
  bankAccounts: [],
  gstDetails: [],
};

function repository(overrides: Partial<ContactRepository> = {}): ContactRepository {
  return {
    list: async () => [],
    getById: async () => null,
    create: async () => contactRecord,
    update: async () => contactRecord,
    softDelete: async () => true,
    ...overrides,
  };
}

function publisher(events: DomainEvent[]): DomainEventPublisher {
  return {
    publishAll: async (publishedEvents) => {
      events.push(...publishedEvents);
    },
  };
}

describe("contact write use cases", () => {
  it("publishes contact-created after create persistence succeeds", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new CreateContactUseCase(repository(), publisher(publishedEvents)).execute({
      name: "Acme Contact",
      isActive: true,
    });

    expect(publishedEvents[0]?.eventName).toBe("contacts.contact-created");
    expect(publishedEvents[0]?.aggregateId).toBe("1");
  });

  it("publishes contact-updated only when a record is updated", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new UpdateContactUseCase(
      repository({ list: async () => [contactRecord] }),
      publisher(publishedEvents),
    ).execute("1", {
      name: "Acme Contact",
      isActive: true,
    });

    await new UpdateContactUseCase(repository(), publisher(publishedEvents)).execute("missing", {
      name: "Missing Contact",
      isActive: true,
    });

    expect(publishedEvents.map((event) => event.eventName)).toEqual(["contacts.contact-updated"]);
  });

  it("publishes contact-deleted only after a successful soft delete", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new DeleteContactUseCase(repository(), publisher(publishedEvents)).execute("1");
    await new DeleteContactUseCase(
      repository({ softDelete: async () => false }),
      publisher(publishedEvents),
    ).execute("missing");

    expect(publishedEvents.map((event) => event.eventName)).toEqual(["contacts.contact-deleted"]);
  });
});
