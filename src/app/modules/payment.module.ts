import { Module } from '@nestjs/common';
import { PaymentController } from '../controllers/be/v1/payment.controller';
import { PaymentService } from '../services/payment.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentDescriptionsRepository } from '../repositories/paymentDescription.repository';
@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    PaymentDescriptionsRepository,
    String,
  ],
  exports: [PaymentService],
  imports: [],
})
export class PaymentModule {}
