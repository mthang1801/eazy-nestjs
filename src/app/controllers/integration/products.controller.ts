import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  Response,
  Param,
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
  async create(
    @Body() data: CreateProductDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.create(data);
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
}
