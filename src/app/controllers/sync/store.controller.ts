import { Controller, Get, Res, Post } from '@nestjs/common';
import { StoreService } from 'src/app/services/store.service';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';

@Controller('/sync/v1/stores')
export class StoreSyncController extends BaseController {
  constructor(private service: StoreService) {
    super();
  }

  @Get('products-count')
  async getProductCount(@Res() res: Response) {
    await this.service.getProductCount();
    return this.responseSuccess(res, null, 'Thành công');
  }

  @Post('import')
  async import(@Res() res: Response) {
    await this.service.importStores();
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
