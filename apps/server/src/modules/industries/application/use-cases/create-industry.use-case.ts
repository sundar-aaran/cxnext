import { Inject, Injectable } from "@nestjs/common";
import {
  INDUSTRY_REPOSITORY,
  type IndustryRepository,
  type IndustryUpsertParams,
} from "../services/industry.repository";

@Injectable()
export class CreateIndustryUseCase {
  public constructor(
    @Inject(INDUSTRY_REPOSITORY)
    private readonly industryRepository: IndustryRepository,
  ) {}

  public execute(params: IndustryUpsertParams) {
    return this.industryRepository.create(params);
  }
}
