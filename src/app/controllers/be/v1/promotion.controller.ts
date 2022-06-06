import { Body, Controller, Post, Res } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { CheckCouponDto } from '../../../dto/promotion/checkCoupon.dto';
import { IResponse } from 'src/app/interfaces/response.interface';
import { PromotionService } from 'src/app/services/promotion.service';
@Controller('be/v1/promotions')
export class PromotionController extends BaseController {
  constructor(private service: PromotionService) {
    super();
  }
  @Post('/coupon/check')
  async checkCoupon(
    @Res() res: Response,
    @Body() data: CheckCouponDto,
  ): Promise<IResponse> {
    const result = await this.service.checkCoupon(data);
    return this.responseSuccess(res, result);
  }
}
