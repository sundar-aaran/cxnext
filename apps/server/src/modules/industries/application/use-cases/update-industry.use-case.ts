import { Inject, Injectable } from "@nestjs/common";
import {
  INDUSTRY_REPOSITORY,
  type IndustryRepository,
  type IndustryUpsertParams,
} from "../services/industry.repository";

@Injectable()
export class UpdateIndustryUseCase {
  public constructor(
    @Inject(INDUSTRY_REPOSITORY)
    private readonly industryRepository: IndustryRepository,
  ) {}

  public execute(industryId: string, params: IndustryUpsertParams) {
    return this.industryRepository.update(industryId, params);
  }
}
