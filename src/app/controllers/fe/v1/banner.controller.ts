import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { bannerService } from '../../../services/banner.service';
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { Response } from 'express';

import { AuthGuard } from '../../../../middlewares/be.auth';
@Controller('/fe/v1/banners')
export class bannerController extends BaseController {
  constructor(private service: bannerService) {
    super();
  }

  @Get()
  async getList(@Res() res, @Query() params): Promise<IResponse> {
    const banners = await this.service.getListFE(params);
    return this.responseSuccess(res, banners);
  }
}
