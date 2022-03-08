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
  Query,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';

import { AuthGuard } from '../../../middlewares/be.auth';
import { ShippingService } from 'src/app/services/shippings.service';
import { ShippingCreateDTO } from 'src/app/dto/shipping/create-shipping.dto';
import { UpdateCreateDTO } from 'src/app/dto/shipping/update-shipping.dto';

//@UseGuards(AuthGuard)
@Controller('/be/v1/shippings')
export class ShippingController extends BaseController {
  constructor(private service: ShippingService) {
    super();
  }

  @Get()
  async getList(@Res() res, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
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
  @Put('/:id')
  async update(
    @Res() res,
    @Body() body: UpdateCreateDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    const result = await this.service.update(id, body);
    return this.responseSuccess(res, result);
  }
}
