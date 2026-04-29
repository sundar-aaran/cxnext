import { Module } from "@nestjs/common";
import { GetTenantUseCase } from "./application/use-cases/get-tenant.use-case";
import { ListTenantsUseCase } from "./application/use-cases/list-tenants.use-case";
import { TENANT_REPOSITORY } from "./application/services/tenant.repository";
import { KyselyTenantRepository } from "./infrastructure/persistence/kysely-tenant.repository";
import { TenantsResolver } from "./interface/graphql/tenants.resolver";
import { TenantsController } from "./interface/http/tenants.controller";
import { TenantsRegistryBootstrap } from "./tenants.registry";

@Module({
  controllers: [TenantsController],
  providers: [
    TenantsRegistryBootstrap,
    ListTenantsUseCase,
    GetTenantUseCase,
    TenantsResolver,
    {
      provide: TENANT_REPOSITORY,
      useClass: KyselyTenantRepository,
    },
  ],
})
export class TenantsModule {}
