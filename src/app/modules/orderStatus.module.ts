import { Module } from '@nestjs/common';
import { OrderStatusController } from '../controllers/be/v1/orderStatus.controller';
import { OrderStatusService } from '../services/orderStatus.service';

import { OrderStatusRepository } from '../repositories/orderStatus.repository';
import { OrderStatusDescriptionRepository } from '../repositories/orderStatusDescription.repository';
@Module({
  controllers: [OrderStatusController],
  providers: [
    OrderStatusService,
    OrderStatusRepository,
    OrderStatusDescriptionRepository,
    String,
  ],
  exports: [OrderStatusService],
  imports: [],
})
export class OrderStatusModule {}
