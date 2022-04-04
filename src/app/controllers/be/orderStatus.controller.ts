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
import { OrderStatusService } from 'src/app/services/orderStatus.service';
import { AuthGuard } from '../../../middlewares/be.auth';
import { OrderStatusCreateDTO } from 'src/app/dto/orderStatus/create-orderStatus.dto';
import { OrderStatusUpdateDTO } from 'src/app/dto/orderStatus/update-orderStatus.dto';

@Controller('/be/v1/order-status')
export class OrderStatusController extends BaseController {
  constructor(private service: OrderStatusService) {
    super();
  }

  @Get()
  //@UseGuards(AuthGuard)
  async getList(@Res() res, @Param() params): Promise<IResponse> {
    const order = await this.service.getList(params);
    return this.responseSuccess(res, order);
  }

  @Get('/:id')
  async getById(@Res() res, @Param('id') id): Promise<IResponse> {
    const order = await this.service.getById(id);
    return this.responseSuccess(res, order);
  }

  @Post()
  async create(
    @Res() res,
    @Body() body: OrderStatusCreateDTO,
  ): Promise<IResponse> {
    const order = await this.service.create(body);
    return this.responseSuccess(res, order);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  async UpdateOrderStatus(
    @Res() res,
    @Body() body: OrderStatusUpdateDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    await this.service.update(id, body);

    return this.responseSuccess(res, null, 'Thành công.');
  }
}
