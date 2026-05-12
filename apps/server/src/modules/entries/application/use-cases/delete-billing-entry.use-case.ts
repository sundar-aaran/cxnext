import { Inject, Injectable } from "@nestjs/common";
import { EntryAggregate } from "../../domain/aggregates/entry.aggregate";
import type { BillingEntryKind } from "../../domain/entry-record";
import {
  ENTRIES_DOMAIN_EVENT_PUBLISHER,
  type EntriesDomainEventPublisher,
} from "../services/domain-event-publisher";
import {
  ENTRIES_REPOSITORY,
  type EntriesRepository,
  type EntryContextCriteria,
} from "../services/entries.repository";

@Injectable()
export class DeleteBillingEntryUseCase {
  public constructor(
    @Inject(ENTRIES_REPOSITORY)
    private readonly entriesRepository: EntriesRepository,
    @Inject(ENTRIES_DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: EntriesDomainEventPublisher,
  ) {}

  public async execute(kind: BillingEntryKind, entryId: string, context: EntryContextCriteria) {
    const wasDeleted = await this.entriesRepository.softDeleteBilling(kind, entryId, context);
    if (wasDeleted)
      await this.eventPublisher.publishAll([EntryAggregate.deletedEvent(kind, entryId)]);
    return wasDeleted;
  }
}
