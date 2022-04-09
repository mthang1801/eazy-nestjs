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
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { UpdateCustomerDTO } from 'src/app/dto/customer/update-customer.dto';
import {} from '../../../interfaces/response.interface';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { Query } from '@nestjs/common';
import { CreateCustomerDto } from '../../../dto/customer/create-customer.dto';
import { Response } from 'express';
import { OrdersService } from 'src/app/services/orders.service';

@Controller('/be/v1/customers')
export class CustomerController extends BaseController {
  constructor(
    private service: CustomerService,
    private orderService: OrdersService,
  ) {
    super();
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Res() res: Response,
    @Req() req,
    @Body() data: CreateCustomerDto,
  ): Promise<IResponse> {
    await this.service.create(req.user, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  //@UseGuards(AuthGuard)
  @Get()
  async getList(@Res() res, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result, `action return all customer`);
  }
  @Get('/:id')
  async getById(@Res() res, @Param('id') id): Promise<IResponse> {
    const result = await this.service.getById(id);

    return this.responseSuccess(res, result, `action return all customer`);
  }

  @Get('/:id/loyalty-histories')
  async getCustomerLoyaltyHistory(
    @Param('id') id: number,
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getCustomerLoyaltyHistory(id, params);
    return this.responseSuccess(res, result);
  }

  @Put('/:user_id')
  async update(
    @Res() res,
    @Param('user_id') user_id: string,
    @Body() body: UpdateCustomerDTO,
  ): Promise<IResponse> {
    const result = await this.service.update(user_id, body);

    return this.responseSuccess(res, result, `Cập nhật thành công.`);
  }

  @Get('/:user_id/orders')
  async getOrdersList(
    @Param('user_id') user_id: number,
    @Res() res: Response,
    @Query() params,
  ) {
    const result = await this.orderService.getByCustomerId(user_id, params);
    return this.responseSuccess(res, result);
  }
}
