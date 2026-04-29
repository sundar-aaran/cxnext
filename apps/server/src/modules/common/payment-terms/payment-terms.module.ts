import { Module } from "@nestjs/common";
import { PaymentTermsController } from "./payment-terms.controller";
import { PaymentTermsRepository } from "./payment-terms.repository";

@Module({
  controllers: [PaymentTermsController],
  providers: [PaymentTermsRepository],
})
export class PaymentTermsModule {}
