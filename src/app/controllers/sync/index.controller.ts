import { Controller, Get, Res } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { IndexService } from '../../services/index.service';

import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('/sync/v1/index')
export class IndexController extends BaseController {
  constructor(private service: IndexService) {
    super();
  }

  @Get('imports')
  async importAppcore(@Res() res: Response): Promise<IResponse> {
    await this.service.imports();
    return this.responseSuccess(res, null, 'Thành công');
  }
}
