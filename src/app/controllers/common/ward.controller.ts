import { Controller, Get, Query, Res, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from '../../interfaces/response.interface';
import { WardService } from '../../services/ward.service';
@Controller('wards')
export class WardController extends BaseController {
  constructor(private service: WardService) {
    super();
  }
  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':id')
  async get(@Res() res: Response, @Param('id') id: number): Promise<IResponse> {
    const result = await this.service.get(id);
    return this.responseSuccess(res, result);
  }
}
