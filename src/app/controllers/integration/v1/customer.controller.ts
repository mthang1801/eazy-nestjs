import { Controller, Res, Get, Body, Post, Put, Param } from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CustomerService } from '../../../services/customer.service';
import { UpdateCustomerAppcoreDto } from '../../../dto/customer/update-customerAppcore.dto';
import { CreateCustomerAppcoreDto } from '../../../dto/customer/create-customerAppcore.dto';
import { UpdateCustomerLoyalty } from 'src/app/dto/customer/update-customerLoyalty.appcore.dto';
import { CreateCustomerLoyalHistoryDto } from '../../../dto/customer/crate-customerLoyalHistory';
@Controller('/itg/v1/customers')
export class CustomerController extends BaseController {
  constructor(private service: CustomerService) {
    super();
  }

  @Post()
  async create(
    @Body() data: CreateCustomerAppcoreDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.itgCreate(data);
    return this.responseSuccess(res, result, 'Đồng bộ thành công');
  }

  @Put(':user_appcore_id/loyalty')
  async updateLoyalty(
    @Param('user_appcore_id') user_appcore_id: number,
    @Res() res: Response,
    @Body() data: UpdateCustomerLoyalty,
  ): Promise<IResponse> {
    await this.service.itgUpdateLoyalty(user_appcore_id, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put('/:customer_appcore_id')
  async update(
    @Body() data: UpdateCustomerAppcoreDto,
    @Res() res: Response,
    @Param('customer_appcore_id') customer_appcore_id: number,
  ): Promise<IResponse> {
    const result = await this.service.itgUpdate(customer_appcore_id, data);
    return this.responseSuccess(res, result, 'Cập nhật thành công');
  }

  @Get('/:customer_appcore_id')
  async get(
    @Param('customer_appcore_id') customer_appcore_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.itgGet(customer_appcore_id);
    return this.responseSuccess(res, result);
  }

  @Post(':customer_appcore_id/loyalty')
  async postLoytalty(
    @Param('customer_appcore_id') customer_appcore_id: string,
    @Res() res: Response,
    @Body('point') point: number,
  ): Promise<IResponse> {
    await this.service.itgPostLoyalty(customer_appcore_id, point);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Post(':customer_appcore_id/loyalty-history')
  async postLoyaltyHistory(
    @Param('customer_appcore_id') customer_appcore_id: string,
    @Res() res: Response,
    @Body() data: CreateCustomerLoyalHistoryDto,
  ): Promise<IResponse> {
    await this.service.itgPostLoyaltyHistory(customer_appcore_id, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
