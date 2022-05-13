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
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { Response } from 'express';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { ShippingService } from 'src/app/services/shippings.service';
import { CreateShippingDto } from 'src/app/dto/shipping/create-shipping.dto';
import { UpdateShippingDto } from '../../../dto/shipping/update-shipping.dto';

@Controller('/be/v1/shippings')
@UseGuards(AuthGuard)
export class ShippingController extends BaseController {
  constructor(private service: ShippingService) {
    super();
  }

  @Post()
  async create(
    @Res() res,
    @Body() data: CreateShippingDto,
  ): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Res()
    res: Response,
    @Body() data: UpdateShippingDto,
  ): Promise<IResponse> {
    const result = await this.service.update(id, data);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':id')
  async get(@Res() res: Response, @Param('id') id: number): Promise<IResponse> {
    const result = await this.service.get(id);
    return this.responseSuccess(res, result);
  }
}
