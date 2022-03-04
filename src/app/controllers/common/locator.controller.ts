import { Controller, Get, Res, Param, Query } from '@nestjs/common';
import { LocatorService } from 'src/app/services/locator.service';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('/locators')
export class LocatorController extends BaseController {
  constructor(private service: LocatorService) {
    super();
  }

  @Get('/cities')
  async getCitiesList(
    @Query('search') search: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    let result = await this.service.getCitiesList(search);
    return this.responseSuccess(res, result);
  }

  @Get('/:city_id/districts')
  async getDistrictsList(
    @Param('city_id') city_id: number,
    @Query('search') search: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    let result = await this.service.getDistrictsList(city_id, search);
    return this.responseSuccess(res, result);
  }

  @Get('/:district_id/wards')
  async getWardsList(
    @Param('district_id') district_id: number,
    @Query('search') search: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    let result = await this.service.getWardsList(district_id, search);
    return this.responseSuccess(res, result);
  }
}
