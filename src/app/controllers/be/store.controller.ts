import { Controller, Get, Res, Query } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';

import { Response } from 'express';
import { StoreService } from 'src/app/services/store.service';
import { BaseController } from '../../../base/base.controllers';

@Controller('/be/v1/stores')
export class StoreController extends BaseController {
  constructor(private service: StoreService) {
    super();
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/all')
  async getAll(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getAll();
    return this.responseSuccess(res, result);
  }
}
