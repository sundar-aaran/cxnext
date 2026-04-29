import { Module } from "@nestjs/common";
import { WarehousesController } from "./warehouses.controller";
import { WarehousesRepository } from "./warehouses.repository";

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesRepository],
})
export class WarehousesModule {}
