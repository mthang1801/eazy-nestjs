import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from '../microservices/cron/cron.service';
import { ProductsModule } from './products.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ProductsModule,
  ],
  providers: [
    CronService,
  ],
})
export class CronModule {}
