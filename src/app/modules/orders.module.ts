import { Module } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderDocsRepository } from '../repositories/orderDocs.repository';
import { OrdersService } from '../services/orders.service';
import { OrderDetailsRepository } from '../repositories/orderDetails.repository';
import { OrderTransactionRepository } from '../repositories/orderTransactions.repository';
import { OrderDataRepository } from '../repositories/orderData.repository';
import { OrderController as OrderControllerBE } from '../controllers/be/order.controller';
import { ProductsRepository } from '../repositories/products.repository';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { OrderIntegrationController } from '../controllers/integration/order.controller';
import { OrderStatusModule } from './orderStatus.module';
import { OrdersController as OrdersControllerFE } from '../controllers/fe/order.controllers';
import { UsersModule } from './users.module';
import { StatusModule } from './status.module';
import { StoreModule } from './store.module';
@Module({
  controllers: [
    OrderControllerBE,
    OrderIntegrationController,
    OrdersControllerFE,
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
  ],
  exports: [
    OrdersService,
    OrdersRepository,
    OrderDocsRepository,
    OrderDetailsRepository,
    OrderTransactionRepository,
    OrderDataRepository,
    UserProfileRepository,
  ],
  imports: [OrderStatusModule, UsersModule, StatusModule, StoreModule],
})
export class OrdersModule {}
