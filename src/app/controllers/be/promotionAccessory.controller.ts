import { Body, Controller, Post, Res } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('be/v1/promotion-accessories')
export class PromotionAccessoriesController extends BaseController {
  @Post()
  async create(@Res() res: Response): Promise<IResponse> {
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
