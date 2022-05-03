import { Controller, Query, Res, Get } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';

import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { TradeinProgramService } from '../../../services/tradeinProgram.service';
@Controller('fe/v1/tradein-programs')
export class TradeinProgramController extends BaseController {
  constructor(private service: TradeinProgramService) {
    super();
  }
  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getListFE(params);
    return this.responseSuccess(res, result);
  }
}
