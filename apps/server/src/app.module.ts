import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { HealthModule } from "./common/health/health.module";
import { GraphqlFoundationModule } from "./common/graphql/graphql-foundation.module";
import { CoreModule } from "./core/core.module";
import { EventsModule } from "./events/events.module";

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
    CoreModule,
    EventsModule,
    GraphqlFoundationModule,
    HealthModule,
  ],
})
export class AppModule {}
