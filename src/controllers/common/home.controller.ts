import { Controller, Get, Res, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { IResponse } from 'src/base/interfaces/response.interface';
import { BaseController } from '../../base/base.controllers';

@Controller()
@ApiTags('Home')
export class HomeController extends BaseController {
  @Version(VERSION_NEUTRAL)
  @Get()
  get(@Res() res: Response): IResponse {
    const message = `Homepage NestJS Example API, ${new Date().toLocaleDateString(
      'vn',
    )}`;
    return this.responseSuccess(res, '', message);
  }
}
