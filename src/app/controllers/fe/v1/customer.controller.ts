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

@Controller('/fe/v1/customers')
export class CustomerController extends BaseController {
  constructor(private service: CustomerService) {
    super();
  }

  /**
   * Lấy ds KH theo id tù CMS
   * @param res
   * @param id
   * @returns
   */
  @Get('/:id')
  async getById(@Res() res, @Param('id') id): Promise<IResponse> {
    const result = await this.service.getById(id);
    return this.responseSuccess(res, result);
  }
}
