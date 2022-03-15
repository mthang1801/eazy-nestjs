import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { UpdateCustomerDTO } from 'src/app/dto/customer/update-customer.dto';
import {} from '../../interfaces/response.interface';
import { OrdersService } from 'src/app/services/orders.service';
import { AuthGuard } from '../../../middlewares/be.auth';
import { Response } from 'express';
import { UpdateOrderDto } from 'src/app/dto/orders/update-order.dto';
import { CreateOrderDto } from 'src/app/dto/orders/create-order.dto';

@Controller('/be/v1/orders')
export class OrderController extends BaseController {
  constructor(private service: OrdersService) {
    super();
  }

  @Post()
  async create(@Res() res, @Body() body: CreateOrderDto): Promise<IResponse> {
    const result = await this.service.create(body);
    return this.responseSuccess(res, result, 'Tạo thành công');
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Put('/:order_id')
  async update(
    @Res() res,
    @Param('order_id') order_id,
    @Body() data: UpdateOrderDto,
  ): Promise<IResponse> {
    const result = await this.service.update(order_id, data);
    return this.responseSuccess(res, result, `Cập nhật thành công.`);
  }

  @Get('/:order_code')
  async get(
    @Res() res,
    @Param('order_code') order_code: number,
  ): Promise<IResponse> {
    const result = await this.service.getById(order_code);
    return this.responseSuccess(res, result);
  }
}
