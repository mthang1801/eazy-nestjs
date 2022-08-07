import { Controller, Get, Res, Version } from '@nestjs/common';
import { Response } from 'express';
import { BaseController } from 'src/base/base.controllers';
import { IResponse } from 'src/base/interfaces/response.interface';

@Controller('examples')
export class ExampleController extends BaseController {
  @Version('1')
  @Get()
  async getList(@Res() res: Response): Promise<IResponse> {
    let data = null;
    let msg = 'This is Get List Examples Version 1';
    return this.responseSuccess(res, data, msg);
  }

  @Version('2')
  @Get()
  async getListV2(@Res() res: Response): Promise<IResponse> {
    let data = null;
    let msg = 'This is Get List Examples Version 2';
    return this.responseSuccess(res, data, msg);
  }
}
