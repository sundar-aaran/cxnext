import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateTenantUseCase } from "../../../apps/server/src/modules/tenants/application/use-cases/create-tenant.use-case";
import type { TenantRepository } from "../../../apps/server/src/modules/tenants/application/services/tenant.repository";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/tenants/application/services/domain-event-publisher";
import { TenantAggregate } from "../../../apps/server/src/modules/tenants/domain/aggregates/tenant.aggregate";

describe("CreateTenantUseCase", () => {
  it("persists the tenant and publishes the tenant-created domain event", async () => {
    const publishedEvents: DomainEvent[] = [];
    const tenant = TenantAggregate.create({
      id: "1",
      name: "Acme",
      slug: "acme",
      isActive: true,
      createdAt: new Date("2026-04-29T10:00:00.000Z"),
    });
    const repository: TenantRepository = {
      list: async () => [],
      getById: async () => null,
      create: async () => tenant,
      update: async () => null,
      softDelete: async () => false,
    };
    const publisher: DomainEventPublisher = {
      publishAll: async (events) => {
        publishedEvents.push(...events);
      },
    };

    const createdTenant = await new CreateTenantUseCase(repository, publisher).execute({
      name: "Acme",
      slug: "acme",
      isActive: true,
    });

    expect(createdTenant).toBe(tenant);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]?.eventName).toBe("tenants.tenant-created");
    expect(publishedEvents[0]?.aggregateId).toBe("1");
    expect(publishedEvents[0]?.payload).toEqual({
      name: "Acme",
      slug: "acme",
      isActive: true,
    });
  });
});
