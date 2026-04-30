import { Inject, Injectable } from "@nestjs/common";
import { EntryAggregate } from "../../domain/aggregates/entry.aggregate";
import type { BillingEntryKind } from "../../domain/entry-record";
import {
  ENTRIES_DOMAIN_EVENT_PUBLISHER,
  type EntriesDomainEventPublisher,
} from "../services/domain-event-publisher";
import { ENTRIES_REPOSITORY, type EntriesRepository } from "../services/entries.repository";

@Injectable()
export class DeleteBillingEntryUseCase {
  public constructor(
    @Inject(ENTRIES_REPOSITORY)
    private readonly entriesRepository: EntriesRepository,
    @Inject(ENTRIES_DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: EntriesDomainEventPublisher,
  ) {}

  public async execute(kind: BillingEntryKind, entryId: string) {
    const wasDeleted = await this.entriesRepository.softDeleteBilling(kind, entryId);
    if (wasDeleted)
      await this.eventPublisher.publishAll([EntryAggregate.deletedEvent(kind, entryId)]);
    return wasDeleted;
  }
}
