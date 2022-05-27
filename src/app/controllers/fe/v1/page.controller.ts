import { Controller, Get, Param, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { PageService } from '../../../services/page.service';
import { Response } from 'express';
@Controller('fe/v1/pages')
export class PageControllerFE extends BaseController {
  constructor(private service: PageService) {
    super();
  }
  @Get(':page_id')
  async FEGetPage(
    @Res() res: Response,
    @Param('page_id') page_id: number,
  ): Promise<IResponse> {
    const result = await this.service.FEGetPage(page_id);
    return this.responseSuccess(res, result);
  }
}
