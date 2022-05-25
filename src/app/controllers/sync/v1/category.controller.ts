import { Controller, Get, Res, Post } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/products.service';
@Controller('/sync/v1/categories')
export class CategorySyncController extends BaseController {
  constructor(
    private service: CategoryService,
    private productService: ProductService,
  ) {
    super();
  }
  @Get()
  async get(@Res() res: Response): Promise<IResponse> {
    await this.service.getSync();
    return this.responseSuccess(res, null, 'Thành công.');
  }
  @Post()
  async callSync(@Res() res: Response): Promise<IResponse> {
    await this.service.callSync();
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get('count-products')
  async countProducts(@Res() res: Response): Promise<IResponse> {
    await this.productService.countProductByCategory();
    return this.responseSuccess(res, null, 'Hoàn tất.');
  }

  @Get('imports')
  async imports(@Res() res: Response): Promise<IResponse> {
    await this.service.syncImports();
    return this.responseSuccess(res, null, 'Hoàn tất.');
  }

  @Post('catalog/imports')
  async syncImportCatalogs(@Res() res: Response): Promise<IResponse> {
    await this.service.syncImportCatalogs();
    return this.responseSuccess(res, null, 'Hoàn tất.');
  }

  @Get('accessories')
  async syncAccessoryCategories(@Res() res: Response): Promise<IResponse> {
    await this.service.syncAccessoryCategories();
    return this.responseSuccess(res);
  }

  @Post('/migrate-catalog')
  async migrateCatalogIntoCategory(@Res() res: Response): Promise<IResponse> {
    await this.service.migrateCatalogIntoCategory();
    return this.responseSuccess(res);
  }
}
