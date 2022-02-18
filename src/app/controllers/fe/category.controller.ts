import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  Put,
  UseGuards,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { CategoryService } from '../../services/category.service';
import { IResponse } from '../../interfaces/response.interface';
import { query, Response } from 'express';
import { ProductService } from '../../services/products.service';

/**
 * Controller for Category
 * @Author MvThang
 */
@Controller('/fe/v1/category')
export class CategoryController extends BaseController {
  constructor(
    private service: CategoryService,
    private productService: ProductService,
  ) {
    super();
  }

  /**
   * Fetch list categories in ddv_categories table
   * @param skip number
   * @param limit number
   * @param res categories[]
   * @returns
   */
  @Get()
  async fetchList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const categoriesMenuList = await this.service.getList(params);
    return this.responseSuccess(res, categoriesMenuList);
  }

  @Get(':id/products')
  async getProductsList(
    @Param('id') categoryId: number,
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.productService.getProductsListByCategoryId(
      categoryId,
      params,
    );
    return this.responseSuccess(res, result);
  }
}
