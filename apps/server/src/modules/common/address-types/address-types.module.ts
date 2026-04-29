import { Module } from "@nestjs/common";
import { AddressTypesController } from "./address-types.controller";
import { AddressTypesRepository } from "./address-types.repository";

@Module({
  controllers: [AddressTypesController],
  providers: [AddressTypesRepository],
})
export class AddressTypesModule {}
