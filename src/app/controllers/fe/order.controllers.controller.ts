import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { OrdersService } from 'src/app/services/orders.service';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
@Controller('/fe/v1/orders')
export class OrdersController extends BaseController {
  constructor(private service: OrdersService) {
    super();
  }

  @Get()
  async get(
    @Query('phone') phone: string,
    @Query('order_id') order_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getByPhoneAndId(phone, order_id);
    return this.responseSuccess(res, result);
  }

  @Get('/customers/:customer_id')
  async getByCustomerId(
    @Query() params,
    @Param('customer_id') customer_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getByCustomerId(customer_id, params);
    return this.responseSuccess(res, result);
  }

  @Get('/:order_id/order-details')
  async getOrderDetails(
    @Param('order_id') order_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getOrderDetails(order_id);
    return this.responseSuccess(res, result);
  }
}
