import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { bannerService } from '../../services/banner.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { Response } from 'express';

import { AuthGuard } from '../../../middlewares/be.auth';
@Controller('/fe/v1/banners')
export class bannerController extends BaseController {
  constructor(private service: bannerService) {
    super();
  }

  @Get()
  async getList(@Res() res, @Param() param): Promise<IResponse> {
    const banners = await this.service.getList(param);
    return this.responseSuccess(res, banners);
  }

  @Get('/slug')
  async getBySlug(@Res() res, @Query() params): Promise<IResponse> {
    const result = await this.service.getBySlug(params);
    return this.responseSuccess(res, result);
  }

  // @Get('/:id/images')
  // async getAllIamgesByBannerId(
  //   @Res() res,
  //   @Param('id') id,
  // ): Promise<IResponse> {
  //   const banners = await this.service.getAllIamgesByBannerId(id);
  //   return this.responseSuccess(res, banners);
  // }
}
