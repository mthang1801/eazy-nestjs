import { Controller, Get, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { ProductService } from '../../services/products.service';
@Controller('/report/v1/products')
export class ProductsReportController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }

  @Get('/total')
  async reportCountTotalFromStores(@Res() res: Response): Promise<IResponse> {
    await this.service.reportCountTotalFromStores();
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
