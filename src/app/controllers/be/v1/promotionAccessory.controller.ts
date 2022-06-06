import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { PromotionAccessoryService } from '../../../services/promotionAccessory.service';
import { CreatePromotionAccessoryDto } from '../../../dto/promotionAccessories/create-promotionAccessory.dto';
import { UpdatePromotionAccessoryDto } from '../../../dto/promotionAccessories/update-promotionAccessory.dto';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { UpdateProductPromotionAccessoryDto } from '../../../dto/promotionAccessories/update-productPromotionAccessory.dto';
@Controller('be/v1/promotion-accessories')
export class PromotionAccessoriesController extends BaseController {
  constructor(private service: PromotionAccessoryService) {
    super();
  }
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Res() res: Response,
    @Body() data: CreatePromotionAccessoryDto,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.create(data, req.user);
    return this.responseSuccess(res);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':accessory_id')
  @UseGuards(AuthGuard)
  async get(
    @Res() res: Response,
    @Param('accessory_id') accessory_id: number,
  ): Promise<IResponse> {
    const result = await this.service.get(accessory_id);
    return this.responseSuccess(res, result);
  }

  @Put(':accessory_id')
  @UseGuards(AuthGuard)
  async update(
    @Res() res: Response,
    @Param('accessory_id') accessory_id: number,
    @Body() data: UpdatePromotionAccessoryDto,
    @Req() req,
  ): Promise<IResponse> {
    const result = await this.service.update(accessory_id, data, req.user);
    return this.responseSuccess(res, result);
  }

  @Get('products/:product_id')
  @UseGuards(AuthGuard)
  async getByProductId(
    @Res() res: Response,
    @Param('product_id') product_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getByProductId(product_id);
    return this.responseSuccess(res, result);
  }

  @Get(':accessory_id/products')
  @UseGuards(AuthGuard)
  async getProductsListByAccessoryId(
    @Res() res: Response,
    @Param('accessory_id') accessory_id: number,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getProductsListByAccessoryId(
      accessory_id,
      params,
    );
    return this.responseSuccess(res, result);
  }

  @Put(':accessory_id/update-products')
  @UseGuards(AuthGuard)
  async updateAccessoryProducts(
    @Res() res: Response,
    @Body() data: UpdateProductPromotionAccessoryDto,
    @Param('accessory_id') accessory_id: number,
  ): Promise<IResponse> {
    await this.service.updateProductAccessory(accessory_id, data);
    return this.responseSuccess(res, null, 'Thành công');
  }
}
