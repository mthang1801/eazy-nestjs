import { Module } from '@nestjs/common';
import { OrderStatusController } from '../controllers/be/orderStatus.controller';
import { OrderStatusService } from '../services/orderStatus.service';

import { OrderStatusRepository } from '../repositories/orderStatus.repository';
import { OrderStatusDataRepository } from '../repositories/orderStatusData.repository';
import { OrderStatusDescriptionRepository } from '../repositories/orderStatusDescription.repository';
@Module({
  controllers: [OrderStatusController],
  providers: [
    OrderStatusService,
    OrderStatusRepository,
    OrderStatusDataRepository,
    OrderStatusDescriptionRepository,
    String,
  ],
  exports: [OrderStatusService],
  imports: [],
})
export class OrderStatusModule {}
