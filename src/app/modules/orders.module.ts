import { forwardRef, Module } from '@nestjs/common';
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
import { OrdersController as OrdersControllerFE } from '../controllers/fe/order.controller';
import { UsersModule } from './users.module';
import { StatusModule } from './status.module';
import { StoreModule } from './store.module';
import { CustomerModule } from './customer.module';
import { CartModule } from './cart.module';
import { OrderSyncController } from '../controllers/sync/order.controller';
import { OrderHistoryRepository } from '../repositories/orderHistory.repository';
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
  ],
  imports: [
    OrderStatusModule,
    UsersModule,
    StatusModule,
    StoreModule,
    forwardRef(() => CustomerModule),
    CartModule,
  ],
})
export class OrdersModule {}
