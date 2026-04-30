import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/create-common-master-record.use-case";
import { DeleteCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/delete-common-master-record.use-case";
import type { CommonMasterRepository } from "../../../apps/server/src/modules/common/application/services/common-master.repository";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/common/application/services/domain-event-publisher";
import type { CommonMasterRecord } from "../../../apps/server/src/modules/common/domain/entities/common-master-record";
import { getCommonMasterDefinition } from "../../../apps/server/src/modules/common/domain/value-objects/common-master-definition";

const timestamp = new Date("2026-04-30T12:00:00.000Z");

function createAttributeRecord(overrides: Partial<CommonMasterRecord> = {}): CommonMasterRecord {
  return {
    id: 20,
    code: "RED",
    name: "Red",
    description: "Primary red",
    hexCode: "#ff0000",
    sortOrder: 2,
    symbol: "pc",
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    ...overrides,
  };
}

function createRepository(record = createAttributeRecord()): CommonMasterRepository {
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

describe("common product attribute use cases", () => {
  it("keeps colour, size, and unit field definitions", () => {
    expect(getCommonMasterDefinition("colours").writableColumns).toContain("hexCode");
    expect(getCommonMasterDefinition("sizes").writableColumns).toContain("sortOrder");
    expect(getCommonMasterDefinition("units").writableColumns).toContain("symbol");
  });

  it("publishes product attribute create events through the shared common master use case", async () => {
    const { publishedEvents, publisher } = createPublisher();
    const record = await new CreateCommonMasterRecordUseCase(
      createRepository(),
      publisher,
    ).execute("colours", {
      code: "RED",
      name: "Red",
      description: "Primary red",
      hexCode: "#ff0000",
      isActive: true,
    });

    expect(record.hexCode).toBe("#ff0000");
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-created");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "colours",
      code: "RED",
      name: "Red",
      isActive: true,
    });
  });

  it("publishes product attribute delete events with force mode", async () => {
    const { publishedEvents, publisher } = createPublisher();

    const wasDeleted = await new DeleteCommonMasterRecordUseCase(
      createRepository(createAttributeRecord({ code: "PCS", name: "Pieces" })),
      publisher,
    ).execute("units", "20", true);

    expect(wasDeleted).toBe(true);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-deleted");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "units",
      force: true,
    });
  });
});
