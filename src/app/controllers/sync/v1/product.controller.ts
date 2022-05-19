import { Controller, Get, Res, Post } from '@nestjs/common';
import { ProductService } from 'src/app/services/products.service';
import { BaseController } from '../../../../base/base.controllers';

@Controller('/sync/v1/products')
export class ProductSyncController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }
  @Get('/products-stores')
  async getProductsAmountFromStores(@Res() res) {
    await this.service.getProductsAmountFromStores();
    return this.responseSuccess(res);
  }

  @Get('/utils')
  async utilFunctions(@Res() res) {
    await this.service.utilFunctions();
    return this.responseSuccess(res);
  }

  @Get('/stocks-amount')
  async importProductStocksAmount(@Res() res) {
    await this.service.syncGetProductsStores();
    return this.responseSuccess(res);
  }

  @Get('/import')
  async importProducts(@Res() res) {
    await this.service.importProducts();
    return this.responseSuccess(res);
  }

  @Get('/magentor')
  async migrateProductFromMagentor(@Res() res) {
    await this.service.migrateProductFromMagentor();
    return this.responseSuccess(res);
  }
}
