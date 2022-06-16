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
  }

  @Cron(CronExpression.EVERY_6_HOURS)
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

  // @Timeout(60000)
  // standard0() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(0);
  //   }
  // }
  // @Timeout(60000*2)
  // standard3000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000);
  //   }
  // }
  // @Timeout(60000*3)
  // standard6000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000*2);
  //   }
  // }
  // @Timeout(60000*4)
  // standard9000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000*3);
  //   }
  // }
  // @Timeout(60000*5)
  // standard12000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000*4);
  //   }
  // }
  // @Timeout(60000*6)
  // standard15000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000*5);
  //   }
  // }
  // @Timeout(60000*7)
  // standard18000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000*6);
  //   }
  // }
  // @Timeout(60000*8)
  // standard21000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000*7);
  //   }
  // }
  // @Timeout(60000*9)
  // standard24000() {
  //   if (process.env.NODE_ENV != 'development') {
  //     this.productService.testSql(3000*8);
  //   }
  // }
}
