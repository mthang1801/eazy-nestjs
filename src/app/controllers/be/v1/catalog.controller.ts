import { Body, Controller, Get, Post, Res, Query, Param } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { CreateCatalogDto } from '../../../dto/catalog/create-catalog.dto';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CatalogService } from '../../../services/catalog.service';
import { resourceUsage } from 'process';
@Controller('be/v1/catalogs')
export class CatalogController extends BaseController {
  constructor(private service: CatalogService) {
    super();
  }
  @Post()
  async create(
    @Res() res: Response,
    @Body() data: CreateCatalogDto,
  ): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Get()
  async get(
    @Res() res: Response,
    @Query() query,
  ): Promise<IResponse> {
    const result = await this.service.get();
    return this.responseSuccess(res, result);
  }

  @Get(":catalog_id")
  async getById(
    @Res() res: Response,
    @Param('catalog_id') catalog_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getById(catalog_id);
    return this.responseSuccess(res, result);
  }
}