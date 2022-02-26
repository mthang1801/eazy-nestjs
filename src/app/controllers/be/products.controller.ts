import {
  Body,
  Controller,
  Delete,
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
import { UpdateProductDto } from '../../dto/product/update-product.dto';
import { UpdateImageDto } from 'src/app/dto/product/update-productImage.dto';
import { CreateProductV2Dto } from '../../dto/product/create-product.v2.dto';
@Controller('be/v1/products')
export class ProductsController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }

  @Post('/sync')
  async syncProductsIntoGroup(@Res() res: Response): Promise<IResponse> {
    await this.service.syncProductsIntoGroup();
    return this.responseSuccess(res, null, 'Đồng bộ sản phẩm nhóm thành công.');
  }

  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':sku')
  async get(
    @Param('sku') identifier: number | string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.get(identifier);
    return this.responseSuccess(res, result);
  }

  @Put(':sku')
  async update(
    @Param('sku') sku: string,
    @Body() data: UpdateProductDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(sku, data);
    return this.responseSuccess(res, result);
  }

  @Post('/:sku/images')
  async updateImage(
    @Param('sku') sku: string,
    @Body() data: UpdateImageDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.updateImage(sku, data);
    return this.responseSuccess(res, result);
  }

  @Delete('/clear')
  async delete(@Res() res: Response): Promise<IResponse> {
    await this.service.clearAll();
    return this.responseSuccess(res, null, 'Clear thành công');
  }
}
