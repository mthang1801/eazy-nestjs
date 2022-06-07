import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { ProductService } from '../../services/products.service';

@Injectable()
export class CronService {
  private logger = new Logger(CronService.name);
  constructor(private productService: ProductService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCronAtMidnight() {
    this.logger.debug('Called everyday at midnight');
    //this.productService.syncGetProductsStores();
    this.productService.standardizeProducts();
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  handleCronAtNoon() {
    this.logger.debug('Called everyday at noon');
    this.productService.syncGetProductsStores();
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  handleCronAt6PM() {
    this.logger.debug('Called everyday at 6PM');
    this.productService.syncGetProductsStores();
  }

  @Timeout(5000)
  standard() {
    this.productService.standardizeProducts();
  }
}
