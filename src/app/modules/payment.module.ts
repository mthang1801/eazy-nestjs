import { Module } from '@nestjs/common';
import { PaymentController } from '../controllers/be/payment.controller';
import { PaymentService } from '../services/payment.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentDescriptionsRepository } from '../repositories/payment-description.repository';
@Module({
  controllers: [PaymentController],
  providers: [PaymentService,PaymentRepository,PaymentDescriptionsRepository,String],
  exports: [PaymentService],
  imports :[],

})
export class PaymentModule {}