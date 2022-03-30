import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  Put,
  Query,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { PromotionAccessoryService } from '../../services/promotionAccessory.service';
import { CreatePromotionAccessoryDto } from '../../dto/promotionAccessories/create-promotionAccessory.dto';
import { UpdatePromotionAccessoryDto } from '../../dto/promotionAccessories/update-promotionAccessory.dto';
@Controller('be/v1/promotion-accessories')
export class PromotionAccessoriesController extends BaseController {
  constructor(private service: PromotionAccessoryService) {
    super();
  }
  @Post()
  async create(
    @Res() res: Response,
    @Body() data: CreatePromotionAccessoryDto,
  ): Promise<IResponse> {
    await this.service.create(data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get(':accessory_id')
  async get(
    @Res() res: Response,
    @Param('accessory_id') accessory_id: number,
  ): Promise<IResponse> {
    const result = await this.service.get(accessory_id);
    return this.responseSuccess(res, result);
  }

  @Put(':accessory_id')
  async update(
    @Res() res: Response,
    @Param('accessory_id') accessory_id: number,
    @Body() data: UpdatePromotionAccessoryDto,
  ): Promise<IResponse> {
    const result = await this.service.update(accessory_id, data);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }
}
