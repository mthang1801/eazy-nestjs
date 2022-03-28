import {
  Body,
  Controller,
  Param,
  Post,
  Res,
  Put,
  Query,
  Get,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../base/base.controllers';
import { ProductService } from '../../services/products.service';
import { Response } from 'express';

@Controller('/web-tester/v1/products')
export class ProductTesterController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }

  @Post('/grouping')
  async grouping(
    @Res() res,
    @Body('group_ids') group_ids: number[],
  ): Promise<IResponse> {
    await this.service.grouping(group_ids);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put('/grouping/:index_id/')
  async upateGrouping(
    @Res() res,
    @Param('index_id') index_id: number,
    @Body('group_ids') group_ids: number[],
  ): Promise<IResponse> {
    await this.service.upateGrouping(index_id, group_ids);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get('/groupings')
  async getList(@Query() params, @Res() res): Promise<IResponse> {
    const result = await this.service.getListGroupingIndex(params);
    return this.responseSuccess(res, result);
  }

  @Get(':slug')
  async getBySlug(
    @Res() res: Response,
    @Param('slug') slug: string,
  ): Promise<IResponse> {
    const result = await this.service.testGetBySlug(slug);
    return this.responseSuccess(res, result);
  }

  @Post('/create')
  async create() {
    await this.service.testCreate();
  }
}