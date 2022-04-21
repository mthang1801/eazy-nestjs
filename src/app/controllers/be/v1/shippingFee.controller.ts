import {
  Controller,
  Post,
  Res,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { ShippingFeeService } from '../../../services/shippingFee.service';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { CreateShippingFeeDto } from 'src/app/dto/shippingFee/create-shippingFee.dto';
import { CreateShippingFeeLocationDto } from '../../../dto/shippingFee/create-shippingFeeLocation.dto';
import { Response } from 'express';
import { UpdateShippingFeeDto } from '../../../dto/shippingFee/update-shippingFee.dto';
import { Put, Query, Get } from '@nestjs/common';
import { UpdateShippingFeeLocationDto } from '../../../dto/shippingFee/update-shippingFeeLocation.dto';

@Controller('be/v1/shipping-fees')
export class ShippingFeesController extends BaseController {
  constructor(private service: ShippingFeeService) {
    super();
  }
  @Post()
  @UseGuards(AuthGuard)
  async createShippingFee(
    @Body() data: CreateShippingFeeDto,
    @Res() res: Response,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.createShippingFee(data, req.user);
    return this.responseSuccess(res);
  }

  @Put('/:shipping_fee_id')
  @UseGuards(AuthGuard)
  async updateShippingFee(
    @Body() data: UpdateShippingFeeDto,
    @Param('shipping_fee_id') shipping_fee_id: number,
    @Res() res: Response,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.updateShippingFee(shipping_fee_id, data, req.user);
    return this.responseSuccess(res);
  }

  @Post('/:shipping_fee_id/locations')
  @UseGuards(AuthGuard)
  async createShippingFeeByLocation(
    @Body() data: CreateShippingFeeLocationDto,
    @Param('shipping_fee_id') shipping_fee_id: number,
    @Res() res: Response,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.createShippingFeeByLocation(
      data,
      shipping_fee_id,
      req.user,
    );
    return this.responseSuccess(res);
  }

  @Put('/locations/:shipping_fee_location_id')
  @UseGuards(AuthGuard)
  async updateShippingFeeLocation(
    @Body() data: UpdateShippingFeeLocationDto,
    @Param('shipping_fee_location_id') shipping_fee_location_id: number,
    @Res() res: Response,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.updateShippingFeeLocation(
      shipping_fee_location_id,
      data,
      req.user,
    );
    return this.responseSuccess(res);
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }
}
