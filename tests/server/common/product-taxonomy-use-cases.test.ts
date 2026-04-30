import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/create-common-master-record.use-case";
import { DeleteCommonMasterRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/contact-masters/delete-common-master-record.use-case";
import type { CommonMasterRepository } from "../../../apps/server/src/modules/common/application/services/common-master.repository";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/common/application/services/domain-event-publisher";
import type { CommonMasterRecord } from "../../../apps/server/src/modules/common/domain/entities/common-master-record";
import { getCommonMasterDefinition } from "../../../apps/server/src/modules/common/domain/value-objects/common-master-definition";

const timestamp = new Date("2026-04-30T11:00:00.000Z");

function createCategoryRecord(): CommonMasterRecord {
  return {
    id: 10,
    code: "SHIRTS",
    name: "Shirts",
    description: "Top wear",
    image: "shirts.jpg",
    positionOrder: 7,
    showOnStorefrontTopMenu: true,
    showOnStorefrontCatalog: true,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
}

function createRepository(record = createCategoryRecord()): CommonMasterRepository {
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

describe("common product taxonomy use cases", () => {
  it("keeps product category storefront fields in the definition", () => {
    expect(getCommonMasterDefinition("productCategories").writableColumns).toEqual([
      "code",
      "name",
      "description",
      "image",
      "positionOrder",
      "showOnStorefrontTopMenu",
      "showOnStorefrontCatalog",
      "isActive",
    ]);
  });

  it("publishes product taxonomy create events through the shared common master use case", async () => {
    const { publishedEvents, publisher } = createPublisher();
    const record = await new CreateCommonMasterRecordUseCase(
      createRepository(),
      publisher,
    ).execute("productCategories", {
      code: "SHIRTS",
      name: "Shirts",
      description: "Top wear",
      image: "shirts.jpg",
      positionOrder: 7,
      showOnStorefrontTopMenu: true,
      showOnStorefrontCatalog: true,
      isActive: true,
    });

    expect(record.positionOrder).toBe(7);
    expect(record.showOnStorefrontCatalog).toBe(true);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-created");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "productCategories",
      code: "SHIRTS",
      name: "Shirts",
      isActive: true,
    });
  });

  it("publishes product taxonomy delete events with force mode", async () => {
    const { publishedEvents, publisher } = createPublisher();

    const wasDeleted = await new DeleteCommonMasterRecordUseCase(
      createRepository(),
      publisher,
    ).execute("productTypes", "10", true);

    expect(wasDeleted).toBe(true);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("common.master-record-deleted");
    expect(publishedEvents[0]?.payload).toEqual({
      moduleKey: "productTypes",
      force: true,
    });
  });
});
