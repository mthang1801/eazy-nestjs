import { Module } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { DashboardController } from '../controllers/be/v1/dashboard.controller';
import { OrdersRepository } from '../repositories/orders.repository';
import { UserRepository } from '../repositories/user.repository';

@Module({
  providers: [DashboardService, OrdersRepository, UserRepository],
  exports: [DashboardService, OrdersRepository, UserRepository],
  controllers: [DashboardController],
})
export class DashboardModule {}
