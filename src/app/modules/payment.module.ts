import { Module } from '@nestjs/common';
import { PaymentController } from '../controllers/be/payment.controller';
import { PaymentService } from '../services/payment.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentDescriptionsRepository } from '../repositories/payment-description.repository';
import { PaymentDescriptionService } from '../services/payment_description.service';
@Module({
  controllers: [PaymentController],
  providers: [PaymentService,PaymentRepository,PaymentDescriptionService,PaymentDescriptionsRepository,String],
  exports: [PaymentService,PaymentDescriptionService],
  imports :[],

})
export class PaymentModule {}