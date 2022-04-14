import { Controller, Post, Body, Res } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { PaymentService } from '../../../services/payment.service';

import { CreatePaynowDto } from '../../../dto/orders/create-paynow.dto';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('fe/v1/payment')
export class PaymentControllerFE extends BaseController {
  constructor(private service: PaymentService) {
    super();
  }
  @Post('payoo/paynow')
  async paymentPaynow(
    @Res() res: Response,
    @Body() data: CreatePaynowDto,
  ): Promise<IResponse> {
    const result = await this.service.paymentPaynow(data);
    return this.responseSuccess(res, result, 'Thành công');
  }
}
