import { Body, Controller, Get, Post, Res, Put, Param } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { PromotionAccessoryService } from '../../../services/promotionAccessory.service';
import { Response } from 'express';
@Controller('itg/v1/accessories')
export class PromotionAccessoryItgController extends BaseController {
  constructor(private service: PromotionAccessoryService) {
    super();
  }
  @Post('/free')
  async createFree(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data, 2);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put('free/:app_core_id')
  async updateFree(
    @Res() res: Response,
    @Body() data,
    @Param('app_core_id') app_core_id: string,
  ) {
    await this.service.itgUpdate(app_core_id, data, 2);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Post('/promotion')
  async createPromotion(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data, 1);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put('promotion/:app_core_id')
  async updatePromotion(
    @Res() res: Response,
    @Body() data,
    @Param('app_core_id') app_core_id: string,
  ) {
    await this.service.itgUpdate(app_core_id, data, 1);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Post('warranty-packages')
  async createWarranty(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data, 3);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put('warranty-packages/:app_core_id')
  async updateWarranty(
    @Res() res: Response,
    @Body() data,
    @Param('app_core_id') app_core_id: string,
  ) {
    await this.service.itgUpdate(app_core_id, data, 3);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
