import { Controller, Post, Body, Res, Req, Get, Query } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { PaymentService } from '../../../services/payment.service';

import { CreatePayooPaynowDto } from '../../../dto/orders/create-payooPaynow.dto';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CreatePayooInstallmentDto } from '../../../dto/orders/create-payooInstallment.dto';
import { CreateInstallmentDto } from '../../../dto/payment/create-installment.dto';
import { CreatePaymentSelfTransportDto } from '../../../dto/orders/create-paymentSelfTransport.dto';
import { CreateMomoPaymentDto } from '../../../dto/orders/create-momoPayment.dto';
@Controller('fe/v1/payment')
export class PaymentControllerFE extends BaseController {
  constructor(private service: PaymentService) {
    super();
  }
  @Post('payoo/paynow')
  async payooPaymentPaynow(
    @Res() res: Response,
    @Body() data: CreatePayooPaynowDto,
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
    @Req() req,
  ) {
    const result = await this.service.payooPaymentInstallment(data, req.user);
    return this.responseSuccess(res, result);
  }

  @Post('/installment')
  async paymentInstallment(
    @Res() res: Response,
    @Body() data: CreateInstallmentDto,
    @Req() req,
  ) {
    await this.service.paymentInstallment(data, req.user);
    return this.responseSuccess(res);
  }

  @Post('momo')
  async momoPayment(@Res() res: Response, @Body() data: CreateMomoPaymentDto) {
    const result = await this.service.momoPayment(data);
    return this.responseSuccess(res, result);
  }

  @Get('/installment/')
  async getProductInstallment(@Res() res: Response, @Query() params) {
    const result = await this.service.getProductInstallment(params);
    return this.responseSuccess(res, result);
  }
}
