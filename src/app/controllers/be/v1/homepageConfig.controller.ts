import { Controller, Post, Res, Body, Get, Query, Param } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from '../../../interfaces/response.interface';
import { HomepageConfigService } from '../../../services/homepageConfig.service';
@Controller('be/v1/homepage-configure')
export class HomepageConfigureController extends BaseController {
  constructor(private service: HomepageConfigService) {
    super();
  }
  @Post()
  async create(@Res() res: Response, @Body() data): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':module_id')
  async getByID(
    @Res() res: Response,
    @Param('module_id') module_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getById(module_id);
    return this.responseSuccess(res, result);
  }
}
