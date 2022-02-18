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
import { AuthGuard } from '../../../middlewares/fe.auth';
import { OrdersService } from 'src/app/services/orders.service';
import { OrderStatusService } from 'src/app/services/orderStatus.service';
import { OrderUpdateDTO } from 'src/app/dto/orders/update-order.dto';
import { OrderStatusUpdateDTO } from 'src/app/dto/orderStatus/update-orderStatus.dto';

/**
 * Controller for Category
 * @Author LongTRinh
 */
//@UseGuards(AuthGuard)
@Controller('/itg/v1/order')
export class OrderIntegrationController extends BaseController {
  constructor(private orderservice: OrdersService, private orderStatusService: OrderStatusService,
  ) {
    super();
  }
  /**
   * Get all payments with query params such as : page, limit, status, position...
   * @param res
   * @param params
   * @returns
   */
  @Put('/:id')
  async update(
    @Res() res,
    @Param('id') id,
    @Body() body: OrderUpdateDTO,
  ): Promise<IResponse> {
    const result = await this.orderservice.update(id, body);
    return this.responseSuccess(res, result, `action update orders`);
  }

  @Put('/status/:id')
  @UsePipes(ValidationPipe)
  async UpdateOrderStatus(
    @Res() res,
    @Body() body: OrderStatusUpdateDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    const order = await this.orderStatusService.update(id, body);
    if (order === '422')
      return this.optionalResponse(res, 422, 'Status and Type duplicated');
    return this.responseSuccess(res, order);
  }



}
