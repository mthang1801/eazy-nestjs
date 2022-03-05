import { Controller, Get, Param, Body, Put, Res } from '@nestjs/common';
import { CustomerService } from 'src/app/services/customer.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { UpdateCustomerDTO } from 'src/app/dto/customer/update-customer.dto';
import {} from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
import { Query } from '@nestjs/common';

@Controller('/be/v1/customers')
export class CustomerController extends BaseController {
  constructor(private service: CustomerService) {
    super();
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

  @Put('/:phone')
  async update(
    @Res() res,
    @Param('phone') phone: string,
    @Body() body: UpdateCustomerDTO,
  ): Promise<IResponse> {
    const result = await this.service.update(phone, body);

    return this.responseSuccess(res, result, `action update customer`);
  }
}
