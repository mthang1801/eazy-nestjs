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
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { OrderStatusService } from 'src/app/services/order_status.service';
import { AuthGuard } from '../../../middlewares/be.auth';
import {
  orderStatusCreateDTO,
  orderStatusUpdateDTO,
} from 'src/app/dto/orderStatus/orderStatus.dto';
@UseGuards(AuthGuard)
@Controller('/be/v1/order-status')
export class OrderStatusController extends BaseController {
  constructor(private orderStatusService: OrderStatusService) {
    super();
  }
  @Get()
  async getAllOrderStatus(@Res() res,@Param() params): Promise<IResponse> {
    const order = await this.orderStatusService.GetAllOrderStatus(params);
    return this.responseSuccess(res, order);
  }
  @Get('/:id')
  async getOrderStatusById(@Res() res, @Param('id') id): Promise<IResponse> {
    const order = await this.orderStatusService.getOrderStatusById(id);
    return this.responseSuccess(res, order);
  }
  @Post()
      async createOrderStatus(
    @Res() res,
    @Body() body: orderStatusCreateDTO,
  ): Promise<IResponse> {
    const order = await this.orderStatusService.createOrderStatus(body);
     return this.responseSuccess(res, order);
  }
  @Put('/:id')
  @UsePipes(ValidationPipe)
  async UpdateOrderStatus(
    @Res() res,
    @Body() body: orderStatusUpdateDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    const order = await this.orderStatusService.UpdateOrderStatus(id, body);
    if (order === '422')
      return this.optionalResponse(res, 422, 'Status and Type duplicated');
    return this.responseSuccess(res, order);
  }
}
