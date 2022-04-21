import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PaymentController } from '../controllers/be/v1/payment.controller';
import { PaymentService } from '../services/payment.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentDescriptionsRepository } from '../repositories/paymentDescription.repository';
import { CustomerService } from '../services/customer.service';
import { OrdersModule } from './orders.module';
import { CustomerModule } from './customer.module';
import { CartModule } from './cart.module';
import { PromotionModule } from './promotion.module';
import { UserRepository } from '../repositories/user.repository';
import { PaymentControllerFE } from '../controllers/fe/v1/payment.controller';
import { OrderPaymentRepository } from '../repositories/orderPayment.repository';
import { getUserFromToken } from '../../middlewares/getUserFromToken';
@Module({
  controllers: [PaymentController, PaymentControllerFE],
  providers: [
    PaymentService,
    PaymentRepository,
    PaymentDescriptionsRepository,
    UserRepository,
    OrderPaymentRepository,
  ],
  exports: [
    PaymentService,
    PaymentRepository,
    PaymentDescriptionsRepository,
    UserRepository,
    OrderPaymentRepository,
  ],
  imports: [CustomerModule, OrdersModule, CartModule, PromotionModule],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(getUserFromToken).forRoutes(PaymentControllerFE);
  }
}
