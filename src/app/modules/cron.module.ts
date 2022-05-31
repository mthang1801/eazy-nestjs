import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from '../microservices/cron/cron.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardModule } from './dashboard.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    DashboardModule,
  ],
  providers: [
    CronService,
  ],
})
export class CronModule {}
