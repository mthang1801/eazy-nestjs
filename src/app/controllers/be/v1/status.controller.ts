import { Controller, Get, Res, Query } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { StatusService } from 'src/app/services/status.service';

@Controller('/be/v1/status')
export class StatusController extends BaseController {
  constructor(private service: StatusService) {
    super();
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }
}
