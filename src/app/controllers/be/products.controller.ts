import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ProductService } from 'src/app/services/products.service';
import { BaseController } from '../../../base/base.controllers';
import { CreateProductDto } from '../../dto/product/create-product.dto';
import { IResponse } from '../../interfaces/response.interface';
import { Response } from 'express';
@Controller('be/v1/products')
export class ProductsController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }
  @Post()
  async create(
    @Body() data: CreateProductDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':id')
  async get(
    @Param('id') identifier: number | string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.get(identifier);
    return this.responseSuccess(res, result);
  }

  @Put(':id')
  async update(
    @Param('id') identifier: number | string,
    @Body() data,
  ): Promise<void> {}
}
