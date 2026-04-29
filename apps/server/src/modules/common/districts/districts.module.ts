import { Module } from "@nestjs/common";
import { CommonLocationRepository } from "../shared/common-location.repository";
import { DistrictsController } from "./districts.controller";

@Module({
  controllers: [DistrictsController],
  providers: [CommonLocationRepository],
})
export class DistrictsModule {}
