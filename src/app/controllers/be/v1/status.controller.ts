import {
  Controller,
  Get,
  Res,
  Query,
  Body,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { StatusService } from 'src/app/services/status.service';
import { OrderStatusCreateDTO } from '../../../dto/orderStatus/create-orderStatus.dto';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { Put } from '@nestjs/common';
import { OrderStatusUpdateDTO } from '../../../dto/orderStatus/update-orderStatus.dto';

@Controller('/be/v1/status')
@UseGuards(AuthGuard)
export class StatusController extends BaseController {
  constructor(private service: StatusService) {
    super();
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Post()
  async create(
    @Res() res: Response,
    @Body() data: OrderStatusCreateDTO,
  ): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Get('/:id')
  async getById(@Res() res, @Param('id') id: number): Promise<IResponse> {
    const order = await this.service.getById(id);
    return this.responseSuccess(res, order);
  }

  @Put('/:id')
  async UpdateOrderStatus(
    @Res() res,
    @Body() data: OrderStatusUpdateDTO,
    @Param('id') id: number,
  ): Promise<IResponse> {
    await this.service.update(id, data);

    return this.responseSuccess(res);
  }
}
