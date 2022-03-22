import { Controller, Res, Get, Body, Post, Put, Param } from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CustomerService } from '../../services/customer.service';
import { UpdateCustomerAppcoreDto } from '../../dto/customer/update-customerAppcore.dto';
import { CreateCustomerAppcoreDto } from '../../dto/customer/crate-customerAppcore.dto';
import { UpdateCustomerLoyalty } from 'src/app/dto/customer/update-customerLoyalty.appcore.dto';
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
}
