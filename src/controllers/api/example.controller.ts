import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseFilters,
  Version,
} from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { Response } from 'express';
import { I18n, I18nContext, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { BaseController } from 'src/base/base.controllers';
import { IResponse } from 'src/base/interfaces/response.interface';
import { CreateExampleDto } from '../../dto/example/create-example.dto';
import { ExampleService } from '../../services/exampple.service';

@Controller('examples')
export class ExampleController extends BaseController {
  constructor(private service: ExampleService) {
    super();
  }
  @Version('1')
  @Get()
  async getList(
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ): Promise<IResponse> {
    let data = null;
    // let msg = 'This is Get List Examples Version 1';
    let msg = i18n.t('example.day_interval', { args: { count: 1 } });
    return this.responseSuccess(res, data, msg);
  }

  @Version('2')
  @Get()
  async getListV2(@Res() res: Response): Promise<IResponse> {
    let data = null;
    let msg = 'This is Get List Examples Version 2';
    return this.responseSuccess(res, data, msg);
  }

  @Version('1')
  @Post()
  async createExample(
    @Res() res: Response,
    @Body() data: CreateExampleDto,
  ): Promise<IResponse> {
    await this.service.createExample();
    return this.responseCreated(res);
  }
}
