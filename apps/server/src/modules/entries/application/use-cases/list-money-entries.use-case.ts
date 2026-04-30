import { Inject, Injectable } from "@nestjs/common";
import type { MoneyEntryKind } from "../../domain/entry-record";
import { ENTRIES_REPOSITORY, type EntriesRepository } from "../services/entries.repository";

@Injectable()
export class ListMoneyEntriesUseCase {
  public constructor(
    @Inject(ENTRIES_REPOSITORY)
    private readonly entriesRepository: EntriesRepository,
  ) {}

  public execute(kind: MoneyEntryKind) {
    return this.entriesRepository.listMoney(kind);
  }
}
