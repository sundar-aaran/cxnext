import { Module } from "@nestjs/common";
import { COMPANY_REPOSITORY } from "./application/services/company.repository";
import { GetCompanyUseCase } from "./application/use-cases/get-company.use-case";
import { ListCompaniesUseCase } from "./application/use-cases/list-companies.use-case";
import { KyselyCompanyRepository } from "./infrastructure/persistence/kysely-company.repository";
import { CompaniesController } from "./interface/http/companies.controller";

@Module({
  controllers: [CompaniesController],
  providers: [
    ListCompaniesUseCase,
    GetCompanyUseCase,
    {
      provide: COMPANY_REPOSITORY,
      useClass: KyselyCompanyRepository,
    },
  ],
})
export class CompaniesModule {}
