import { Body, Controller, Get, Post, Res, Put, Param } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { PromotionAccessoryService } from '../../../services/promotionAccessory.service';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('itg/v1/accessories')
export class PromotionAccessoryItgController extends BaseController {
  constructor(private service: PromotionAccessoryService) {
    super();
  }
  @Post('/free')
  async createFree(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data, 2);
    return this.responseSuccess(res);
  }

  @Put('free/:app_core_id')
  async updateFree(
    @Res() res: Response,
    @Body() data,
    @Param('app_core_id') app_core_id: string,
  ) {
    await this.service.itgUpdate(app_core_id, data, 2);
    return this.responseSuccess(res);
  }

  @Post('/promotion')
  async createPromotion(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data, 1);
    return this.responseSuccess(res);
  }

  @Put('promotion/:app_core_id')
  async updatePromotion(
    @Res() res: Response,
    @Body() data,
    @Param('app_core_id') app_core_id: string,
  ) {
    await this.service.itgUpdate(app_core_id, data, 1);
    return this.responseSuccess(res);
  }

  @Post('warranty-packages')
  async createWarranty(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data, 3);
    return this.responseSuccess(res);
  }

  @Put('warranty-packages/:app_core_id')
  async updateWarranty(
    @Res() res: Response,
    @Body() data,
    @Param('app_core_id') app_core_id: string,
  ) {
    await this.service.itgUpdate(app_core_id, data, 3);
    return this.responseSuccess(res);
  }

  @Post('discount-programs')
  async createDiscountPrograms(
    @Res() res: Response,
    @Body() data,
  ): Promise<IResponse> {
    const result = await this.service.itgCreateDiscountPrograms(data);
    return this.responseSuccess(res, result);
  }

  @Put('discount-programs')
  async updateDiscountPrograms(
    @Res() res: Response,
    @Body() data,
  ): Promise<IResponse> {
    const result = await this.service.itgUpdateDiscountPrograms(data);
    return this.responseSuccess(res, result);
  }
}
