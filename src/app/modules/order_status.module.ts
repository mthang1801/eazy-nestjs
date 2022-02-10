import { Module } from '@nestjs/common';
import { OrderStatusController } from '../controllers/be/order_status.controller';
import { OrderStatusService } from '../services/order_status.service';

import { OrderStatusRepository } from '../repositories/order_status.repository';
import { OrderStatusDataRepository } from '../repositories/order_status_data.repository';
import { OrderStatusDescriptionRepository } from '../repositories/order_status_description.repository';
@Module({
  controllers: [OrderStatusController],
  providers: [OrderStatusService,OrderStatusRepository,OrderStatusDataRepository,OrderStatusDescriptionRepository,String],
  exports: [OrderStatusService,],
  imports :[],

})
export class OrderStatusModule {}