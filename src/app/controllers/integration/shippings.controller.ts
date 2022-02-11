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
import { ShippingService } from 'src/app/services/shippings.service';
import { ShippingCreateDTO } from 'src/app/dto/shipping/create-shipping.dto';
@UseGuards(AuthGuard)
@Controller('/integration/shipping')
export class ShippingController extends BaseController {
  constructor(private service: ShippingService) {
    super();
  }

  @Get()
  async getList(@Res() res): Promise<IResponse> {
    const result = await this.service.getList();
    return this.responseSuccess(res, result);
  }

  @Get('/:id')
  async getById(@Res() res, @Param('id') id): Promise<IResponse> {
    const result = await this.service.getById(id);
    return this.responseSuccess(res, result);
  }

  @Post()
  async create(
    @Res() res,
    @Body() body: ShippingCreateDTO,
  ): Promise<IResponse> {
    const result = await this.service.create(body);
    return this.responseSuccess(res, result);
  }
}
