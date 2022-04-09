import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { OrdersService } from '../../../services/orders.service';
import { Res, Controller, Get } from '@nestjs/common';
import { Response } from 'express';
@Controller('/sync/v1')
export class OrderSyncController extends BaseController {
  constructor(private service: OrdersService) {
    super();
  }

  @Get()
  async syncGet(@Res() res: Response): Promise<IResponse> {
    await this.service.syncGet();
    return this.responseSuccess(res, null, 'Đồng bộ đơn hàng thành công');
  }
}
