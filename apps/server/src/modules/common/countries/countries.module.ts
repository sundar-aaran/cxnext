import { Module } from "@nestjs/common";
import { CommonLocationRepository } from "../shared/common-location.repository";
import { CountriesController } from "./countries.controller";

@Module({
  controllers: [CountriesController],
  providers: [CommonLocationRepository],
})
export class CountriesModule {}
