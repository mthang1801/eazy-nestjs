import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { BaseController } from './base/base.controllers';
import { Response } from 'express';
import { IResponse } from './base/interfaces/response.interface';
import { AppService } from './app.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
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

  @Post('tracking-rollback')
  async create(@Res() res: Response, @Body() data): Promise<IResponse> {
    await this.service.create(data);
    return this.responseCreated(res);
  }

  @Post('test-condition')
  async testCondition(@Res() res: Response, @Body() data): Promise<IResponse> {
    await this.service.testCondition(data);
    return this.responseCreated(res);
  }
}
