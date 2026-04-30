import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/create-common-master-record.use-case";
import { DeleteCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/delete-common-master-record.use-case";
import { UpdateCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/update-common-master-record.use-case";
import type { CommonMasterRepository } from "../../../apps/server/src/modules/common/application/services/common-master.repository";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/common/application/services/domain-event-publisher";
import type { CommonMasterRecord } from "../../../apps/server/src/modules/common/domain/entities/common-master-record";

const timestamp = new Date("2026-04-30T10:00:00.000Z");

function createRecord(overrides: Partial<CommonMasterRecord> = {}): CommonMasterRecord {
  return {
    id: 1,
    code: "CUSTOMER",
    name: "Customer",
    description: "Customer contacts",
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

describe("common contact master use cases", () => {
  it("publishes a create event after persistence", async () => {
    const { publishedEvents, publisher } = createPublisher();
    const record = await new CreateCommonMasterRecordUseCase(
      createRepository(),
      publisher,
    ).execute("contactTypes", {
      code: "CUSTOMER",
      name: "Customer",
      description: "Customer contacts",
      isActive: true,
    });

    expect(record.id).toBe(1);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-created");
    expect(publishedEvents[0]?.aggregateId).toBe("1");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "contactTypes",
      code: "CUSTOMER",
      name: "Customer",
      isActive: true,
    });
  });

  it("publishes an update event only when a record is updated", async () => {
    const { publishedEvents, publisher } = createPublisher();
    const repository = createRepository(createRecord({ name: "Supplier" }));

    const record = await new UpdateCommonMasterRecordUseCase(repository, publisher).execute(
      "contactTypes",
      "1",
      {
        code: "SUPPLIER",
        name: "Supplier",
        description: "Supplier contacts",
        isActive: true,
      },
    );

    expect(record?.name).toBe("Supplier");
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-updated");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "contactTypes",
      code: "CUSTOMER",
      name: "Supplier",
      isActive: true,
    });
  });

  it("publishes a delete event with the selected delete mode", async () => {
    const { publishedEvents, publisher } = createPublisher();

    const wasDeleted = await new DeleteCommonMasterRecordUseCase(
      createRepository(),
      publisher,
    ).execute("bankNames", "1", true);

    expect(wasDeleted).toBe(true);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-deleted");
    expect(publishedEvents[0]?.aggregateId).toBe("1");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "bankNames",
      force: true,
    });
  });
});
