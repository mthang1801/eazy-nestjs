import { Body, Controller, Get, Post, Res, Put, Param } from '@nestjs/common';
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

  @Put('gift/:app_core_id')
  async udpate(
    @Res() res: Response,
    @Body() data,
    @Param('app_core_id') app_core_id: string,
  ) {
    await this.service.itgUpdate(app_core_id, data, 2);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
