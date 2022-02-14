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
import { CustomerService } from 'src/app/services/customer.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { UpdateCustomerDTO } from 'src/app/dto/customer/update-customer.dto';
import {} from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';

@Controller('/be/v1/customers')
export class CustomerController extends BaseController {
  constructor(private service: CustomerService) {
    super();
  }
  //@UseGuards(AuthGuard)
  @Get()
  async getList(@Res() res, @Param() param): Promise<IResponse> {
    const result = await this.service.getList(param);

    return this.responseSuccess(res, result, `action return all customer`);
  }
  @Get('/:id')
  async getById(@Res() res, @Param('id') id): Promise<IResponse> {
    const result = await this.service.getById(id);

    return this.responseSuccess(res, result, `action return all customer`);
  }
  @Put('/:id')
  async update(
    @Res() res,
    @Param('id') id,
    @Body() body: UpdateCustomerDTO,
  ): Promise<IResponse> {
    const result = await this.service.update(id, body);

    return this.responseSuccess(res, result, `action update customer`);
  }
}
