import { Inject, Injectable } from "@nestjs/common";
import { EntryAggregate } from "../../domain/aggregates/entry.aggregate";
import type { BillingEntryKind } from "../../domain/entry-record";
import {
  ENTRIES_DOMAIN_EVENT_PUBLISHER,
  type EntriesDomainEventPublisher,
} from "../services/domain-event-publisher";
import {
  ENTRIES_REPOSITORY,
  type BillingEntryInput,
  type EntriesRepository,
} from "../services/entries.repository";

@Injectable()
export class CreateBillingEntryUseCase {
  public constructor(
    @Inject(ENTRIES_REPOSITORY)
    private readonly entriesRepository: EntriesRepository,
    @Inject(ENTRIES_DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: EntriesDomainEventPublisher,
  ) {}

  public async execute(kind: BillingEntryKind, input: BillingEntryInput) {
    const entry = await this.entriesRepository.createBilling(kind, input);
    await this.eventPublisher.publishAll([EntryAggregate.fromRecord(entry).createdEvent()]);
    return entry;
  }
}
