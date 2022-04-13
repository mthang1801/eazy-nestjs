import { Controller, Get, Query, Res, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CityService } from 'src/app/services/city.service';
@Controller('/cities')
export class CityController extends BaseController {
  constructor(private service: CityService) {
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
