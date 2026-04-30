import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
  type CompanyUpsertParams,
} from "../services/company.repository";

@Injectable()
export class UpdateCompanyUseCase {
  public constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  public execute(companyId: string, params: CompanyUpsertParams) {
    return this.companyRepository.update(companyId, params);
  }
}
