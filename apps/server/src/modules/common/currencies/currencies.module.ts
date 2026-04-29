import { Module } from "@nestjs/common";
import { CurrenciesController } from "./currencies.controller";
import { CurrenciesRepository } from "./currencies.repository";

@Module({
  controllers: [CurrenciesController],
  providers: [CurrenciesRepository],
})
export class CurrenciesModule {}
