import { Body, Controller, Post, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { StoreService } from '../../../services/store.service';
import { Response } from 'express';
@Controller('itg/v1/stores')
export class StoreItgController extends BaseController {
  constructor(private service: StoreService) {
    super();
  }
  @Post()
  async createStore(@Res() res: Response, @Body() data): Promise<IResponse> {
    return this.responseSuccess(res);
  }
}
