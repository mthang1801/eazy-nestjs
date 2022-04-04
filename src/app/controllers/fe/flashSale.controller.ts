import { Controller, Get, Res, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { FlashSalesService } from 'src/app/services/flashSale.service';
@Controller('fe/v1/flash-sales')
export class FlashSalesController extends BaseController {
  constructor(private service: FlashSalesService) {
    super();
  }
  @Get(':flash_sale_id')
  async get(
    @Res() res: Response,
    @Param('flash_sale_id') flash_sale_id: number,
  ): Promise<IResponse> {
    const result = await this.service.FEget(flash_sale_id);
    return this.responseSuccess(res, result, 'Thành công.');
  }
}
