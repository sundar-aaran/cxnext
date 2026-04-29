import { Module } from "@nestjs/common";
import { ProductGroupsController } from "./product-groups.controller";
import { ProductGroupsRepository } from "./product-groups.repository";

@Module({
  controllers: [ProductGroupsController],
  providers: [ProductGroupsRepository],
})
export class ProductGroupsModule {}
