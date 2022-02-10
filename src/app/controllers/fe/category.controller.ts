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

/**
 * Controller for Category
 * @Author MvThang
 */
@Controller('/fe/v1/category')
export class CategoryController extends BaseController {
  constructor(private service: CategoryService) {
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
  async fetchListCategoryMenu(
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const categoriesMenuList = await this.service.getList(params);
    return this.responseSuccess(res, categoriesMenuList);
  }
}
