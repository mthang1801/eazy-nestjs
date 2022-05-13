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
import { AuthGuard } from 'src/middlewares/fe.auth';
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
  @Get()
  @UseGuards(AuthGuard)
  async getById(@Res() res, @Req() req): Promise<IResponse> {
    const { user_id } = req.user;
    const result = await this.service.getById(user_id);
    return this.responseSuccess(res, result);
  }
}
