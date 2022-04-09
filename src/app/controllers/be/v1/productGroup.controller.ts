import { Body, Controller, Post, Put, Res, Param } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';

import { Response } from 'express';
import { ProductGroupService } from 'src/app/services/productGroup.service';
import { IResponse } from 'src/app/interfaces/response.interface';
import { ProductService } from '../../../services/products.service';
@Controller('/be/v1/product-group')
export class ProductGroupController extends BaseController {
  constructor(
    private service: ProductGroupService,
    private productService: ProductService,
  ) {
    super();
  }
  @Put('auto-generate')
  async autoGenerate(@Res() res: Response): Promise<IResponse> {
    const logs = await this.service.autoGenerate();
    return this.responseSuccess(res, logs, 'Tự tạo nhóm SP thành công.');
  }

  @Put('move-group/:product_id')
  async moveProductsListIntoNewGroup(
    @Param('product_id') product_id: number,
    @Body('groupId') groupId: number,
    @Body('productGroupName') productGroupName: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    console.log(product_id, groupId);
    await this.productService.moveParentChildenProductsIntoAnotherGroup(
      product_id,
      groupId,
      productGroupName,
    );
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
