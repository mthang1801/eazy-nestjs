import { Controller, Get, Query, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { DashboardService } from '../../../services/dashboard.service';
import { Response } from 'express';
@Controller('/be/v1/dashboard')
export class DashboardController extends BaseController {
  constructor(private service: DashboardService) {
    super();
  }

  @Get('overview')
  async getReportOverview(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getReportOverview();
    return this.responseSuccess(res, result);
  }

  @Get('orders-customers')
  async getNumberOrdersMonthly(
    @Res() res: Response,
    @Query('year') year,
  ): Promise<IResponse> {
    const result = await this.service.getOrdersCustomers(year);
    return this.responseSuccess(res, result);
  }

  @Get('/stores')
  async getProductAmountInStores(
    @Res() res: Response,
    @Query('sortBy') sortBy: number,
  ): Promise<IResponse> {
    const result = await this.service.getProductsAmountInStores(sortBy);
    return this.responseSuccess(res, result);
  }

  @Get('/products')
  async getProductsBestSeller(
    @Res() res: Response,
    @Query() params: number,
  ): Promise<IResponse> {
    const result = await this.service.getProductsBestSeller(params);
    return this.responseSuccess(res, result);
  }
}
