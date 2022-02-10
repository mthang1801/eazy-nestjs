import { Module } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderDocsRepository } from '../repositories/order_docs.repository';
import { OrdersService } from '../services/orders.service';
import { OrderDetailsRepository } from '../repositories/order_details.repository';
import { OrderTransactionRepository } from '../repositories/order_transactions.repository';
import { OrderDataRepository } from '../repositories/order_data.repository';

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
