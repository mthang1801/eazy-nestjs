import { Controller, Post, Put, Res } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';

import { Response } from 'express';
import { ProductGroupService } from 'src/app/services/productGroup.service';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('/be/v1/product-group')
export class ProductGroupController extends BaseController {
  constructor(private service: ProductGroupService) {
    super();
  }
  @Put('auto-generate')
  async autoGenerate(@Res() res: Response): Promise<IResponse> {
    const logs = await this.service.autoGenerate();
    return this.responseSuccess(res, logs, 'Tự tạo nhóm SP thành công.');
  }
}
