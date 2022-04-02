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

  /**
   * Đếm tổng số Sp trong cửa hàng
   * @param res
   * @returns
   */
  @Get('/checksum-in-stocks')
  async reportTotalProductsInStores(@Res() res: Response): Promise<IResponse> {
    await this.service.reportTotalProductsInStores();
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get('/categories')
  async reportCountTotalFromCategories(
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.reportCountTotalFromCategories();
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
