import { Module } from "@nestjs/common";
import { TransportsController } from "./transports.controller";
import { TransportsRepository } from "./transports.repository";

@Module({
  controllers: [TransportsController],
  providers: [TransportsRepository],
})
export class TransportsModule {}
