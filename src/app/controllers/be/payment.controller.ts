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
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import {
  paymentCreateDTO,
  paymentUpdateDTO,
} from 'src/app/dto/payment/payment.dto';
import { AuthGuard } from '../../../middlewares/fe.auth';
import { PaymentService } from 'src/app/services/payment.service';
@UseGuards(AuthGuard)
@Controller('/be/v1/payment')
export class PaymentController extends BaseController {
  constructor(private paymentService: PaymentService) {
    super();
  }
  @Get()
  async getAllPayment(@Res() res): Promise<IResponse> {
    const order = await this.paymentService.getAllPayment();
    return this.responseSuccess(res, order);
  }
  @Get('/:id')
  async getPaymentById(@Res() res, @Param('id') id): Promise<IResponse> {
    const order = await this.paymentService.getPaymentById(id);
    return this.responseSuccess(res, order);
  }
  @Post()
  @UsePipes(ValidationPipe)
  async createPayment(
    @Res() res,
    @Body() body: paymentCreateDTO,
  ): Promise<IResponse> {
    const order = await this.paymentService.createPayment(body);

    return this.responseSuccess(res, order);
  }
  @Put('/:id')
  @UsePipes(ValidationPipe)
  async updatePayment(
    @Res() res,
    @Body() body: paymentUpdateDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    const order = await this.paymentService.updatePayment(id, body);

    return this.responseSuccess(res, order);
  }
}
