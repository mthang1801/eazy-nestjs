import { Controller, Res, Get, Body, Post, Put, Param } from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CustomerService } from '../../services/customer.service';
@Controller('/itg/v1/customers')
export class CustomerController extends BaseController {
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

  @Post()
  async create(@Body() data, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.itgCreate(data);
    return this.responseSuccess(res, result, 'Đồng bộ thành công');
  }

  @Put('/:referrer')
  async update(
    @Body() data,
    @Res() res: Response,
    @Param('referrer') referrer: string,
  ): Promise<IResponse> {
    const result = await this.service.itgUpdate(referrer, data);
    return this.responseSuccess(res, result, 'Cập nhật thành công');
  }
}
