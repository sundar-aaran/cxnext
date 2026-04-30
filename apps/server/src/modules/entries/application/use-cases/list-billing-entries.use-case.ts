import { Inject, Injectable } from "@nestjs/common";
import type { BillingEntryKind } from "../../domain/entry-record";
import { ENTRIES_REPOSITORY, type EntriesRepository } from "../services/entries.repository";

@Injectable()
export class ListBillingEntriesUseCase {
  public constructor(
    @Inject(ENTRIES_REPOSITORY)
    private readonly entriesRepository: EntriesRepository,
  ) {}

  public execute(kind: BillingEntryKind) {
    return this.entriesRepository.listBilling(kind);
  }
}
