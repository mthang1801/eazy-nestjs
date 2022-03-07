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
import { UpdateOrderDto } from 'src/app/dto/orders/update-order.dto';
import { OrderStatusUpdateDTO } from 'src/app/dto/orderStatus/update-orderStatus.dto';
import { CreateOrderDto } from 'src/app/dto/orders/create-order.dto';

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

  @Post()
  async create(@Res() res, @Body() body): Promise<IResponse> {
    const result = await this.service.itgCreate(body);
    return this.responseSuccess(res, result, 'Tạo đơn hàng thành công');
  }

  @Put('/:origin_order_id')
  async update(
    @Res() res: IResponse,
    @Param('origin_order_id') origin_order_id: string,
    data,
  ): Promise<IResponse> {
    await this.service.itgUpdate(origin_order_id, data);
    return this.responseSuccess(res, '', 'Cập nhật thành công');
  }
}
