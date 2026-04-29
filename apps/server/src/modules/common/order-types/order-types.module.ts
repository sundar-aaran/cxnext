import { Module } from "@nestjs/common";
import { OrderTypesController } from "./order-types.controller";
import { OrderTypesRepository } from "./order-types.repository";

@Module({
  controllers: [OrderTypesController],
  providers: [OrderTypesRepository],
})
export class OrderTypesModule {}
