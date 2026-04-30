import { Module } from "@nestjs/common";
import {
  COMPANY_INDUSTRY_NAME_LOOKUP,
  COMPANY_TENANT_NAME_LOOKUP,
} from "./application/services/company-reference-lookup";
import { COMPANY_REPOSITORY } from "./application/services/company.repository";
import { GetCompanyUseCase } from "./application/use-cases/get-company.use-case";
import { ListCompaniesUseCase } from "./application/use-cases/list-companies.use-case";
import { KyselyIndustryNameLookup } from "./infrastructure/adapters/kysely-industry-name-lookup";
import { KyselyTenantNameLookup } from "./infrastructure/adapters/kysely-tenant-name-lookup";
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
    {
      provide: COMPANY_TENANT_NAME_LOOKUP,
      useClass: KyselyTenantNameLookup,
    },
    {
      provide: COMPANY_INDUSTRY_NAME_LOOKUP,
      useClass: KyselyIndustryNameLookup,
    },
  ],
})
export class CompaniesModule {}
