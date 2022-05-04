import { Controller, Query, Res, Get } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { ShippingFeeService } from '../../../services/shippingFee.service';
@Controller('fe/v1/shipping-fees')
export class ShippingFeesController extends BaseController {
  constructor(private service: ShippingFeeService) {
    super();
  }
  @Get('calculation')
  async calcShippingFee(
    @Query('dest_city_id') dest_city_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.calcShippingFee(dest_city_id);
    return this.responseSuccess(res, result);
  }
}
