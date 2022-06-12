import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  Res,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CustomerService } from 'src/app/services/customer.service';
import { AuthGuard } from 'src/middlewares/fe.auth';
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { OrdersService } from '../../../services/orders.service';
import { Query } from '@nestjs/common';
import { Response } from 'express';

@Controller('/fe/v1/customers')
export class CustomerController extends BaseController {
  constructor(
    private service: CustomerService,
    private orderService: OrdersService,
  ) {
    super();
  }

  /**
   * Lấy ds KH theo id tù CMS
   * @param res
   * @param id
   * @returns
   */
  @Get()
  @UseGuards(AuthGuard)
  async getById(@Res() res, @Req() req): Promise<IResponse> {
    const { user_id } = req.user;
    const result = await this.service.getById(user_id);
    return this.responseSuccess(res, result);
  }

  @Get('/:user_id/orders')
  async getOrdersList(
    @Param('user_id') user_id: number,
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.orderService.getByCustomerId(user_id, params);
    return this.responseSuccess(res, result);
  }

  @Get('search')
  async checkCustomer(
    @Query('phone') phone: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.searchCustomterAppcoreByPhone(phone);

    return this.responseSuccess(res, result);
  }
}
