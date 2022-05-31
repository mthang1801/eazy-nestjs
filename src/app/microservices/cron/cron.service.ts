import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { DashboardService } from '../../services/dashboard.service';

@Injectable()
export class CronService {
  private logger = new Logger(CronService.name);
  constructor(
    private dashboardService: DashboardService,
  ) {}

  @Interval('test', 5000)
  handleInterval() {
    this.logger.debug('Called every 5s');
    this.dashboardService.getProductsAmountInStores('ASC');
    console.log('Called every 5s');
  }
}
