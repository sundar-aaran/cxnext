import type { DomainEvent } from "@cxnext/core";
import { describe, expect, it } from "vitest";
import type { DomainEventPublisher } from "../../../apps/server/src/modules/common/application/services/domain-event-publisher";
import type { CommonLocationRepository } from "../../../apps/server/src/modules/common/application/services/common-location.repository";
import { CreateCommonLocationRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/location/create-common-location-record.use-case";
import { DeleteCommonLocationRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/location/delete-common-location-record.use-case";
import { UpdateCommonLocationRecordUseCase } from "../../../apps/server/src/modules/common/application/use-cases/location/update-common-location-record.use-case";
import type { CommonLocationRecord } from "../../../apps/server/src/modules/common/domain/entities/common-location-record";

class CapturingDomainEventPublisher implements DomainEventPublisher {
  public readonly events: DomainEvent[] = [];

  public async publishAll(events: readonly DomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

class FakeCommonLocationRepository implements CommonLocationRepository {
  private readonly record: CommonLocationRecord = {
    id: 7,
    countryId: null,
    stateId: null,
    districtId: null,
    cityId: null,
    code: "IN",
    name: "India",
    phoneCode: "91",
    areaName: null,
    isActive: true,
    createdAt: new Date("2026-04-30T00:00:00.000Z"),
    updatedAt: new Date("2026-04-30T00:00:00.000Z"),
    deletedAt: null,
  };

  public async list(): Promise<readonly CommonLocationRecord[]> {
    return [this.record];
  }

  public async getById(): Promise<CommonLocationRecord | null> {
    return this.record;
  }

  public async create(): Promise<CommonLocationRecord> {
    return this.record;
  }

  public async update(): Promise<CommonLocationRecord | null> {
    return this.record;
  }

  public async softDelete(): Promise<boolean> {
    return true;
  }
}

describe("common location use cases", () => {
  it("publishes a domain event after creating a location record", async () => {
    const publisher = new CapturingDomainEventPublisher();
    const useCase = new CreateCommonLocationRecordUseCase(
      new FakeCommonLocationRepository(),
      publisher,
    );

    await useCase.execute("countries", {
      code: "IN",
      name: "India",
      phoneCode: "91",
      isActive: true,
    });

    expect(publisher.events).toHaveLength(1);
    expect(publisher.events[0]?.eventName).toBe("common.location-record-created");
    expect(publisher.events[0]?.payload).toMatchObject({
      moduleKey: "countries",
      code: "IN",
      name: "India",
      isActive: true,
    });
  });

  it("publishes update and delete domain events after successful writes", async () => {
    const publisher = new CapturingDomainEventPublisher();
    const repository = new FakeCommonLocationRepository();
    const updateUseCase = new UpdateCommonLocationRecordUseCase(repository, publisher);
    const deleteUseCase = new DeleteCommonLocationRecordUseCase(repository, publisher);

    await updateUseCase.execute("states", "7", {
      code: "TN",
      name: "Tamil Nadu",
      isActive: true,
    });
    await deleteUseCase.execute("states", "7");

    expect(publisher.events.map((event) => event.eventName)).toEqual([
      "common.location-record-updated",
      "common.location-record-deleted",
    ]);
  });
});
