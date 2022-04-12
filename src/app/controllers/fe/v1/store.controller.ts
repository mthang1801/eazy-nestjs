import {
  Controller,
  Get,
  Res,
  Query,
  Body,
  Post,
  Put,
  Param,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';

import { Response } from 'express';
import { StoreService } from 'src/app/services/store.service';
import { BaseController } from '../../../../base/base.controllers';

@Controller('/fe/v1/stores')
export class StoreControllerFE extends BaseController {
  constructor(private service: StoreService) {
    super();
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }
}
