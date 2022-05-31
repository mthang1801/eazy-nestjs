import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { ProductService } from '../../services/products.service';

@Injectable()
export class CronService {
  private logger = new Logger(CronService.name);
  constructor(private productService: ProductService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    this.logger.debug('Called everyday at midnight');
    this.productService.syncGetProductsStores();
  }
}
