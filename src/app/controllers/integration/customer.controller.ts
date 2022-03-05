import { Controller, Res, Get } from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CustomerService } from '../../services/customer.service';
@Controller('/itg/v1/customers')
export class CustomerController extends BaseController {
  constructor(private service: CustomerService) {
    super();
  }
  @Get()
  async syncRetrieveCustomer(@Res() res: Response): Promise<IResponse> {
    await this.service.generatePasswordAndSendMail();
    return this.responseSuccess(res, '', 'Synced');
  }
}
