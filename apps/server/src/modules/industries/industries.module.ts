import { Module } from "@nestjs/common";
import { INDUSTRY_REPOSITORY } from "./application/services/industry.repository";
import { GetIndustryUseCase } from "./application/use-cases/get-industry.use-case";
import { ListIndustriesUseCase } from "./application/use-cases/list-industries.use-case";
import { KyselyIndustryRepository } from "./infrastructure/persistence/kysely-industry.repository";
import { IndustriesController } from "./interface/http/industries.controller";

@Module({
  controllers: [IndustriesController],
  providers: [
    ListIndustriesUseCase,
    GetIndustryUseCase,
    {
      provide: INDUSTRY_REPOSITORY,
      useClass: KyselyIndustryRepository,
    },
  ],
})
export class IndustriesModule {}
