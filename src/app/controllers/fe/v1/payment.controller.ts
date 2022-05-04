import { Controller, Post, Body, Res, Req, Get, Query } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { PaymentService } from '../../../services/payment.service';

import { CreatePaynowDto } from '../../../dto/orders/create-paynow.dto';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CreatePayooInstallmentDto } from '../../../dto/orders/create-payooInstallment.dto';
import { CreateInstallmentDto } from '../../../dto/payment/create-installment.dto';
import { CreatePaymentSelfTransportDto } from '../../../dto/orders/create-paymentSelfTransport.dto';
@Controller('fe/v1/payment')
export class PaymentControllerFE extends BaseController {
  constructor(private service: PaymentService) {
    super();
  }
  @Post('payoo/paynow')
  async payooPaymentPaynow(
    @Res() res: Response,
    @Body() data: CreatePaynowDto,
  ): Promise<IResponse> {
    const result = await this.service.payooPaymentPaynow(data);
    return this.responseSuccess(res, result);
  }

  @Post('payoo/self-transport')
  async payooPaymentSelfTransport(
    @Res() res: Response,
    @Body() data: CreatePaymentSelfTransportDto,
  ): Promise<IResponse> {
    const result = await this.service.payooPaymentSelftransport(data);
    return this.responseSuccess(res, result);
  }

  @Post('/payoo/installment')
  async payooPaymentInstallment(
    @Res() res: Response,
    @Body() data: CreatePayooInstallmentDto,
  ) {
    const result = await this.service.payooPaymentInstallment(data);
    return this.responseSuccess(res, result);
  }

  @Post('/installment')
  async paymentInstallment(
    @Res() res: Response,
    @Body() data: CreateInstallmentDto,
  ) {
    await this.service.paymentInstallment(data);
    return this.responseSuccess(res);
  }

  @Get('/installment/')
  async getProductInstallment(@Res() res: Response, @Query() params) {
    const result = await this.service.getProductInstallment(params);
    return this.responseSuccess(res, result);
  }
}
