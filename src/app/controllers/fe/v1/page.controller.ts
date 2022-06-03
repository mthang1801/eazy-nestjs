import { Controller, Get, Param, Res, Query } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { PageService } from '../../../services/page.service';
import { Response } from 'express';
@Controller('fe/v1/pages')
export class PageControllerFE extends BaseController {
  constructor(private service: PageService) {
    super();
  }
  // @Get(s)
  // async FEGetPage(
  //   @Res() res: Response,
  //   @Param('link_url') link_url: number,
  // ): Promise<IResponse> {
  //   const result = await this.service.FEGetPage(link_url);
  //   return this.responseSuccess(res, result);
  // }

  @Get()
  async getPagesList(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.FEgetPagesList(params);
    return this.responseSuccess(res, result);
  }
}
