import { Module } from "@nestjs/common";
import { ColoursController } from "./colours.controller";
import { ColoursRepository } from "./colours.repository";

@Module({
  controllers: [ColoursController],
  providers: [ColoursRepository],
})
export class ColoursModule {}
