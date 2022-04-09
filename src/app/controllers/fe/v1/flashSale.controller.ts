import { Controller, Get, Res, Param } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { FlashSalesService } from 'src/app/services/flashSale.service';
@Controller('fe/v1/flash-sales')
export class FlashSalesController extends BaseController {
  constructor(private service: FlashSalesService) {
    super();
  }
  @Get()
  async get(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.FEget();
    return this.responseSuccess(res, result, 'Thành công.');
  }
}
