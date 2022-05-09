import { Body, Controller, Post, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { TradeinProgramService } from '../../../services/tradeinProgram.service';
import { Response } from 'express';
@Controller('itg/v1/tradein-programs')
export class TradeinProgramControllerItg extends BaseController {
  constructor(private service: TradeinProgramService) {
    super();
  }
  @Post()
  async create(@Res() res: Response, @Body() data): Promise<IResponse> {
    const result = await this.service.itgCreate(data);
    return this.responseSuccess(res, result);
  }
}
