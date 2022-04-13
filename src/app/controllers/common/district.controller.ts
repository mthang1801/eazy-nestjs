import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../base/base.controllers';
import { DistrictService } from '../../services/district.service';
import { Response } from 'express';
@Controller('/districts')
export class DistrictControler extends BaseController {
  constructor(private service: DistrictService) {
    super();
  }
  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':id')
  async get(@Param('id') id: number, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.get(id);
    return this.responseSuccess(res, result);
  }
}
