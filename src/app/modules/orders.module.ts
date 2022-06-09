import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderDocsRepository } from '../repositories/orderDocs.repository';
import { OrdersService } from '../services/orders.service';
import { OrderDetailsRepository } from '../repositories/orderDetails.repository';
import { OrderTransactionRepository } from '../repositories/orderTransactions.repository';
import { OrderDataRepository } from '../repositories/orderData.repository';
import { OrderController as OrderControllerBE } from '../controllers/be/v1/order.controller';
import { ProductsRepository } from '../repositories/products.repository';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { OrderIntegrationController } from '../controllers/integration/v1/order.controller';
import { OrderStatusModule } from './orderStatus.module';
import { OrdersController as OrdersControllerFE } from '../controllers/fe/v1/order.controller';
import { UsersModule } from './users.module';
import { StatusModule } from './status.module';
import { StoreModule } from './store.module';
import { CustomerModule } from './customer.module';
import { CartModule } from './cart.module';
import { OrderSyncController } from '../controllers/sync/v1/order.controller';
import { OrderHistoryRepository } from '../repositories/orderHistory.repository';
import { PromotionModule } from './promotion.module';
import { OrderPaymentRepository } from '../repositories/orderPayment.repository';
import { ProductsModule } from './products.module';
import { getUserFromToken } from '../../middlewares/getUserFromToken';
import { ShippingFeeService } from '../services/shippingFee.service';
import { ShippingFeeModule } from './shippingFee.module';
import { ShippingModule } from './shippings.module';
import { ShippingServiceRepository } from '../repositories/shippingsService.repository';
import { ShippingRepository } from '../repositories/shippings.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  controllers: [
    OrderControllerBE,
    OrderIntegrationController,
    OrdersControllerFE,
    OrderSyncController,
  ],
  providers: [
    OrdersService,
    OrdersRepository,
    OrderDocsRepository,
    OrderDetailsRepository,
    OrderTransactionRepository,
    OrderDataRepository,
    ProductsRepository,
    UserProfileRepository,
    OrderHistoryRepository,
    OrderPaymentRepository,
    ShippingServiceRepository,
    ShippingRepository,
  ],
  exports: [
    OrdersService,
    OrdersRepository,
    OrderDocsRepository,
    OrderDetailsRepository,
    OrderTransactionRepository,
    OrderDataRepository,
    UserProfileRepository,
    OrderHistoryRepository,
    OrderPaymentRepository,
  ],
  imports: [
    // ClientsModule.register([
    //   {
    //     name: 'ORDER_SERVICE',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: ['amqp://localhost:5672'],
    //       queue: 'orders',
    //       noAck: false,
    //       queueOptions: {
    //         durable: false,
    //       },
    //     },
    //   },
    // ]),
    OrderStatusModule,
    UsersModule,
    StatusModule,
    StoreModule,
    forwardRef(() => CustomerModule),
    CartModule,
    PromotionModule,
    ProductsModule,
    ShippingFeeModule,
    ShippingModule,
  ],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(getUserFromToken).forRoutes(OrdersControllerFE);
  }
}
