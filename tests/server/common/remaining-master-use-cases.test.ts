import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/create-common-master-record.use-case";
import type { CommonMasterRepository } from "../../../apps/server/src/modules/common/application/services/common-master.repository";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/common/application/services/domain-event-publisher";
import type { CommonMasterRecord } from "../../../apps/server/src/modules/common/domain/entities/common-master-record";
import { getCommonMasterDefinition } from "../../../apps/server/src/modules/common/domain/value-objects/common-master-definition";

const timestamp = new Date("2026-04-30T13:00:00.000Z");

function createRecord(overrides: Partial<CommonMasterRecord> = {}): CommonMasterRecord {
  return {
    id: 30,
    code: "GST18",
    name: "GST 18%",
    description: "Standard tax",
    taxType: "GST",
    ratePercent: 18,
    decimalPlaces: 2,
    dueDays: 30,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    ...overrides,
  };
}

function createRepository(record = createRecord()): CommonMasterRepository {
  return {
    list: async () => [record],
    getById: async () => record,
    create: async () => record,
    update: async () => record,
    softDelete: async () => true,
    forceDelete: async () => true,
  };
}

function createPublisher() {
  const publishedEvents: DomainEvent[] = [];
  const publisher: DomainEventPublisher = {
    publishAll: async (events) => {
      publishedEvents.push(...events);
    },
  };

  return { publishedEvents, publisher };
}

describe("remaining common master use cases", () => {
  it("keeps specialized compliance, logistics, finance, and terms definitions", () => {
    expect(getCommonMasterDefinition("taxes").writableColumns).toContain("ratePercent");
    expect(getCommonMasterDefinition("warehouses").writableColumns).toContain("addressLine1");
    expect(getCommonMasterDefinition("currencies").writableColumns).toContain("decimalPlaces");
    expect(getCommonMasterDefinition("paymentTerms").writableColumns).toContain("dueDays");
  });

  it("publishes create events for remaining common master modules", async () => {
    const { publishedEvents, publisher } = createPublisher();
    const record = await new CreateCommonMasterRecordUseCase(
      createRepository(),
      publisher,
    ).execute("taxes", {
      code: "GST18",
      name: "GST 18%",
      description: "Standard tax",
      taxType: "GST",
      ratePercent: 18,
      isActive: true,
    });

    expect(record.ratePercent).toBe(18);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-created");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "taxes",
      code: "GST18",
      name: "GST 18%",
      isActive: true,
    });
  });
});
