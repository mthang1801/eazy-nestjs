import { Body, Controller, Post, Res } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { PromotionAccessoryService } from '../../services/promotionAccessory.service';
import { CreatePromotionAccessoryDto } from '../../dto/promotionAccessories/create-promotionAccessory.dto';
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
}
