import { Body, Controller, Get, Post, Res, Response } from '@nestjs/common';
import { CreateProductDto } from 'src/app/dto/product/create-product.dto';
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
}
