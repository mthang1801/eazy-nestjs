import { Body, Controller, Post, Res } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { CreateCatalogDto } from '../../../dto/catalog/create-catalog.dto';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CatalogService } from '../../../services/catalog.service';
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
    await this.service.create(data);
    return this.responseSuccess(res);
  }
}
