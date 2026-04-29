import { Module } from "@nestjs/common";
import { CommonLocationRepository } from "../shared/common-location.repository";
import { PincodesController } from "./pincodes.controller";

@Module({
  controllers: [PincodesController],
  providers: [CommonLocationRepository],
})
export class PincodesModule {}
