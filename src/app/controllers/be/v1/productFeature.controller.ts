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
  UseGuards,
} from '@nestjs/common';
import { CreateProductFeatureDto } from 'src/app/dto/productFeatures/create-productFeatures.dto';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from '../../../interfaces/response.interface';
import { ProductFeatureService } from 'src/app/services/productFeature.service';
import { UpdateProductFeatureDto } from 'src/app/dto/productFeatures/update-productFeatures.dto';
import { AuthGuard } from '../../../../middlewares/be.auth';

@Controller('/be/v1/product-features')
@UseGuards(AuthGuard)
export class ProductFeatureController extends BaseController {
  constructor(private service: ProductFeatureService) {
    super();
  }
  @Post()
  async create(
    @Body() data: CreateProductFeatureDto,
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
  async getById(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getById(id);
    return this.responseSuccess(res, result);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateProductFeatureDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const { result, message } = await this.service.update(id, data);
    return this.responseSuccess(res, result, 'Cập nhật thành công');
  }

  @Delete()
  async clearAll(@Res() res: Response): Promise<IResponse> {
    await this.service.clearAll();
    return this.responseSuccess(res, null, 'Clear thành công.');
  }
}
