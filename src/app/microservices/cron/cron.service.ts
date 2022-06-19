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

  @Timeout('remove-all-index', 1000)
  async removeAllIndex() {
    if (process.env.ENVIRONMENT != 'development') {
      // await this.productService.removeAllIndex();
    }
  }

  @Timeout('setting-shards', 6000)
  async settingShards() {
    // await this.productService.settingShards();
  }

  @Timeout('sync-to-elastic-search', 15000)
  async syncToElasticSearch() {
    if (process.env.ENVIRONMENT != 'development') {
      await this.productService.syncToElasticSearch();
    }
  }
}
