import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { PromotionAccessoryService } from 'src/app/services/promotionAccessory.service';
import { BaseController } from '../../../base/base.controllers';

@Controller('itg/v1/accessories')
export class PromotionAccessoryController extends BaseController {
  constructor(private service: PromotionAccessoryService) {
    super();
  }
  @Post()
  async create(@Res() res: Response, @Body() data) {
    await this.service.itgCreate(data);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
