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
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { AuthGuard } from '../../../../middlewares/fe.auth';
import { OrdersService } from 'src/app/services/orders.service';
import { OrderStatusService } from 'src/app/services/orderStatus.service';
import { UpdateOrderDto } from 'src/app/dto/orders/update-order.dto';
import { OrderStatusUpdateDTO } from 'src/app/dto/orderStatus/update-orderStatus.dto';
import { CreateOrderDto } from 'src/app/dto/orders/create-order.dto';
import { Response } from 'express';
import { CreateOrderAppcoreDto } from 'src/app/dto/orders/create-order.appcore.dto';
import { UpdateOrderAppcoreDto } from 'src/app/dto/orders/update-order.appcore.dto';
/**
 * Controller for Category
 * @Author LongTRinh
 */
//@UseGuards(AuthGuard)
@Controller('/itg/v1/orders')
export class OrderIntegrationController extends BaseController {
  constructor(private service: OrdersService) {
    super();
  }

  @Get(':order_code')
  async getByOrderCode(
    @Res() res: Response,
    @Param('order_code') order_code: number,
  ): Promise<IResponse> {
    const result = await this.service.getByOrderCode(order_code);
    return this.responseSuccess(res, result);
  }

  @Post()
  async create(
    @Res() res,
    @Body() data: CreateOrderAppcoreDto,
  ): Promise<IResponse> {
    const result = await this.service.itgCreate(data);
    return this.responseSuccess(res, result, 'Tạo đơn hàng thành công');
  }

  @Get('/:ref_order_id')
  async get(@Res() res: Response, @Param('ref_order_id') ref_order_id: string) {
    const result = await this.service.getByRefOrderId(ref_order_id);
    return this.responseSuccess(res, result);
  }

  @Put('/order-status/:order_code')
  async updateOrderStatus(
    @Res() res: Response,
    @Param('order_code') order_code: number,
    @Body('order_status') order_status: string,
  ) {
    await this.service.updateOrderStatus(order_code, order_status);
    return this.responseSuccess(res, null, 'Thành công');
  }

  @Put('/:order_code')
  async update(
    @Res() res: Response,
    @Param('order_code') order_code: string,
    @Body() data: UpdateOrderAppcoreDto,
  ): Promise<IResponse> {
    await this.service.itgUpdate(order_code, data);
    return this.responseSuccess(res, '', 'Cập nhật thành công');
  }
}
