import { Module } from "@nestjs/common";
import { StockRejectionTypesController } from "./stock-rejection-types.controller";
import { StockRejectionTypesRepository } from "./stock-rejection-types.repository";

@Module({
  controllers: [StockRejectionTypesController],
  providers: [StockRejectionTypesRepository],
})
export class StockRejectionTypesModule {}
