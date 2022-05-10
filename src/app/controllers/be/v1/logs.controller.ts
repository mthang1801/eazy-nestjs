import { Body, Controller, Res, Get, Param, Query } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { LogsService } from '../../../services/logs.service';
import { get } from 'lodash';

@Controller('be/v1/logs')
export class LogsController extends BaseController {
  constructor(private service: LogsService) {
    super();
  }

  async create(@Res() res, @Body() data): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Get(':id')
  async get(@Res() res, @Param('id') id: number): Promise<IResponse> {
    const result = await this.service.get(id);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Res() res, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }
}
