import { Module } from "@nestjs/common";
import { ContactTypesController } from "./contact-types.controller";
import { ContactTypesRepository } from "./contact-types.repository";

@Module({
  controllers: [ContactTypesController],
  providers: [ContactTypesRepository],
})
export class ContactTypesModule {}
