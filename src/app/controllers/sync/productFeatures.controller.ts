import { Controller, Get, Res, Post } from '@nestjs/common';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { ProductFeatureService } from '../../services/productFeature.service';
import { BaseController } from '../../../base/base.controllers';
@Controller('/sync/v1/product-features')
export class ProductFeatureSyncController extends BaseController {
  constructor(private service: ProductFeatureService) {
    super();
  }
  @Get()
  async import(@Res() res: Response): Promise<IResponse> {
    await this.service.syncImports();
    return this.responseSuccess(res, null, 'Thành công');
  }

  @Post()
  async callSync(@Res() res: Response): Promise<IResponse> {
    await this.service.callSync();
    return this.responseSuccess(res, null, 'Thành công');
  }
}
