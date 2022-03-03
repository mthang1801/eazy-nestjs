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
import { CreateOrderDto } from 'src/app/dto/orders/create-order.dto';

/**
 * Controller for Category
 * @Author LongTRinh
 */
//@UseGuards(AuthGuard)
@Controller('/itg/v1/orders')
export class OrderIntegrationController extends BaseController {
  constructor(
    private service: OrdersService,
    private orderStatusService: OrderStatusService,
  ) {
    super();
  }
  @Post()
  async create(@Res() res, @Body() body: CreateOrderDto): Promise<IResponse> {
    const { result, message } = await this.service.create(body);
    return this.responseSuccess(res, result, message);
  }
}
