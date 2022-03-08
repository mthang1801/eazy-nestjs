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
import { CreateProductDto } from 'src/app/dto/product/create-product.dto';
import { UpdateProductDto } from 'src/app/dto/product/update-product.dto';
import { UpdateImageDto } from 'src/app/dto/product/update-productImage.dto';
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
    const result = await this.service.itgCreate(data);
    return this.responseSuccess(res, result);
  }

  @Get('/sync')
  async callSync(@Res() res: Response): Promise<IResponse> {
    await this.service.callSync();
    return this.responseSuccess(res, null, 'Đồng bộ thành công');
  }

  @Put(':sku')
  async syncUpdate(
    @Param('sku') sku: string,
    @Body() data,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.itgUpdate(sku, data);
    return this.responseSuccess(res, result);
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
}
