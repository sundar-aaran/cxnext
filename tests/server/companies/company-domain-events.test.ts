import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateCompanyUseCase } from "../../../apps/server/src/modules/companies/application/use-cases/create-company.use-case";
import { DeleteCompanyUseCase } from "../../../apps/server/src/modules/companies/application/use-cases/delete-company.use-case";
import { UpdateCompanyUseCase } from "../../../apps/server/src/modules/companies/application/use-cases/update-company.use-case";
import type { CompanyRepository } from "../../../apps/server/src/modules/companies/application/services/company.repository";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/companies/application/services/domain-event-publisher";
import type { CompanyRecord } from "../../../apps/server/src/modules/companies/domain/company-record";

const companyRecord: CompanyRecord = {
  id: "company-1",
  tenantId: "tenant-1",
  tenantName: "Acme Tenant",
  industryId: "industry-1",
  industryName: "Retail",
  name: "Acme Company",
  legalName: null,
  tagline: null,
  shortAbout: null,
  registrationNumber: null,
  pan: null,
  financialYearStart: null,
  booksStart: null,
  website: null,
  description: null,
  primaryEmail: null,
  primaryPhone: null,
  isPrimary: true,
  isActive: true,
  createdAt: new Date("2026-04-30T00:00:00.000Z"),
  updatedAt: new Date("2026-04-30T00:00:00.000Z"),
  deletedAt: null,
  logos: [],
  addresses: [],
  emails: [],
  phones: [],
  bankAccounts: [],
};

function repository(overrides: Partial<CompanyRepository> = {}): CompanyRepository {
  return {
    list: async () => [],
    getById: async () => null,
    create: async () => companyRecord,
    update: async () => companyRecord,
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

describe("company write use cases", () => {
  it("publishes company-created after create persistence succeeds", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new CreateCompanyUseCase(repository(), publisher(publishedEvents)).execute({
      tenantId: 1,
      industryId: 1,
      name: "Acme Company",
      isPrimary: true,
      isActive: true,
    });

    expect(publishedEvents[0]?.eventName).toBe("companies.company-created");
    expect(publishedEvents[0]?.aggregateId).toBe("company-1");
  });

  it("publishes company-updated only when a record is updated", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new UpdateCompanyUseCase(repository(), publisher(publishedEvents)).execute("company-1", {
      tenantId: 1,
      industryId: 1,
      name: "Acme Company",
      isPrimary: true,
      isActive: true,
    });

    await new UpdateCompanyUseCase(
      repository({ update: async () => null }),
      publisher(publishedEvents),
    ).execute("missing", {
      tenantId: 1,
      industryId: 1,
      name: "Missing Company",
      isPrimary: false,
      isActive: false,
    });

    expect(publishedEvents.map((event) => event.eventName)).toEqual([
      "companies.company-updated",
    ]);
  });

  it("publishes company-deleted only after a successful soft delete", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new DeleteCompanyUseCase(repository(), publisher(publishedEvents)).execute("company-1");
    await new DeleteCompanyUseCase(
      repository({ softDelete: async () => false }),
      publisher(publishedEvents),
    ).execute("missing");

    expect(publishedEvents.map((event) => event.eventName)).toEqual([
      "companies.company-deleted",
    ]);
  });
});
