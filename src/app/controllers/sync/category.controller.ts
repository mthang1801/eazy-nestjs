import { Controller, Get, Res } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { CategoryService } from 'src/app/services/category.service';
@Controller('/sync/v1/categories')
export class CategorySyncController extends BaseController {
  constructor(private service: CategoryService) {
    super();
  }
  @Get()
  async get(@Res() res: Response): Promise<IResponse> {
    await this.service.getSync();
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
