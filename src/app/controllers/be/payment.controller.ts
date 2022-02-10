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
import { AuthGuard } from '../../../middlewares/fe.auth';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentCreateDTO } from 'src/app/dto/payment/create-payment.dto';
import { PaymentUpdateDTO } from 'src/app/dto/payment/update-payment.dto';
/**
 * Controller for Category
 * @Author TrinhLong
 */
@UseGuards(AuthGuard)
@Controller('/be/v1/payment')
export class PaymentController extends BaseController {
  constructor(private service: PaymentService) {
    super();
  }
  /**
   * Get all payments with query params such as : page, limit, status, position...
   * @param res
   * @param params
   * @returns
   */
  @Get()
  async getAll(@Res() res, @Param() params): Promise<IResponse> {
    const result = await this.service.getAll(params);
    return this.responseSuccess(res, result);
  }

  @Get('/:id')
  async getById(@Res() res, @Param('id') id): Promise<IResponse> {
    const result = await this.service.getById(id);
    return this.responseSuccess(res, result);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Res() res, @Body() body: PaymentCreateDTO): Promise<IResponse> {
    const result = await this.service.create(body);

    return this.responseSuccess(res, result);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  async update(
    @Res() res,
    @Body() body: PaymentUpdateDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    const result = await this.service.update(id, body);

    return this.responseSuccess(res, result);
  }
}
