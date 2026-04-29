import { Module } from "@nestjs/common";
import { ContactGroupsController } from "./contact-groups.controller";
import { ContactGroupsRepository } from "./contact-groups.repository";

@Module({
  controllers: [ContactGroupsController],
  providers: [ContactGroupsRepository],
})
export class ContactGroupsModule {}
