import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { HealthModule } from "./common/health/health.module";
import { GraphqlFoundationModule } from "./common/graphql/graphql-foundation.module";
import { CoreModule } from "./core/core.module";
import { EventsModule } from "./events/events.module";
import { CompaniesModule } from "./modules/companies/companies.module";
import { CommonModule } from "./modules/common/common.module";
import { IndustriesModule } from "./modules/industries/industries.module";
import { TenantsModule } from "./modules/tenants/tenants.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
    }),
    CompaniesModule,
    CommonModule,
    CoreModule,
    EventsModule,
    IndustriesModule,
    TenantsModule,
    GraphqlFoundationModule,
    HealthModule,
  ],
})
export class AppModule {}
