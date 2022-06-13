import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from '../microservices/cron/cron.service';
import { CustomerModule } from './customer.module';
import { OrdersModule } from './orders.module';
import { ProductsModule } from './products.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ProductsModule,
    CustomerModule,
    OrdersModule,
  ],
  providers: [CronService],
})
export class CronModule {}
