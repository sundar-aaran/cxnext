import { Module } from "@nestjs/common";
import { UnitsController } from "./units.controller";
import { UnitsRepository } from "./units.repository";

@Module({
  controllers: [UnitsController],
  providers: [UnitsRepository],
})
export class UnitsModule {}
