import { Module } from "@nestjs/common";
import { HsnCodesController } from "./hsn-codes.controller";
import { HsnCodesRepository } from "./hsn-codes.repository";

@Module({
  controllers: [HsnCodesController],
  providers: [HsnCodesRepository],
})
export class HsnCodesModule {}
