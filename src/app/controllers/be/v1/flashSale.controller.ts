import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { FlashSalesService } from '../../../services/flashSale.service';
import { Response } from 'express';

import { IResponse } from 'src/app/interfaces/response.interface';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { CreateFlashSaleDto } from 'src/app/dto/flashSale/create-flashSale.dto';
import { get } from 'lodash';
import { Get, Query } from '@nestjs/common';
import { UpdateFlashSaleDto } from 'src/app/dto/flashSale/update-flashSale.dto';
@Controller('be/v1/flash-sales')
@UseGuards(AuthGuard)
export class FlashSalesController extends BaseController {
  constructor(private service: FlashSalesService) {
    super();
  }

  @Post()
  async create(
    @Res() res: Response,
    @Body() data: CreateFlashSaleDto,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.CMScreate(data, req.user);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get(':flash_sale_id')
  async get(
    @Res() res: Response,
    @Param('flash_sale_id') flash_sale_id: number,
  ): Promise<IResponse> {
    const result = await this.service.CMSget(flash_sale_id);
    return this.responseSuccess(res, result, 'Thành công.');
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result, 'Thành công.');
  }

  @Put(':flash_sale_id')
  async update(
    @Res() res: Response,
    @Param('flash_sale_id') flash_sale_id: number,
    @Body() data: UpdateFlashSaleDto,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.update(flash_sale_id, data, req.user);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
