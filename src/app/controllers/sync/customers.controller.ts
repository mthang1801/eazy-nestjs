import { Controller, Res, Get } from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { CustomerService } from '../../services/customer.service';
import { IResponse } from '../../interfaces/response.interface';
import { Response } from 'express';
@Controller('/sync/v1/customers')
export class CustomerControllers extends BaseController {
  constructor(private service: CustomerService) {
    super();
  }
  @Get()
  async get(@Res() res: Response): Promise<IResponse> {
    const logs = await this.service.itgGet();
    let result = null;
    if (logs.length) {
      result = `Người dùng có đã tồn tại : ${logs.join(', ')}`;
    }
    return this.responseSuccess(
      res,
      result,
      'Đồng bộ KH từ appcore thành công.',
    );
  }
}
