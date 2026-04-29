import { Module } from "@nestjs/common";
import { ProductCategoriesController } from "./product-categories.controller";
import { ProductCategoriesRepository } from "./product-categories.repository";

@Module({
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesRepository],
})
export class ProductCategoriesModule {}
