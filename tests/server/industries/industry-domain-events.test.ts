import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateIndustryUseCase } from "../../../apps/server/src/modules/industries/application/use-cases/create-industry.use-case";
import { DeleteIndustryUseCase } from "../../../apps/server/src/modules/industries/application/use-cases/delete-industry.use-case";
import { UpdateIndustryUseCase } from "../../../apps/server/src/modules/industries/application/use-cases/update-industry.use-case";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/industries/application/services/domain-event-publisher";
import type { IndustryRepository } from "../../../apps/server/src/modules/industries/application/services/industry.repository";
import type { IndustryRecord } from "../../../apps/server/src/modules/industries/domain/industry-record";

const industryRecord: IndustryRecord = {
  id: "industry-1",
  name: "Retail",
  isActive: true,
  createdAt: new Date("2026-04-30T00:00:00.000Z"),
  updatedAt: new Date("2026-04-30T00:00:00.000Z"),
  deletedAt: null,
};

function repository(overrides: Partial<IndustryRepository> = {}): IndustryRepository {
  return {
    list: async () => [],
    getById: async () => null,
    create: async () => industryRecord,
    update: async () => industryRecord,
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

describe("industry write use cases", () => {
  it("publishes industry-created after create persistence succeeds", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new CreateIndustryUseCase(repository(), publisher(publishedEvents)).execute({
      name: "Retail",
      isActive: true,
    });

    expect(publishedEvents[0]?.eventName).toBe("industries.industry-created");
    expect(publishedEvents[0]?.aggregateId).toBe("industry-1");
  });

  it("publishes industry-updated only when a record is updated", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new UpdateIndustryUseCase(repository(), publisher(publishedEvents)).execute("industry-1", {
      name: "Retail",
      isActive: true,
    });

    await new UpdateIndustryUseCase(
      repository({ update: async () => null }),
      publisher(publishedEvents),
    ).execute("missing", {
      name: "Missing",
      isActive: false,
    });

    expect(publishedEvents.map((event) => event.eventName)).toEqual([
      "industries.industry-updated",
    ]);
  });

  it("publishes industry-deleted only after a successful soft delete", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new DeleteIndustryUseCase(repository(), publisher(publishedEvents)).execute("industry-1");
    await new DeleteIndustryUseCase(
      repository({ softDelete: async () => false }),
      publisher(publishedEvents),
    ).execute("missing");

    expect(publishedEvents.map((event) => event.eventName)).toEqual([
      "industries.industry-deleted",
    ]);
  });
});
