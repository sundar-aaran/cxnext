import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
  type CompanyUpsertParams,
} from "../services/company.repository";

@Injectable()
export class CreateCompanyUseCase {
  public constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  public execute(params: CompanyUpsertParams) {
    return this.companyRepository.create(params);
  }
}
