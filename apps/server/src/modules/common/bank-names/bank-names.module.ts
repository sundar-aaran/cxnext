import { Module } from "@nestjs/common";
import { BankNamesController } from "./bank-names.controller";
import { BankNamesRepository } from "./bank-names.repository";

@Module({
  controllers: [BankNamesController],
  providers: [BankNamesRepository],
})
export class BankNamesModule {}
