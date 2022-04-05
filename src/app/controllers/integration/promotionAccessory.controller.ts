import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { PromotionAccessoryService } from '../../services/promotionAccessory.service';
import { Response } from 'express';
@Controller('itg/v1/accessories')
export class PromotionAccessoryItgController extends BaseController {
  constructor(private service: PromotionAccessoryService) {
    super();
  }
  @Post('/gift')
  async create(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data, 2);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
