import { Module } from "@nestjs/common";
import { SizesController } from "./sizes.controller";
import { SizesRepository } from "./sizes.repository";

@Module({
  controllers: [SizesController],
  providers: [SizesRepository],
})
export class SizesModule {}
