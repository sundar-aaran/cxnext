import { Module } from "@nestjs/common";
import { StylesController } from "./styles.controller";
import { StylesRepository } from "./styles.repository";

@Module({
  controllers: [StylesController],
  providers: [StylesRepository],
})
export class StylesModule {}
