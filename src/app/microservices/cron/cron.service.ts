import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { ProductService } from '../../services/products.service';
import { CustomerService } from '../../services/customer.service';
import { OrdersService } from '../../services/orders.service';

@Injectable()
export class CronService {
  private logger = new Logger(CronService.name);
  constructor(
    private productService: ProductService,
    private customerService: CustomerService,
    private orderService: OrdersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCronAtMidnight() {
    this.logger.debug('Called everyday at midnight');
    //this.productService.syncGetProductsStores();
    // this.productService.standardizeProducts();
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  handleCronEvery2Hours() {
    this.logger.debug('Called everyday at 6PM');
    this.productService.syncGetProductsStores();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCrontEvery30Mins() {
    this.logger.debug('Called every 30 mins');
    await Promise.all([
      this.customerService.requestSyncCustomerFromCMS(),
      this.orderService.requestSyncOrders(),
      this.productService.reportTotalProductsInStores(),
    ]);
  }
  // @Timeout(5000)
  // standard() {
  //   this.productService.standardizeProducts();
  // }

  // @Timeout(5000)
  // standard() {
  //   this.productService.testSql();
  // }
}
