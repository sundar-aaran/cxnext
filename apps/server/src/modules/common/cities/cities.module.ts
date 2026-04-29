import { Module } from "@nestjs/common";
import { CommonLocationRepository } from "../shared/common-location.repository";
import { CitiesController } from "./cities.controller";

@Module({
  controllers: [CitiesController],
  providers: [CommonLocationRepository],
})
export class CitiesModule {}
