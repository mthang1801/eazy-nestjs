import {
  Controller,
  Query,
  Res,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';

import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { TradeinProgramService } from '../../../services/tradeinProgram.service';
import { AuthGuard } from '../../../../middlewares/be.auth';
@Controller('fe/v1/tradein-programs')
export class TradeinProgramController extends BaseController {
  constructor(private service: TradeinProgramService) {
    super();
  }
  @Get()
  @UseGuards(AuthGuard)
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getListFE(params);
    return this.responseSuccess(res, result);
  }

  @Post('/valuation-bill')
  async createValuationBill(
    @Res() res: Response,
    @Body() data,
  ): Promise<IResponse> {
    await this.service.createValuationBill(data);
    return this.responseSuccess(res);
  }
}
