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
  
  import {} from '../../interfaces/response.interface';

  @Controller('/be/v1/customers')
  export class CustomerController extends BaseController {
    constructor(private service: CustomerService) {
      super();
    }
  
    @Get()
    async getList(@Res() res, @Param() param): Promise<IResponse> {
      const result = await this.service.getList(param)  
      
      return this.responseSuccess(res,result,`action return all customer`);
    }

  }
  