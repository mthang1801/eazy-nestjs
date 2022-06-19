import { Controller, Get, Post, Res } from '@nestjs/common';
import { BaseController } from './base/base.controllers';
import { Response } from 'express';
import { IResponse } from './base/interfaces/response.interface';
import { AppService } from './app.service';
@Controller()
export class AppController extends BaseController {
  constructor(private service: AppService) {
    super();
  }
  @Get()
  async getUser(@Res() res: Response): Promise<IResponse> {
    await this.service.getUser();
    return this.responseSuccess(res);
  }
}
