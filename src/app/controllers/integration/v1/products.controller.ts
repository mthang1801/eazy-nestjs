import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  Response,
  Param,
  Query,
} from '@nestjs/common';
import { CreateProductAppcoreDto } from 'src/app/dto/product/create-product.appcore.dto';
import { CreateProductStoreDto } from 'src/app/dto/product/create-productStore.dto';

import { IResponse } from 'src/app/interfaces/response.interface';
import { ProductService } from 'src/app/services/products.service';
import { BaseController } from 'src/base/base.controllers';

@Controller('itg/v1/products')
export class ProductIntegrationController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }

  @Post()
  async create(@Body() data, @Res() res: Response): Promise<IResponse> {
    await this.service.itgCreate(data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get('/sync')
  async callSync(@Res() res: Response): Promise<IResponse> {
    await this.service.callSync();
    return this.responseSuccess(res, null, 'Đồng bộ thành công');
  }

  @Get('/appcore')
  async getFromAppcore(@Res() res: Response): Promise<IResponse> {
    await this.service.getFromAppcore();
    return this.responseSuccess(res, null, 'Lấy từ appcore hoàn tất.');
  }

  // Create or update products stores from appcore
  @Post('/products-stores')
  async createProductStores(
    @Res() res: Response,
    @Body() data: CreateProductStoreDto,
  ) {
    await this.service.itgCreateProductStores(data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  /**
   * Get products stores from Appcore back to CMS
   * @param res
   * @returns
   */
  @Get('/products-stores')
  async getProductsStores(@Res() res: Response): Promise<IResponse> {
    await this.service.importProducts();
    return this.responseSuccess(res, null, 'Lấy tồn kho hoàn tất.');
  }

  @Put(':sku')
  async syncUpdate(
    @Param('sku') sku: string,
    @Body() data,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.itgUpdate(sku, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getListBE(params);
    return this.responseSuccess(res, result);
  }

  @Get(':identifier')
  async get(
    @Param('identifier') identifier: number | string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.get(identifier);
    return this.responseSuccess(res, result);
  }
}
