import { Module } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderDocsRepository } from '../repositories/orderDocs.repository';
import { OrdersService } from '../services/orders.service';
import { OrderDetailsRepository } from '../repositories/orderDetails.repository';
import { OrderTransactionRepository } from '../repositories/orderTransactions.repository';
import { OrderDataRepository } from '../repositories/orderData.repository';

@Module({
  providers: [
    OrdersService,
    OrdersRepository,
    OrderDocsRepository,
    OrderDetailsRepository,
    OrderTransactionRepository,
    OrderDataRepository,
  ],
  exports: [
    OrdersService,
    OrdersRepository,
    OrderDocsRepository,
    OrderDetailsRepository,
    OrderTransactionRepository,
    OrderDataRepository,
  ],
})
export class OrdersModule {}
