import { Module } from "@nestjs/common";
import { ProductTypesController } from "./product-types.controller";
import { ProductTypesRepository } from "./product-types.repository";

@Module({
  controllers: [ProductTypesController],
  providers: [ProductTypesRepository],
})
export class ProductTypesModule {}
