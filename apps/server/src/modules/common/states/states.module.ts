import { Module } from "@nestjs/common";
import { CommonLocationRepository } from "../shared/common-location.repository";
import { StatesController } from "./states.controller";

@Module({
  controllers: [StatesController],
  providers: [CommonLocationRepository],
})
export class StatesModule {}
